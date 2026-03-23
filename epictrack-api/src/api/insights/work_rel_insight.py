"""Insight generator for work resource grouped by REL staff"""


from typing import List

from sqlalchemy import func
from api.models import db
from api.models.position import Position
from api.models.project import Project
from api.models.role import Role
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.models.work import Work
from api.models.work_phase import WorkPhase
from api.models.work_type import WorkType
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class WorkRelInsightGenerator:
    """Insight generator for work resource grouped by REL staff"""

    def generate_partition_query(self, filters: List = None, staff_id: int = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        query = db.session.query(
            StaffWorkRole.staff_id,
            func.count(func.distinct(Work.id)).label("count"),
        ).join(Work, StaffWorkRole.work_id == Work.id)

        # Join necessary tables for filters
        if filters or staff_id:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(WorkPhase, Work.current_work_phase_id == WorkPhase.id)

        query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
        query = query.join(Position, Staff.position_id == Position.id)
        query = query.join(Role, StaffWorkRole.role_id == Role.id)

        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            StaffWorkRole.is_active.is_(True),
            Staff.is_active.is_(True),
            Staff.is_deleted.is_(False),
            Position.name == 'REL',
            Role.name == 'REL',
            *filter_exprs if filter_exprs else [],
        )

        if staff_id is not None:
            query = query.filter(Staff.id == staff_id)
            query = query.filter(Staff.is_active.is_(True))
            query = query.filter(StaffWorkRole.is_active.is_(True))

        query = query.group_by(StaffWorkRole.staff_id)
        return query.subquery()

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters, staff_id)

        rel_insights = (
            db.session.query(Staff)
            .join(partition_query, partition_query.c.staff_id == Staff.id)
            .add_columns(
                Staff.full_name.label("rel_staff"),
                Staff.id.label("rel_staff_id"),
                partition_query.c.count.label("rel_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(rel_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        rel_insights = [
            {
                "rel_staff": row.rel_staff,
                "rel_staff_id": row.rel_staff_id,
                "count": row.rel_count,
            }
            for row in data
        ]
        return rel_insights
