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
from datetime import timezone

from api.models import PhaseCode, WorkPhase, db
from api.models.event_type import EventTypeEnum
from api.schemas.work_v2 import WorkPhaseSchema
from api.models.phase_code import PhaseVisibilityEnum
from api.services.event import EventService
from api.services.task_template import TaskTemplateService


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
    def find_work_phases_status(cls, work_id: int):
        """Return the work phases with additional information"""
        work_phases = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == work_id,
                WorkPhase.is_active.is_(True),
                WorkPhase.is_deleted.is_(False),
                WorkPhase.visibility != PhaseVisibilityEnum.HIDDEN.value
            )
            .order_by(WorkPhase.sort_order)
            .all()
        )
        result = []
        events = EventService.find_events(work_id)
        for work_phase in work_phases:
            result_item = {}
            result_item["work_phase"] = work_phase
            total_days = (
                work_phase.end_date.date() - work_phase.start_date.date()
            ).days
            work_phase_events = list(
                filter(
                    lambda x, _work_phase_id=work_phase.id: x.event_configuration.work_phase_id == _work_phase_id,
                    events,
                )
            )
            work_phase_events = sorted(work_phase_events, key=functools.cmp_to_key(EventService.event_compare_func))
            suspended_days = functools.reduce(
                lambda x, y: x + y,
                map(
                    lambda x: x.number_of_days
                    if x.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_RESUMPTION.value and
                    x.actual_date is not None else 0,
                    work_phase_events,
                ),
            )
            result_item["total_number_of_days"] = total_days - suspended_days
            next_milestone_event = next((x for x in work_phase_events if x.actual_date is None), None)
            if next_milestone_event:
                result_item["next_milestone"] = next_milestone_event.name
            total_number_of_milestones = len(work_phase_events)
            completed_ones = len(list(filter(lambda x: x.actual_date is not None, work_phase_events)))
            result_item["milestone_progress"] = (completed_ones / total_number_of_milestones) * 100
            days_passed = 0
            if work_phase.work.current_work_phase_id == work_phase.id:
                if work_phase.is_suspended:
                    days_passed = (work_phase.suspended_date.date() - work_phase.start_date.date()).days
                else:
                    days_passed = (datetime.datetime.now(timezone.utc).date() - work_phase.start_date.date()).days
                    days_passed = 0 if days_passed < 0 else days_passed
                days_left = (total_days - suspended_days) - days_passed
            else:
                days_left = total_days - suspended_days
            result_item["days_left"] = days_left
            result.append(result_item)
        return result
