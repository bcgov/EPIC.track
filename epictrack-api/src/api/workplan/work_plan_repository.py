# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Writes a new work's rows from its template version and plan, in Track's tables.

Only this module knows how a new work's rows are laid out, so another store, such as DEMI, can replace it.
Until the legacy tables go (S8), it also writes the legacy columns and copies the legacy actions, so the current
engine can run the work if an environment switches back.
"""
import uuid
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List

from api.models import (
    ActionConfiguration, CalendarEvent, Event, EventConfiguration, OutcomeConfiguration, Work, WorkCalendarEvent,
    WorkPhase, WorkTemplateVersion, db)
from api.models.action_template import ActionTemplate
from api.models.event_category import EventCategoryEnum
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.outcome_template import OutcomeTemplate
from api.models.phase_code import PhaseVisibilityEnum
from api.models.template_event import AnchorPoint
from api.models.template_phase import DayBasis, TimeLimitKind
from api.schemas.request import ActionConfigurationBodyParameterSchema
from api.schemas.response import ActionTemplateResponseSchema
from api.workplan.core import template as tpl
from api.workplan.core.new_work import PlannedPhase
from api.workplan.template_repository import Lineage, TemplateRepository


class WorkPlanRepository:  # pylint: disable=too-few-public-methods
    """New works' rows in Track's tables."""

    @staticmethod
    def create(work: Work, record: WorkTemplateVersion, version: tpl.Version, plan: List[PlannedPhase]) -> List[WorkPhase]:
        """Write the work's phases, milestones, outcomes and dated events, and return its phases in order."""
        writer = _Writer(work, TemplateRepository.lineage(record), version)
        return [
            writer.phase(phase, planned, order)
            for order, (phase, planned) in enumerate(zip(version.phases, plan), start=1)
        ]


class _Writer:  # pylint: disable=too-few-public-methods
    def __init__(self, work: Work, lineage: Lineage, version: tpl.Version):
        self.work = work
        self.lineage = lineage
        self.legacy = _LegacyOutcomes(version)

    def _date(self, day: int) -> datetime:
        return self.work.start_date + timedelta(days=day)

    def phase(self, phase: tpl.Phase, planned: PlannedPhase, order: int) -> WorkPhase:
        """Write one phase with its milestones, outcomes and dated events."""
        work_phase = WorkPhase(
            work_id=self.work.id, phase_id=phase.phase_code_id, name=phase.name, sort_order=order,
            start_date=self._date(planned.start_day), end_date=self._date(planned.end_day),
            number_of_days=phase.number_of_days, legislated=phase.time_limit_kind == tpl.LEGISLATED,
            visibility=PhaseVisibilityEnum(phase.visibility), template_phase_id=self.lineage.phases[phase.phase_code_id],
            time_limit_kind=TimeLimitKind(phase.time_limit_kind), day_basis=DayBasis(phase.day_basis),
            is_intake=phase.is_intake, requires_overage_responsibility=phase.requires_overage_responsibility,
        )
        db.session.add(work_phase)
        db.session.flush()
        configurations = {
            event.key: self._configuration(work_phase, event, place) for place, event in enumerate(phase.events, start=1)
        }
        db.session.flush()
        for event in phase.events:
            if event.anchor_key is not None:
                anchor_id = configurations[event.anchor_key].id
                configurations[event.key].anchor_configuration_id = anchor_id
                configurations[event.key].parent_id = anchor_id
            self._outcomes(configurations[event.key], event)
        self._events(phase, planned, configurations)
        return work_phase

    def _configuration(self, work_phase: WorkPhase, event: tpl.Event, place: int) -> EventConfiguration:
        configuration = EventConfiguration(
            work_phase_id=work_phase.id, name=event.name, event_type_id=event.event_type_id,
            event_category_id=event.event_category_id, event_position=EventPositionEnum(event.event_position),
            visibility=EventTemplateVisibilityEnum(event.visibility), number_of_days=event.number_of_days,
            multiple_days=event.multiple_days, sort_order=place, repeat_count=1,
            template_event_id=self.lineage.events[event.key], role=event.role,
            anchor_point=AnchorPoint(event.anchor_point), offset_days=event.offset_days, repeatable=event.repeatable,
            sets_work_start=event.sets_work_start, sets_official_start=event.sets_official_start,
            template_id=event.legacy_event_template_id, start_at=_legacy_start_at(event),
        )
        db.session.add(configuration)
        return configuration

    def _outcomes(self, configuration: EventConfiguration, event: tpl.Event):
        for place, outcome in enumerate(event.outcomes, start=1):
            legacy = self.legacy.named(event.legacy_event_template_id, outcome.name)
            outcome_configuration = OutcomeConfiguration(
                event_configuration_id=configuration.id, name=outcome.name, sort_order=place,
                template_outcome_id=self.lineage.outcomes[(event.key, place)],
                outcome_template_id=legacy.id if legacy else None,
            )
            db.session.add(outcome_configuration)
            db.session.flush()
            for action in self.legacy.actions(legacy):
                # Copied the way the current engine copies them.
                db.session.add(ActionConfiguration(**ActionConfigurationBodyParameterSchema().load({
                    **ActionTemplateResponseSchema().dump(action),
                    "outcome_configuration_id": outcome_configuration.id, "action_template_id": action.id,
                })))

    def _events(self, phase: tpl.Phase, planned: PlannedPhase, configurations: Dict[uuid.UUID, EventConfiguration]):
        events_by_key = {event.key: event for event in phase.events}
        dated = [milestone for milestone in planned.milestones if milestone.dated]
        created: Dict[uuid.UUID, Event] = {}
        # Top-level milestones first, since their children are dated from their events.
        for milestone in sorted(dated, key=lambda m: m.source_key is not None):
            event, configuration = events_by_key[milestone.key], configurations[milestone.key]
            source = created[milestone.source_key].id if milestone.source_key else None
            if source and event.event_category_id == EventCategoryEnum.CALENDAR.value:
                calendar_event = CalendarEvent(
                    name=event.name, anticipated_date=self._date(milestone.day), number_of_days=event.number_of_days)
                db.session.add(calendar_event)
                db.session.flush()
                db.session.add(WorkCalendarEvent(
                    calendar_event_id=calendar_event.id, source_event_id=source,
                    event_configuration_id=configuration.id))
                continue
            created[milestone.key] = Event(
                name=event.name, anticipated_date=self._date(milestone.day), number_of_days=event.number_of_days,
                event_configuration_id=configuration.id, source_event_id=source, work_id=self.work.id,
            )
            db.session.add(created[milestone.key])
            db.session.flush()


class _LegacyOutcomes:
    """The legacy outcome and action templates a version 1 milestone came from."""

    def __init__(self, version: tpl.Version):
        legacy_ids = [event.legacy_event_template_id for _, event in version.events() if event.legacy_event_template_id]
        self.outcomes = defaultdict(list)
        for outcome in OutcomeTemplate.query.filter(
                OutcomeTemplate.event_template_id.in_(legacy_ids), OutcomeTemplate.is_active.is_(True)
        ).order_by(OutcomeTemplate.sort_order, OutcomeTemplate.id):
            self.outcomes[outcome.event_template_id].append(outcome)
        self.actions_by_outcome = defaultdict(list)
        outcome_ids = [outcome.id for outcomes in self.outcomes.values() for outcome in outcomes]
        for action in sorted(ActionTemplate.find_by_outcome_ids(outcome_ids), key=lambda a: (a.sort_order, a.id)):
            self.actions_by_outcome[action.outcome_id].append(action)

    def named(self, legacy_event_template_id, name):
        """Return the legacy outcome with this name, if the milestone has one."""
        return next((o for o in self.outcomes.get(legacy_event_template_id, []) if o.name == name), None)

    def actions(self, legacy_outcome) -> List[ActionTemplate]:
        """Return the legacy outcome's active actions, in order."""
        return self.actions_by_outcome.get(legacy_outcome.id, []) if legacy_outcome else []


def _legacy_start_at(event: tpl.Event) -> str:
    """The milestone's anchor and offset the way the current engine writes start_at."""
    if event.anchor_point == tpl.END:
        return f"number_of_days{event.offset_days:+d}"
    return str(event.offset_days)
