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
"""Loads template versions from Track's tables.

Only this module knows the tables, so another store, such as DEMI, can replace it.
"""
from typing import Optional

from api.models import TemplateEvent, WorkTemplateVersion, WorkType, db
from api.workplan.core import template as tpl


class TemplateRepository:
    """Template versions in Track's tables."""

    @staticmethod
    def find(template_id: int, version: int) -> Optional[WorkTemplateVersion]:
        """Return one version of a template."""
        return WorkTemplateVersion.query.filter_by(work_template_id=template_id, version=version).one_or_none()

    @staticmethod
    def load(record: WorkTemplateVersion) -> tpl.Version:
        """Return a saved version as plain data."""
        template = record.work_template
        phase_codes = {phase.id: phase.phase_code_id for phase in record.phases}
        keys = {event.id: event.key for phase in record.phases for event in phase.events}
        return tpl.Version(
            work_type_id=template.work_type_id, ea_act_id=template.ea_act_id,
            rule_set=db.session.get(WorkType, template.work_type_id).rule_set,
            phases=[
                tpl.Phase(
                    phase_code_id=phase.phase_code_id, name=phase.name, time_limit_kind=phase.time_limit_kind.value,
                    number_of_days=phase.number_of_days, day_basis=phase.day_basis.value,
                    start_usually_set_by=phase.start_usually_set_by.value, visibility=phase.visibility.value,
                    in_default_sequence=phase.in_default_sequence, is_intake=phase.is_intake,
                    requires_overage_responsibility=phase.requires_overage_responsibility,
                    events=[_load_event(event, phase_codes, keys) for event in phase.events],
                )
                for phase in record.phases
            ],
        )


def _load_event(event: TemplateEvent, phase_codes: dict, keys: dict) -> tpl.Event:
    return tpl.Event(
        key=event.key, name=event.name, event_type_id=event.event_type_id,
        event_category_id=event.event_category_id, visibility=event.visibility.value,
        event_position=event.event_position.value, role=event.role,
        anchor_key=event.anchor.key if event.anchor else None, anchor_point=event.anchor_point.value,
        offset_days=event.offset_days, number_of_days=event.number_of_days, multiple_days=event.multiple_days,
        repeatable=event.repeatable, sets_work_start=event.sets_work_start,
        sets_official_start=event.sets_official_start, legacy_event_template_id=event.legacy_event_template_id,
        outcomes=[
            tpl.Outcome(name=outcome.name, effects=[
                tpl.Effect(
                    kind=effect.kind, target_phase_code_id=phase_codes.get(effect.target_template_phase_id),
                    target_event_key=keys.get(effect.target_template_event_id), params=dict(effect.params),
                )
                for effect in outcome.effects
            ])
            for outcome in event.outcomes
        ],
    )
