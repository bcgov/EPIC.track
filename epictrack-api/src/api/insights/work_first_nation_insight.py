"""Insight generator for work resource grouped by First Nation"""


from typing import List

from sqlalchemy import func

from api.models import db
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.ministry import Ministry
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.models.work import Work
from api.models.work_type import WorkType
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class WorkFirstNationInsightGenerator:
    """Insight generator for work resource grouped by First Nation"""

    def generate_partition_query(self, filters: List = None, staff_id: int = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        query = db.session.query(
            IndigenousWork.indigenous_nation_id,
            func.count(func.distinct(Work.id)).label("count"),
        )
        query = query.join(IndigenousWork, IndigenousWork.work_id == Work.id)
        # Join necessary tables for filters
        if filters:
            query = query.join(Ministry, Work.ministry_id == Ministry.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(IndigenousNation, IndigenousWork.indigenous_nation_id == IndigenousNation.id)
        if staff_id:
            query = query.join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
            query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
            query = query.filter(Staff.id == staff_id)
        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            Work.is_completed.is_(False),
            *filter_exprs if filter_exprs else [],
        )
        query = query.group_by(IndigenousWork.indigenous_nation_id)
        return query.subquery()

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters, staff_id)

        first_nation_insights = (
            db.session.query(IndigenousNation)
            .join(partition_query, partition_query.c.indigenous_nation_id == IndigenousNation.id)
            .add_columns(
                IndigenousNation.name.label("first_nation"),
                IndigenousNation.id.label("first_nation_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(first_nation_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        first_nation_insights = [
            {
                "first_nation": row.first_nation,
                "first_nation_id": row.first_nation_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return first_nation_insights
