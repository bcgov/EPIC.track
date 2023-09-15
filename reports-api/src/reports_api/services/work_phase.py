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
from reports_api.models import PhaseCode, WorkPhase, db
from reports_api.schemas.work_v2 import WorkPhaseSchema
from reports_api.services.task_template import TaskTemplateService


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
            .order_by(PhaseCode.sort_order)
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
    def get_template_upload_status(cls, work_id: int, phase_id: int) -> bool:
        """Check if template can be uploaded for given work phase"""
        result = {}
        work_phase = cls.find_by_work_nd_phase(work_id, phase_id)
        result["task_added"] = work_phase.task_added
        template_available = TaskTemplateService.check_template_exists(
            work_type_id=work_phase.work.work_type_id, phase_id=phase_id
        )
        result["template_available"] = template_available
        return result
