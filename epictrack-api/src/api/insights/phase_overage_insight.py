"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType
from api.services.work_phase import WorkPhaseService
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models.project import Project
from api.insights.insights_table_filters import build_insights_filters
from api.utils.helpers import filter_query_by_staff


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class AveragePhaseOverageInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []
        selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None
        query = db.session.query(WorkPhase).join(Work, WorkPhase.work_id == Work.id)

        if filters:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.outerjoin(PhaseOverageResponsibility, WorkPhase.id == PhaseOverageResponsibility.work_phase_id)

        if staff_id:
            query = filter_query_by_staff(query, staff_id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.legislated.is_(True),
            *filter_exprs if filter_exprs else [],
        )

        if selected_work_type:
            query = query.filter(Work.work_type_id == selected_work_type.id)

        work_phases = query.all()

        overage_by_phase = {
            phase.phase_id: {
                "phase": phase.name,
                "total_overage": 0,
                "average_overage": 0,
                "count": 0
            }
            for phase in work_phases
        }

        unique_work_ids = list(set(phase.work_id for phase in work_phases))

        for work_id in unique_work_ids:
            phases_for_work = [phase for phase in work_phases if phase.work_id == work_id]
            phase_stats = WorkPhaseService.find_work_phase_status(work_id, None, phases_for_work)
            for stats in phase_stats:
                if stats["days_left"] < 0:
                    overage_by_phase[stats["work_phase"].phase_id]["total_overage"] += abs(stats["days_left"])
                    overage_by_phase[stats["work_phase"].phase_id]["count"] += 1

        for phase_id, stats in overage_by_phase.items():
            if stats["count"] > 0:
                overage_by_phase[phase_id]["average_overage"] = stats["total_overage"] / stats["count"]
            else:
                overage_by_phase[phase_id]["average_overage"] = 0

        return self._format_data(overage_by_phase)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        phase_insights = [
            {
                "phase_id": phase_id,
                "phase": phase_info['phase'],
                "total_overage": phase_info['total_overage'],
                "average_overage": phase_info['average_overage'],
                "count": phase_info['count'],
            }
            for phase_id, phase_info in data.items()
        ]
        return sorted(phase_insights, key=lambda x: x['average_overage'], reverse=True)
