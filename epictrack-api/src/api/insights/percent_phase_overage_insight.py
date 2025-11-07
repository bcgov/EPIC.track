"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType
from api.models.phase_code import PhaseCode as Phase
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import get_days_left_subquery, get_days_taken_subquery, get_extension_days_subquery, get_suspended_days_subquery, get_total_days_subquery, get_work_subquery
from sqlalchemy import func, case, Float, cast, or_


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class PercentPhaseOverageInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data for the insight"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []
        selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None

        # Build all necessary subqueries
        work_subq = get_work_subquery()
        ext_subq = get_extension_days_subquery()
        sus_subq = get_suspended_days_subquery()
        total_days_subq = get_total_days_subquery(ext_subq)
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_left_subq = get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq)

        # pylint: disable=duplicate-code

        query = db.session.query(
            Phase.name.label("phase_name"),
            (
                (cast(func.count(case((days_left_subq.c.days_left < 0, 1))), Float)
                 / cast(func.count(func.distinct(WorkPhase.id)), Float)) * 100
            ).label("percent_with_overages"),
        ).select_from(WorkPhase) \
         .join(Work, WorkPhase.work_id == Work.id) \
         .join(Phase, WorkPhase.phase_id == Phase.id) \
         .join(WorkType, Work.work_type_id == WorkType.id)

        if filters:
            query = query.join(Project, Work.project_id == Project.id)

        if staff_id:
            query = query.join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
            query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
            query = query.filter(Staff.id == staff_id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.name == "Amendment"
            ),
            Phase.is_active.is_(True),
            Phase.is_deleted.is_(False),
            *filter_exprs if filter_exprs else [],
        )

        if selected_work_type:
            query = query.filter(Work.work_type_id == selected_work_type.id)

        query = query \
            .outerjoin(ext_subq, ext_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(sus_subq, sus_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(total_days_subq, total_days_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_left_subq, days_left_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(work_subq, work_subq.c.work_phase_id == WorkPhase.id) \
            .group_by(Phase.name)
        # pylint: enable=duplicate-code
        # Only include the data where percent is not 0
        query = query.having(
            (
                cast(func.count(func.distinct(case((days_left_subq.c.days_left < 0, 1)))), Float)
                / cast(func.count(func.distinct(WorkPhase.id)), Float)
            ) > 0
        )

        work_phases = query.all()

        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        phase_insights = [
            {
                "phase": phase[0],
                "percent_overage": round(phase[1], 2),
            }
            for phase in data
        ]
        return sorted(phase_insights, key=lambda x: x['percent_overage'], reverse=True)
