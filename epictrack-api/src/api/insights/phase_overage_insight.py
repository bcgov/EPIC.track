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
class MedianPhaseOverageInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
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

        median_expr = func.percentile_cont(0.5).within_group(days_left_subq.c.days_left)
        q1_expr = func.percentile_cont(0.25).within_group(days_left_subq.c.days_left)
        q3_expr = func.percentile_cont(0.75).within_group(days_left_subq.c.days_left)

        query = db.session.query(
            func.max(Phase.name).label("phase_name"),
            median_expr.label("median_overage"),
            q1_expr.label("iqr_low"),
            q3_expr.label("iqr_high"),
        ).select_from(WorkPhase) \
         .join(Work, WorkPhase.work_id == Work.id) \
         .join(Phase, WorkPhase.phase_id == Phase.id)

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
            .where(days_left_subq.c.days_left < 0) \
            .group_by(WorkPhase.phase_id, Phase.name)

        # pylint: enable=duplicate-code

        work_phases = query.all()

        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format; values are always positive days overdue."""
        phase_insights = []
        for phase in data:
            # Make all values positive for display
            median = abs(phase[1])
            iqr_low = abs(phase[2])
            iqr_high = abs(phase[3])

            low, high = (iqr_low, iqr_high)
            if iqr_low is not None and iqr_high is not None and iqr_low > iqr_high:
                low, high = iqr_high, iqr_low

            phase_insights.append({
                "phase": phase[0],
                "median_overage": round(median, 2),
                "iqr_low": round(low, 2),
                "iqr_high": round(high, 2),
            })

        return sorted(
            phase_insights,
            key=lambda x: x['median_overage'],
            reverse=True
        )
