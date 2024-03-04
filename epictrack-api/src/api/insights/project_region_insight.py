"""Insight generator for project resource grouped by ENV regions"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.project import Project
from api.models.region import Region


# pylint: disable=not-callable
class ProjectByRegionInsightGenerator:
    """Insight generator for project resource grouped by ENV regions"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Project.region_id_env,
                func.count()
                .over(order_by=Project.region_id_env, partition_by=Project.region_id_env)
                .label("count"),
            )
            .filter(
                Project.is_active.is_(True),
                Project.is_deleted.is_(False),
            )
            .distinct(Project.region_id_env)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        region_insights = (
            db.session.query(Region)
            .join(partition_query, partition_query.c.region_id_env == Region.id)
            .add_columns(
                Region.name.label("region"),
                Region.id.label("region_id"),
                partition_query.c.count.label("project_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(region_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        region_insights = [
            {
                "region": row.region,
                "region_id": row.region_id,
                "count": row.project_count,
            }
            for row in data
        ]
        return region_insights
