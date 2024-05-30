# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Work phases."""
import datetime
import functools
from collections import defaultdict
from datetime import timezone
from typing import List, Dict, Any, Union

from api.models import PhaseCode, WorkPhase, PRIMARY_CATEGORIES, db
from api.models.event_type import EventTypeEnum
from api.models.event_category import EventCategoryEnum
from api.schemas.work_v2 import WorkPhaseSchema
from api.models.phase_code import PhaseVisibilityEnum
from api.services.event import EventService
from api.services.task_template import TaskTemplateService
from .common_service import event_compare_func


class WorkPhaseService:  # pylint: disable=too-few-public-methods
    """Service to manage work phase related operations."""

    @classmethod
    def create_bulk_work_phases(cls, work_phases):
        """Bulk create work phases from given list of dicts"""
        work_phases_schema = WorkPhaseSchema(many=True)
        work_phases = work_phases_schema.load(work_phases)
        for work_phase in work_phases:
            instance = WorkPhase(**work_phase)
            instance.flush()
        WorkPhase.commit()

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Find work phases by work id"""
        work_phases = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(WorkPhase.work_id == work_id, WorkPhase.is_active.is_(True))
            .order_by(WorkPhase.id)
            .all()
        )
        return work_phases

    @classmethod
    def find_by_work_nd_phase(cls, work_id: int, phase_id: int) -> WorkPhase:
        """Find the workphase by work and phase"""
        work_phase = (
            db.session.query(WorkPhase)
            .filter(
                WorkPhase.work_id == work_id,
                WorkPhase.phase_id == phase_id,
                WorkPhase.is_active.is_(True),
            )
            .scalar()
        )
        return work_phase

    @classmethod
    def get_template_upload_status(cls, work_phase_id: int) -> bool:
        """Check if template can be uploaded for given work phase"""
        result = {}
        work_phase = WorkPhase.find_by_id(work_phase_id)
        result["task_added"] = work_phase.task_added
        template_available = TaskTemplateService.check_template_exists(
            work_type_id=work_phase.work.work_type_id,
            phase_id=work_phase.phase_id,
            ea_act_id=work_phase.work.ea_act_id,
        )
        result["template_available"] = template_available
        return result

    @classmethod
    def find_current_work_phase(cls, work_id: int) -> WorkPhase:
        """Find the current work phase which is in progress"""
        work_phase = (
            db.session.query(WorkPhase)
            .filter(
                WorkPhase.work_id == work_id,
                WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                WorkPhase.is_completed.is_(False),
            )
            .order_by(WorkPhase.sort_order)
            .first()
        )
        return work_phase

    @classmethod
    def find_work_phases_status(cls, work_id: int):
        """Return the work phases with additional information"""
        return WorkPhaseService.find_multiple_works_phases_status({work_id: None}).get(
            work_id, []
        )

    @classmethod
    def find_multiple_works_phases_status(
        cls, work_params_dict: Dict[str, Union[int, None]]
    ) -> Dict[int, List[Dict[str, Any]]]:
        """Return a dictionary with work_id and its work phases with additional information."""
        result_dict = {}
        work_ids = list(work_params_dict.keys())

        work_phases_dict = cls.find_work_phases_by_work_ids(work_ids)[0]

        for work_id, _work_phase_id in work_params_dict.items():
            result_dict[work_id] = cls._find_work_phase_status(
                work_id, None, work_phases_dict.get(work_id, [])
            )

        return result_dict

    @classmethod
    def find_work_phases_by_work_ids(cls, work_ids):
        """Query work phases for given work_ids."""
        work_phases_dict = (
            db.session.query(WorkPhase.work_id, WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id.in_(work_ids),
                WorkPhase.is_deleted.is_(False),
                WorkPhase.visibility != PhaseVisibilityEnum.HIDDEN.value,
            )
            .order_by(WorkPhase.sort_order)
            .all()
        )
        total_work_phases = len(work_phases_dict)
        work_phases_dict = list(
            filter(lambda x: x[1].is_active is True, work_phases_dict)
        )
        result_dict = defaultdict(list)
        for work_id, work_phase in work_phases_dict:
            result_dict[work_id].append(work_phase)

        return result_dict, total_work_phases

    @classmethod
    def _find_work_phase_status(cls, work_id, work_phase_id, work_phases):
        """Find work phase status for the work Id.If work_phase_id is passed , only that phase is considered."""
        result = []
        events = EventService.find_events(work_id, event_categories=PRIMARY_CATEGORIES)
        if work_phase_id is not None:
            work_phases = [wp for wp in work_phases if wp.id == work_phase_id]
        for index, work_phase in enumerate(work_phases, start=1):
            result_item = {"work_phase": work_phase}
            total_days = (
                work_phase.end_date.date() - work_phase.start_date.date()
            ).days
            work_phase_events = cls._filter_sort_events(events, work_phase)

            suspended_days = functools.reduce(
                lambda x, y: x + y,
                map(
                    lambda x: (
                        x.number_of_days
                        if x.event_configuration.event_type_id
                        == EventTypeEnum.TIME_LIMIT_RESUMPTION.value
                        and x.actual_date is not None
                        else 0
                    ),
                    work_phase_events,
                ),
            )
            result_item["total_number_of_days"] = total_days - suspended_days

            milestone_info = cls._get_milestone_information(work_phase_events)
            result_item = {**result_item, **milestone_info}

            days_left = cls._get_days_left(suspended_days, total_days, work_phase)
            result_item["days_left"] = days_left
            result_item["is_last_phase"] = index == len(work_phases)
            result.append(result_item)
        return result

    @classmethod
    def _get_milestone_information(cls, work_phase_events):
        result = {}
        completed_milestone_events = [
            event for event in work_phase_events if event.actual_date
        ]
        result["current_milestone"] = (
            completed_milestone_events[-1].name if completed_milestone_events else None
        )

        remaining_milestone_events = [
            event for event in work_phase_events if event.actual_date is None
        ]
        result["next_milestone"] = (
            remaining_milestone_events[0].name if remaining_milestone_events else None
        )
        result["next_milestone_date"] = (
            remaining_milestone_events[0].anticipated_date
            if remaining_milestone_events
            else None
        )

        decision_milestones = [
            event
            for event in work_phase_events
            if event.event_configuration.event_category_id
            == EventCategoryEnum.DECISION.value
            and event.actual_date
        ]

        result["decision_milestone"] = (
            decision_milestones[-1].name if decision_milestones else None
        )
        result["decision"] = (
            decision_milestones[-1].outcome.name if decision_milestones else None
        )
        result["decision_milestone_date"] = (
            decision_milestones[-1].actual_date if decision_milestones else None
        )

        result["milestone_progress"] = cls._calculate_milestone_progress(
            work_phase_events
        )

        return result

    @classmethod
    def _calculate_milestone_progress(cls, work_phase_events):
        total_number_of_milestones = len(work_phase_events)
        completed_ones = sum(1 for x in work_phase_events if x.actual_date is not None)
        milestone_progress = (completed_ones / total_number_of_milestones) * 100
        return milestone_progress

    @classmethod
    def _filter_sort_events(cls, events, work_phase):
        work_phase_events = [
            x for x in events if x.event_configuration.work_phase_id == work_phase.id
        ]
        work_phase_events = sorted(
            work_phase_events, key=functools.cmp_to_key(event_compare_func)
        )
        return work_phase_events

    @classmethod
    def _get_days_left(cls, suspended_days, total_days, work_phase):
        if (
            work_phase.work.current_work_phase_id == work_phase.id
            and work_phase.is_completed is False
        ):
            if work_phase.is_suspended:
                days_passed = (
                    work_phase.suspended_date.date() - work_phase.start_date.date()
                ).days
            else:
                days_passed = (
                    datetime.datetime.now(timezone.utc).date()
                    - work_phase.start_date.date()
                ).days
                days_passed = 0 if days_passed < 0 else days_passed
            days_left = (total_days - suspended_days) - days_passed
        else:
            days_left = total_days - suspended_days
        return days_left
