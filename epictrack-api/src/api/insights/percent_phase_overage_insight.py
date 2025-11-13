"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models import db
from api.models.work_phase import WorkPhase
from api.models.work import Work
from api.models.work_type import WorkType, WorkTypeEnum
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

    def fetch_data(self, filters: List = None, staff_id: int = None, is_underage_toggled: bool = False) -> List[dict]:
        """Fetch data for the insight"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []

        # Build all necessary subqueries
        work_subq = get_work_subquery()
        ext_subq = get_extension_days_subquery()
        sus_subq = get_suspended_days_subquery()
        total_days_subq = get_total_days_subquery(ext_subq)
        days_taken_subq = get_days_taken_subquery(sus_subq)
        days_left_subq = get_days_left_subquery(sus_subq, total_days_subq, work_subq, days_taken_subq)

        # if is_underage_toggled:
        #     count_case = func.count(case((days_left_subq.c.days_left > 0, 1)))
        # else:
        #     count_case = func.count(case((days_left_subq.c.days_left < 0, 1)))

        # percent_expr = (
        #     cast(count_case, Float) /
        #     cast(func.count(func.distinct(WorkPhase.id)), Float)
        # )
        if is_underage_toggled:
            # Only count if days_taken > 0 and days_taken < total_days
            count_case = func.count(
                case(
                    (
                        (days_taken_subq.c.days_taken > 0) &
                        (days_taken_subq.c.days_taken < total_days_subq.c.total_days),
                        1
                    )
                )
            )
        else:
            # Count all where days_left < 0 (overtime)
            count_case = func.count(case((days_left_subq.c.days_left < 0, 1)))
        # -------- Adjusted Section Ends Here --------

        percent_expr = (
            cast(count_case, Float) /
            cast(func.count(func.distinct(WorkPhase.id)), Float)
        )
        # pylint: disable=duplicate-code

        query = db.session.query(
            Phase.name.label("phase_name"),
            (percent_expr * 100).label("percent")
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
            WorkPhase.is_completed.is_(True) if is_underage_toggled else True,
            or_(
                WorkPhase.legislated.is_(True),
                WorkType.id == WorkTypeEnum.AMENDMENT.value,
            ),
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
            .outerjoin(work_subq, work_subq.c.work_phase_id == WorkPhase.id) \
            .group_by(Phase.name)
        # pylint: enable=duplicate-code

        query = query.having(percent_expr > 0)

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
