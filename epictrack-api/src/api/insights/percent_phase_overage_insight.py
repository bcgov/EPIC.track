"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work, WorkStateEnum
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.phase_code import PhaseCode as Phase, PhaseVisibilityEnum
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import (
    get_days_taken_subquery,
    get_suspended_days_subquery
)
from sqlalchemy import and_, func, Float, cast, or_, case


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class PercentPhaseOverageInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, staff_id: int = None, is_underage_toggled: bool = False) -> List[dict]:
        """Fetch data for the insight"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []

        # Build all necessary subqueries
        sus_subq = get_suspended_days_subquery()
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_over_expr = days_taken_subq.c.days_taken - Phase.number_of_days

        if is_underage_toggled:
            numerator = func.sum(
                case((days_over_expr < 0, 1), else_=0)
            )
        else:
            numerator = func.sum(
                case((days_over_expr > 0, 1), else_=0)
            )

        denominator = func.count(func.distinct(WorkPhase.id))

        percent_expr = (
            cast(numerator, Float) /
            cast(denominator, Float)
        )

        query = db.session.query(
            Phase.name.label("phase_name"),
            (percent_expr * 100).label("percent"),
            numerator.label("overage_count"),
            denominator.label("total_count"),
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
            Work.work_state.not_in([WorkStateEnum.WITHDRAWN]),
            or_(
                WorkPhase.legislated.is_(True),
                and_(
                    or_(WorkType.id == WorkTypeEnum.AMENDMENT.value, WorkType.id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR,
                ),
            ),
            *filter_exprs if filter_exprs else [],
        )

        query = query \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .group_by(Phase.name)

        query = query.having(percent_expr > 0)
        work_phases = query.all()
        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        phase_insights = [
            {
                "phase": phase[0],
                "percent_overage": round(phase[1], 2),
                "overage_count": phase[2],
                "total_count": phase[3],
            }
            for phase in data
        ]
        return sorted(phase_insights, key=lambda x: x['percent_overage'], reverse=True)
