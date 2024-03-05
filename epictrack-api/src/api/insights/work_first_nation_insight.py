"""Insight generator for work resource grouped by First Nation"""


from typing import List

from sqlalchemy import func

from api.models import db
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.work import Work


# pylint: disable=not-callable
class WorkFirstNationInsightGenerator:
    """Insight generator for work resource grouped by First Nation"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                IndigenousWork.indigenous_nation_id,
                func.count()
                .over(
                    order_by=IndigenousWork.indigenous_nation_id, partition_by=IndigenousWork.indigenous_nation_id
                )
                .label("count"),
            )
            .join(Work, Work.id == IndigenousWork.work_id)
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
                IndigenousWork.is_active.is_(True),
            )
            .distinct(IndigenousWork.indigenous_nation_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

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
