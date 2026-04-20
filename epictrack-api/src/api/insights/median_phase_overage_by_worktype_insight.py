"""Insight generator for phase resource grouped by phases"""

from operator import and_
from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work, WorkStateEnum
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.phase_code import PhaseCode as Phase, PhaseVisibilityEnum
from api.models.project import Project
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import (
    get_days_taken_subquery,
    get_suspended_days_subquery
)
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
        sus_subq = get_suspended_days_subquery()
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_over_expr = days_taken_subq.c.days_taken - Phase.number_of_days

        query = db.session.query(
            WorkType.name.label("work_type_name"),
            Phase.name.label("phase_name"),
            func.percentile_cont(0.5).within_group(days_over_expr).label("median_overage"),
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
            Work.work_state.not_in([WorkStateEnum.WITHDRAWN]),
            WorkType.is_active.is_(True),
            WorkType.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                and_(
                    or_(WorkType.id == WorkTypeEnum.AMENDMENT.value, WorkType.id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR,
                ),
            ),
            *filter_exprs if filter_exprs else [],
            days_over_expr < 0 if is_underage_toggled else days_over_expr > 0,
        )

        query = query \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .group_by(WorkType.name, Phase.name, Phase.sort_order)

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
