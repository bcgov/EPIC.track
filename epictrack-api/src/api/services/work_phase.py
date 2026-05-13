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
from operator import or_
from typing import List, Dict, Any, Union

from api.insights.utils import get_days_left_subquery, get_days_taken_subquery, get_extension_days_subquery, get_suspended_days_subquery, get_total_days_subquery, get_work_subquery
from api.models.ea_act import EAAct
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models import PhaseCode, WorkPhase, PRIMARY_CATEGORIES, db
from api.models.event_type import EventTypeEnum
from api.models.event_category import EventCategoryEnum
from api.models.staff_work_role import StaffWorkRole
from api.schemas.work import WorkPhaseSchema
from api.models.phase_code import PhaseVisibilityEnum
from api.models.event_template import EventPositionEnum
from api.services.task_template import TaskTemplateService
from api.services.phase_overage_responsibility_service import PhaseOverageResponsibilityService
from api.models.work import Work, WorkStateEnum
from api.models.phase_code import PhaseCode as Phase
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.project import Project

from .common_service import event_compare_func
from sqlalchemy import func, and_


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
    def find_by_work_and_phase(cls, work_id: int, phase_id: int, event_service) -> WorkPhase:
        """Find the workphase status by work_id and work_phase id"""
        work_phases_dict = cls.find_work_phases_by_work_ids([work_id])[0]
        work_phase = cls.find_work_phase_status(work_id, phase_id, work_phases_dict.get(work_id, []), event_service)
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
    def find_work_phases_status(cls, work_id: int, event_service):
        """Return the work phases with additional information"""
        return WorkPhaseService.find_multiple_works_phases_status({work_id: None}, event_service).get(
            work_id, []
        )

    @classmethod
    def find_multiple_works_phases_status(
        cls, work_params_dict: Dict[str, Union[int, None]], event_service
    ) -> Dict[int, List[Dict[str, Any]]]:
        """Return a dictionary with work_id and its work phases with additional information."""
        result_dict = {}
        work_ids = list(work_params_dict.keys())

        work_phases_dict = cls.find_work_phases_by_work_ids(work_ids)[0]

        for work_id, _work_phase_id in work_params_dict.items():
            result_dict[work_id] = cls.find_work_phase_status(
                work_id, None, work_phases_dict.get(work_id, []), event_service
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
    def find_work_phase_status(cls, work_id, work_phase_id, work_phases, event_service):
        """Find work phase status for the work Id.If work_phase_id is passed , only that phase is considered."""
        result = []
        events = event_service.find_events(work_id, event_categories=PRIMARY_CATEGORIES)
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
        any_incomplete_phase = any(getattr(e.event_configuration.work_phase, 'is_completed', True) is False for e in work_phase_events)
        total_number_of_milestones = len(work_phase_events)
        completed_ones = sum(1 for x in work_phase_events if x.actual_date is not None)
        milestone_progress = (completed_ones / total_number_of_milestones) * 100
        # If all milestones are complete but the phase is not marked complete, cap progress at 90% so progress bar is not full
        if milestone_progress == 100 and any_incomplete_phase:
            milestone_progress = 90
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
        all_events_completed = all(
            e.actual_date is not None for e in events
        )
        days_taken = 0
        # Completed phase
        if work_phase.is_completed or all_events_completed:
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
    def find_all_work_phases_with_additional_info(cls, staff_id: int = None, view_underage: bool = False) -> List[WorkPhase]:
        """Return all work phases.

        Work phase insights and overage/underage data.
        """
        work_subq = get_work_subquery()
        ext_subq = get_extension_days_subquery()
        sus_subq = get_suspended_days_subquery()
        total_days_subq = get_total_days_subquery(ext_subq)
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_left_subq = get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq)
        days_over_expr = days_taken_subq.c.days_taken - total_days_subq.c.total_days

        query = db.session.query(
            Work.id.label("work_id"),
            WorkPhase.id.label("work_phase_id"),
            Work.title.label("work_title"),
            Work.is_active.label("work_is_active"),
            WorkType.name.label("work_type_name"),
            WorkType.id.label("work_type_id"),
            Phase.name.label("phase_name"),
            Phase.id.label("phase_id"),
            # Legislated length with extensions
            (WorkPhase.number_of_days + func.coalesce(ext_subq.c.extension_days, 0)).label("legislated_length"),
            EAAct.name.label("ea_act_name"),
            WorkPhase.start_date.label("work_phase_start_date"),
            WorkPhase.end_date.label("work_phase_end_date"),
            total_days_subq.c.total_days.label("total_days"),
            days_taken_subq.c.days_taken.label("days_taken"),
            days_left_subq.c.days_left.label("days_left"),
            days_over_expr.label("days_over"),
            func.coalesce(
                func.array_agg(
                    PhaseOverageResponsibility.responsibility
                ).filter(
                    PhaseOverageResponsibility.responsibility.isnot(None),
                    PhaseOverageResponsibility.is_active.is_(True),
                    PhaseOverageResponsibility.is_deleted.is_(False)
                ),
                []
            ).label("phase_overage_responsibilities"),
        ).select_from(WorkPhase) \
         .join(Work, WorkPhase.work_id == Work.id) \
         .join(Phase, WorkPhase.phase_id == Phase.id) \
         .join(WorkType, Work.work_type_id == WorkType.id) \
         .join(Project, Work.project_id == Project.id) \
         .join(EAAct, Work.ea_act_id == EAAct.id) \
         .outerjoin(PhaseOverageResponsibility, PhaseOverageResponsibility.work_phase_id == WorkPhase.id)

        query = query \
            .outerjoin(ext_subq, ext_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(total_days_subq, total_days_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_left_subq, days_left_subq.c.work_phase_id == WorkPhase.id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.is_completed.is_(True),  # Only show data for completed phases
            Work.work_state.not_in([WorkStateEnum.WITHDRAWN]),
            or_(
                WorkPhase.legislated.is_(True),
                and_(
                    or_(WorkType.id == WorkTypeEnum.AMENDMENT.value, WorkType.id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR,
                ),
            ),
            days_over_expr < 0 if view_underage else days_over_expr > 0,
        )

        if staff_id:
            query = query.join(
                StaffWorkRole,
                and_(
                    StaffWorkRole.work_id == WorkPhase.work_id,
                    StaffWorkRole.is_active.is_(True),
                    StaffWorkRole.is_deleted.is_(False),
                    StaffWorkRole.staff_id == staff_id
                )
            )

        # Group by necessary fields to use aggregate functions like array_agg for PhaseOverageResponsibility
        query = query.group_by(
            Work.id,
            WorkPhase.id,
            Work.title,
            WorkType.name,
            WorkType.id,
            Phase.name,
            Phase.id,
            EAAct.name,
            WorkPhase.end_date,
            ext_subq.c.extension_days,
            total_days_subq.c.total_days,
            days_taken_subq.c.days_taken,
            days_left_subq.c.days_left
        ).order_by(Work.title)

        data = cls._serialize_work_phases(query)
        return data

    @classmethod
    def _serialize_work_phases(cls, query) -> List[dict]:
        """Serialize work phases from query result."""
        data = []
        for row in query.all():
            item = {
                "work_id": row.work_id,
                "work_type_id": row.work_type_id,
                "work_phase_id": row.work_phase_id,
                "work_title": row.work_title,
                "work_type_name": row.work_type_name,
                "phase_name": row.phase_name,
                "phase_id": row.phase_id,
                "work_phase_start_date": row.work_phase_start_date,
                "work_phase_end_date": row.work_phase_end_date,
                "ea_act_name": row.ea_act_name,
                "phase_overage_responsibilities": [p.value if hasattr(p, 'value') else p for p in row.phase_overage_responsibilities],
                "total_days": row.total_days,
                "days_taken": row.days_taken,
                "days_left": row.days_left,
                "legislated_length": row.legislated_length,
                "days_over": abs(row.days_over),
                "work_is_active": row.work_is_active,
            }
            data.append(item)
        return data
