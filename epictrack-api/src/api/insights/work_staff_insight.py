"""Insight generator for work resource grouped by staffs"""

from typing import List

from sqlalchemy import func
from api.models import db
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.models.work import Work
from api.models.project import Project
from api.models.work_type import WorkType
from api.models.work_phase import WorkPhase
from api.models.role import RoleEnum
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class WorkStaffInsightGenerator:
    """Insight generator for work resource grouped by staffs"""

    def generate_partition_query(self, filters: List = None, staff_id: int = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        query = (
            db.session.query(
                StaffWorkRole.staff_id,
                func.count(func.distinct(Work.id)).label("count"),
            )
            .join(Work, StaffWorkRole.work_id == Work.id)
            .join(Staff, Staff.id == StaffWorkRole.staff_id)
        )

        # Join necessary tables for filters
        if filters:
            query = (
                query.join(WorkType, Work.work_type_id == WorkType.id)
                .join(Project, Work.project_id == Project.id)
                .join(WorkPhase, Work.current_work_phase_id == WorkPhase.id)
            )

        if staff_id:
            query = query.filter(Staff.id == staff_id)

        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            Work.is_completed.is_(False),
            Staff.is_active.is_(True),
            StaffWorkRole.is_active.is_(True),
            StaffWorkRole.role_id == RoleEnum.OFFICER_ANALYST.value,
            *filter_exprs if filter_exprs else [],
        )
        query = query.group_by(StaffWorkRole.staff_id)
        return query.subquery()

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters, staff_id)

        staff_insights = (
            db.session.query(Staff)
            .join(partition_query, partition_query.c.staff_id == Staff.id)
            .add_columns(
                Staff.full_name.label("staff"),
                Staff.id.label("staff_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(staff_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        staff_insights = [
            {
                "staff": row.staff,
                "staff_id": row.staff_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return staff_insights
