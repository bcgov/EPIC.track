"""Insight generator for phase resource grouped by phases"""

from typing import List


from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType
from api.models.project import Project
from api.models.ea_act import EAAct
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.services.work_phase import WorkPhaseService
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class OverageByActInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []
        selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None

        query = db.session.query(
            WorkPhase,
            Work.ea_act_id.label("ea_act_id"),
            EAAct.name.label("ea_act")
        ).join(Work, WorkPhase.work_id == Work.id).join(EAAct, Work.ea_act_id == EAAct.id)

        if filters:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)

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

        results = query.all()

        ea_act_list = list(set(ea_act_id for _, ea_act_id, _ in results))

        overage_by_act = {
            ea_act_id: {
                "name": EAAct.find_by_id(ea_act_id).name,
                "phases": {
                    phase.phase_id: {
                        "phase": phase.name,
                        "count_with_overages": 0,
                        "count": 0,
                        "percent_overage": 0,
                    }
                    for phase, _, _ in results
                }
            }
            for ea_act_id in ea_act_list
        }

        unique_work_ids = list(set(phase.work_id for phase, _, _ in results))

        for work_id in unique_work_ids:
            phases_for_work = [phase for phase, _, _ in results if phase.work_id == work_id]
            phase_stats = WorkPhaseService.find_work_phase_status(work_id, None, phases_for_work)
            for stats in phase_stats:
                ea_act_id = next(
                    ea_id for phase, ea_id, _ in results
                    if phase.phase_id == stats["work_phase"].phase_id
                )
                phase_id = stats["work_phase"].phase_id
                overage_by_act[ea_act_id]["phases"][phase_id]["count"] += 1
                if stats["days_left"] < 0:
                    overage_by_act[ea_act_id]["phases"][phase_id]["count_with_overages"] += 1

        return self._format_data(overage_by_act)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        result = []
        for act_id, act_info in data.items():
            for phase_id, phase_info in act_info["phases"].items():
                if phase_info["count_with_overages"] > 0:
                    result.append({
                        "ea_act_id": act_id,
                        "ea_act_name": act_info["name"],
                        "phase_id": phase_id,
                        "phase_name": phase_info["phase"],
                        "count_with_overages": phase_info["count_with_overages"],
                        "count": phase_info["count"],
                        "percent_overage": round(phase_info["count_with_overages"] / phase_info["count"] * 100) if phase_info["count"] > 0 else 0,
                        "phase_act": f"{phase_info['phase']} - {act_info['name']}",
                    })
        result.sort(key=lambda x: x["percent_overage"], reverse=True)
        return result
