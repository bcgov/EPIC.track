"""Insight generator for work resource grouped by Work type"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.work import Work
from api.models.work_type import WorkType


# pylint: disable=not-callable
class WorkByTypeInsightGenerator:
    """Insight generator for work resource grouped by Work type"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Work.work_type_id,
                func.count()
                .over(order_by=Work.work_type_id, partition_by=Work.work_type_id)
                .label("count"),
            )
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
            )
            .distinct(Work.work_type_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

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
