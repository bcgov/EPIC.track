"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.phase_code import PhaseCode as Phase
from api.models.project import Project
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import get_days_left_subquery, get_days_taken_subquery, get_extension_days_subquery, get_suspended_days_subquery, get_total_days_subquery, get_work_subquery
from api.utils.helpers import filter_query_by_staff
from sqlalchemy import func, or_


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class MedianPhaseOverageByWorktypeInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, staff_id: int = None, is_underage_toggled: bool = False) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []

        # Build all necessary subqueries
        work_subq = get_work_subquery()
        ext_subq = get_extension_days_subquery()
        sus_subq = get_suspended_days_subquery()
        total_days_subq = get_total_days_subquery(ext_subq)
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_left_subq = get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq)

        # pylint: disable=duplicate-code

        if is_underage_toggled:
            percentile_column = days_taken_subq.c.days_taken
        else:
            percentile_column = days_left_subq.c.days_left

        median_expr = func.percentile_cont(0.5).within_group(percentile_column)

        query = db.session.query(
            func.max(WorkType.name).label("work_type_name"),
            func.max(Phase.name).label("phase_name"),
            median_expr.label("median_overage"),
            Phase.sort_order.label("phase_sort_order"),
        ).select_from(WorkPhase) \
         .join(Work, WorkPhase.work_id == Work.id) \
         .join(Phase, WorkPhase.phase_id == Phase.id) \
         .join(WorkType, Work.work_type_id == WorkType.id)

        if filters:
            query = query.join(Project, Work.project_id == Project.id)

        if staff_id:
            query = filter_query_by_staff(query, staff_id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            WorkPhase.is_completed.is_(True) if is_underage_toggled else True,
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value
            ),
            WorkType.is_active.is_(True),
            WorkType.is_deleted.is_(False),
            Phase.is_active.is_(True),
            Phase.is_deleted.is_(False),
            *filter_exprs if filter_exprs else [],
        )

        query = query \
            .outerjoin(ext_subq, ext_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(sus_subq, sus_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(total_days_subq, total_days_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_left_subq, days_left_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(work_subq, work_subq.c.work_phase_id == WorkPhase.id)

        if is_underage_toggled:
            query = query.where(days_left_subq.c.days_left > 0).where(days_taken_subq.c.days_taken > 0).where(days_taken_subq.c.days_taken < total_days_subq.c.total_days)
        else:
            query = query.where(days_left_subq.c.days_left < 0)

        query = query.group_by(WorkType.name, Phase.name, Phase.sort_order)

        # pylint: enable=duplicate-code

        work_phases = query.all()

        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format; values are always positive days overdue."""
        phase_insights = []
        for phase in data:
            median = abs(phase[2])

            phase_insights.append({
                "work_type": phase[0],
                "phase": phase[1],
                "median_overage": round(median, 2),
                "phase_sort_order": phase[3],
            })

        return sorted(
            phase_insights,
            key=lambda x: x['median_overage'],
            reverse=True
        )
