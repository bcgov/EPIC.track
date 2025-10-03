"""Insight generator for phase resource grouped by phases"""

from typing import List


from api.models import db
from api.models.work_phase import WorkPhase
from api.models.phase_code import PhaseCode
from api.models.work import Work
from api.models.phase_overage_responsibility import OverageResponsibilityEnum
from api.models.work_type import WorkType
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.services.work_phase import WorkPhaseService
from api.schemas.response.phase_overage_responsibility_response import PhaseOverageResponsibilityResponseSchema
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class OverageByResponsibilityInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", selected_phase_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []
        selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None
        selected_phase = PhaseCode.find_by_id(int(selected_phase_id)) if selected_phase_id != "all" else None

        query = db.session.query(WorkPhase).join(Work, WorkPhase.work_id == Work.id)

        if filters:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(PhaseOverageResponsibility, WorkPhase.id == PhaseOverageResponsibility.work_phase_id)

        if staff_id:
            query = query.join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
            query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
            query = query.filter(Staff.id == staff_id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.legislated.is_(True),
            *filter_exprs if filter_exprs else [],
        )
        if selected_work_type:
            query = query.filter(Work.work_type_id == selected_work_type.id)
        if selected_phase:
            query = query.filter(WorkPhase.phase_id == selected_phase.id)
        work_phases = query.all()

        overage_by_responsibility = {
            responsibility.value: {
                "name": responsibility.value,
                "responsibility_id": None,
                "count": 0,
            }
            for responsibility in OverageResponsibilityEnum
        }

        unique_work_ids = list(set(phase.work_id for phase in work_phases))

        for work_id in unique_work_ids:
            phases_for_work = [phase for phase in work_phases if phase.work_id == work_id]
            phase_stats = WorkPhaseService.find_work_phase_status(work_id, None, phases_for_work)
            for stats in phase_stats:
                responsibility_list = PhaseOverageResponsibilityResponseSchema(many=True).dump(stats["overage_responsibility"])
                for responsibility in responsibility_list:
                    overage_by_responsibility[responsibility["responsibility"]]["count"] += 1
                    if overage_by_responsibility[responsibility["responsibility"]]["responsibility_id"] is None:
                        overage_by_responsibility[responsibility["responsibility"]]["responsibility_id"] = responsibility["id"]

        return self._format_data(overage_by_responsibility)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        overage_insights = [
            {
                "responsibility_name": responsibility_name,
                "responsibility_id": responsibility_info['responsibility_id'],
                "count": responsibility_info['count'],
            }
            for responsibility_name, responsibility_info in data.items()
            if responsibility_info["responsibility_id"] is not None
        ]
        return sorted(overage_insights, key=lambda x: x['count'], reverse=True)
