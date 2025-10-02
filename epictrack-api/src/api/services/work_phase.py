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
from api.schemas.work import WorkPhaseSchema
from api.models.phase_code import PhaseVisibilityEnum
from api.models.event_template import EventPositionEnum
from api.services.event import EventService
from api.services.task_template import TaskTemplateService
from api.services.phase_overage_responsibility_service import PhaseOverageResponsibilityService
from api.models.work import Work
from .common_service import event_compare_func
from api.schemas import response as res


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
    def find_by_work_and_phase(cls, work_id: int, phase_id: int) -> WorkPhase:
        """Find the workphase status by work_id and work_phase id"""
        work_phases_dict = cls.find_work_phases_by_work_ids([work_id])[0]
        work_phase = cls.find_work_phase_status(work_id, phase_id, work_phases_dict.get(work_id, []))
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
            result_dict[work_id] = cls.find_work_phase_status(
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
    def save_notes(cls, work_phase_id: int, notes: str) -> WorkPhase:
        """Save overage responsibility notes in the work phase."""
        work_phase = WorkPhase.find_by_id(work_phase_id)
        work_phase.responsibility_notes = notes
        work_phase.save()
        return work_phase

    @classmethod
    def find_work_phase_status(cls, work_id, work_phase_id, work_phases):
        """Find work phase status for the work Id.If work_phase_id is passed , only that phase is considered."""
        result = []
        events = EventService.find_events(work_id, event_categories=PRIMARY_CATEGORIES)
        if work_phase_id is not None:
            work_phases = [wp for wp in work_phases if wp.id == work_phase_id]
        for index, work_phase in enumerate(work_phases, start=1):
            result_item = {"work_phase": work_phase}
            work_phase_events = cls._filter_sort_events(events, work_phase)
            extension_events = [
                e for e in work_phase_events
                if e.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_EXTENSION.value
            ]
            extension_days = sum(e.number_of_days for e in extension_events)
            if work_phase.number_of_days:
                total_days = work_phase.number_of_days + extension_days
            else:
                total_days = (work_phase.end_date.date() - work_phase.start_date.date()).days

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

            days_left = cls._get_days_left(suspended_days, total_days, work_phase, work_phase_events)
            result_item["days_left"] = days_left
            days_taken = cls._get_days_taken(work_phase, work_phase_events, suspended_days)
            result_item["days_taken"] = days_taken if days_taken else 0
            result_item["is_last_phase"] = index == len(work_phases)
            result_item["overage_responsibility"] = PhaseOverageResponsibilityService.find_by_work_phase_id(int(work_phase.id), is_deleted=False)
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
        next_milestone = (
            remaining_milestone_events[0] if remaining_milestone_events else None
        )
        end_milestone = next(
            (
                event
                for event in work_phase_events
                if event.event_position == EventPositionEnum.END.value
            ),
            None,
        )
        if next_milestone and end_milestone and next_milestone.id == end_milestone.id:
            if end_milestone.id == remaining_milestone_events[-1].id:
                next_milestone = end_milestone
            else:
                next_milestone = remaining_milestone_events[0]
        result["next_milestone"] = next_milestone.name if next_milestone else None
        result["next_milestone_date"] = (
            remaining_milestone_events[0].anticipated_date
            if remaining_milestone_events
            else None
        )
        result["end_milestone"] = end_milestone

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
            decision_milestones[-1].outcome.name if decision_milestones and decision_milestones[-1].outcome else None
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
    def _get_days_left(cls, suspended_days, total_days, work_phase, events):
        if (
            work_phase.work.current_work_phase_id == work_phase.id
            and work_phase.is_completed is False
        ):
            days_passed = cls._get_days_taken(work_phase, events, suspended_days)
            days_left = (total_days - suspended_days) - days_passed
        else:
            days_left = total_days - suspended_days
        return days_left

    @classmethod
    def _get_days_taken(cls, work_phase, events, suspended_days=0):
        days_taken = 0
        # Completed phase
        if work_phase.is_completed:
            start_event = next(
                (
                    e
                    for e in events
                    if e.event_configuration.event_position.name == "START"
                    and e.actual_date is not None
                ),
                None,
            )
            end_event = next(
                (
                    e
                    for e in events
                    if e.event_configuration.event_position.name == "END"
                    and e.actual_date is not None
                ),
                None,
            )
            if start_event and end_event:
                days_taken = (end_event.actual_date.date() - start_event.actual_date.date()).days
            else:
                days_taken = 0
        # Current phase uncompleted phase
        elif work_phase.work.current_work_phase_id == work_phase.id:
            if work_phase.is_suspended:
                days_taken = (
                    work_phase.suspended_date.date() - work_phase.start_date.date()
                ).days
            else:
                days_taken = (
                    datetime.datetime.now(timezone.utc).date()
                    - work_phase.start_date.date()
                ).days
                days_taken = max(0, days_taken)

        days_taken = max(0, days_taken - suspended_days)
        return days_taken

    @classmethod
    def find_all_work_phases_with_additional_info(cls, legislated: bool = None) -> List[WorkPhase]:
        """Return all work phases."""
        work_phases = WorkPhase.find_by_params({'legislated': legislated})
        phase_by_work = defaultdict(list)

        data = []
        for phase in work_phases:
            phase_by_work[phase.work_id].append(phase)

        # Grouped by work_id to process together is faster
        for work_id, group in phase_by_work.items():
            phase_with_info = cls.find_work_phase_status(work_id, None, group)
            data.extend(phase_with_info)

        data = res.WorkPhaseAdditionalInfoResponseSchema(many=True).dump(data)

        for item in data:
            item["work"] = res.WorkResponseSchema().dump(Work.find_by_id(item["work_phase"]["work_id"]))

        return data
