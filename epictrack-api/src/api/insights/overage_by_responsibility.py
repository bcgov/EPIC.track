"""Insight generator for phase resource grouped by phases"""

from typing import List

from sqlalchemy import func, or_

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.phase_code import PhaseCode as Phase
from api.models.phase_overage_responsibility import PhaseOverageResponsibility
from api.models.project import Project
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import get_days_left_subquery, get_days_taken_subquery, get_extension_days_subquery, get_suspended_days_subquery, get_total_days_subquery, get_work_subquery
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

        # Build all necessary subqueries
        work_subq = get_work_subquery()
        ext_subq = get_extension_days_subquery()
        sus_subq = get_suspended_days_subquery()
        total_days_subq = get_total_days_subquery(ext_subq)
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_left_subq = get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq)

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
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value,
            ),
            *filter_exprs if filter_exprs else [],
            PhaseOverageResponsibility.is_active.is_(True),
            PhaseOverageResponsibility.is_deleted.is_(False),
            Phase.is_active.is_(True),
            Phase.is_deleted.is_(False),
        )

        query = query \
            .outerjoin(ext_subq, ext_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(sus_subq, sus_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_taken_subq, days_taken_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(total_days_subq, total_days_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(days_left_subq, days_left_subq.c.work_phase_id == WorkPhase.id) \
            .outerjoin(work_subq, work_subq.c.work_phase_id == WorkPhase.id) \
            .where(days_left_subq.c.days_left < 0) \
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
