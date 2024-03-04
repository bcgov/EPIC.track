"""Insight generator for work resource grouped by Federal Involvement"""


from typing import List

from sqlalchemy import func

from api.models import db
from api.models.federal_involvement import FederalInvolvement
from api.models.work import Work


# pylint: disable=not-callable
class WorkFederalInvolvementInsightGenerator:
    """Insight generator for work resource grouped by Federal Involvement"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Work.federal_involvement_id,
                func.count()
                .over(order_by=Work.federal_involvement_id, partition_by=Work.federal_involvement_id)
                .label("count"),
            )
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
            )
            .distinct(Work.federal_involvement_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        federal_involvement_insights = (
            db.session.query(FederalInvolvement)
            .join(partition_query, partition_query.c.federal_involvement_id == FederalInvolvement.id)
            .add_columns(
                FederalInvolvement.name.label("federal_involvement"),
                FederalInvolvement.id.label("federal_involvement_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(federal_involvement_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        federal_involvement_insights = [
            {
                "federal_involvement": row.federal_involvement,
                "federal_involvement_id": row.federal_involvement_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return federal_involvement_insights
