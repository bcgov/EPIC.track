"""Insight generator for work resource grouped by Work type"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.project import Project
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.models.work import Work
from api.models.work_phase import WorkPhase
from api.models.work_type import WorkType
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class WorkByTypeInsightGenerator:
    """Insight generator for work resource grouped by Work type"""

    def generate_partition_query(self, filters: List = None, staff_id: int = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        query = db.session.query(
            Work.work_type_id,
            func.count(func.distinct(Work.id)).label("count"),
        )
        # Join necessary tables for filters
        if filters:
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(WorkPhase, Work.current_work_phase_id == WorkPhase.id)
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
        query = query.group_by(Work.work_type_id)
        return query.subquery()

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters, staff_id)

        work_type_insights = (
            db.session.query(WorkType)
            .join(partition_query, partition_query.c.work_type_id == WorkType.id)
            .add_columns(
                WorkType.name.label("work_type"),
                WorkType.id.label("work_type_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(work_type_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        work_type_insights = [
            {
                "work_type": row.work_type,
                "work_type_id": row.work_type_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return work_type_insights
