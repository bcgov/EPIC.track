"""Insight generator for phase resource grouped by phases"""

from operator import and_
from typing import List

from sqlalchemy import func, or_

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work, WorkStateEnum
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.phase_code import PhaseCode as Phase, PhaseVisibilityEnum
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models.project import Project
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import (
    get_days_taken_subquery,
    get_suspended_days_subquery
)
from api.utils.helpers import filter_query_by_staff


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class OverageByResponsibilityInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, staff_id: int = None, is_underage_toggled: bool = False) -> List[dict]:
        """Fetch data from db"""
        # Early return if underage toggled, as this insight is only for overages
        if is_underage_toggled:
            return []
        filter_exprs = build_insights_filters(filters, "phases") if filters else []

        sus_subq = get_suspended_days_subquery()
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_over_expr = days_taken_subq.c.days_taken - Phase.number_of_days

        query = db.session.query(
            PhaseOverageResponsibility.responsibility.label("responsibility_name"),
            func.count(func.distinct(WorkPhase.id)).label("count"),
        ).select_from(WorkPhase) \
         .join(Work, WorkPhase.work_id == Work.id) \
         .join(Phase, WorkPhase.phase_id == Phase.id) \
         .join(PhaseOverageResponsibility, WorkPhase.id == PhaseOverageResponsibility.work_phase_id)

        if filters:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)

        if staff_id:
            query = filter_query_by_staff(query, staff_id)

        query = query.filter(
            WorkPhase.is_active.is_(True),
            WorkPhase.is_deleted.is_(False),
            Work.work_state.not_in([WorkStateEnum.WITHDRAWN]),
            PhaseOverageResponsibility.is_active.is_(True),
            PhaseOverageResponsibility.is_deleted.is_(False),
            or_(
                WorkPhase.legislated.is_(True),
                and_(
                    or_(WorkType.id == WorkTypeEnum.AMENDMENT.value, WorkType.id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR,
                ),
            ),
            *filter_exprs if filter_exprs else [],
            days_over_expr > 0,
        )

        query = query \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .group_by(PhaseOverageResponsibility.responsibility)

        work_phases = query.all()
        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        overage_insights = [
            {
                "responsibility_name": phase[0].value,
                "count": phase[1],
            }
            for phase in data
        ]
        return sorted(overage_insights, key=lambda x: x['count'], reverse=True)
