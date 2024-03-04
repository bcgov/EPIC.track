"""Insight generator for work resource grouped by Ministry"""


from typing import List

from sqlalchemy import func

from api.models import db
from api.models.ministry import Ministry
from api.models.work import Work


# pylint: disable=not-callable
class WorkMinistryInsightGenerator:
    """Insight generator for work resource grouped by Ministry"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Work.ministry_id,
                func.count()
                .over(order_by=Work.ministry_id, partition_by=Work.ministry_id)
                .label("count"),
            )
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
            )
            .distinct(Work.ministry_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        ministry_insights = (
            db.session.query(Ministry)
            .join(partition_query, partition_query.c.ministry_id == Ministry.id)
            .add_columns(
                Ministry.name.label("ministry"),
                Ministry.id.label("ministry_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(ministry_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        ministry_insights = [
            {
                "ministry": row.ministry,
                "ministry_id": row.ministry_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return ministry_insights
