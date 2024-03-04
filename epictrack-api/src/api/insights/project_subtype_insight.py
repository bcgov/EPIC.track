"""Insight generator for project resource filtered by type and grouped by subtypes"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.project import Project
from api.models.sub_types import SubType


# pylint: disable=not-callable
class ProjectBySubTypeInsightGenerator:
    """Insight generator for project resource filtered by type and grouped by subtypes"""

    def generate_partition_query(self, type_id: int):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Project.sub_type_id,
                func.count()
                .over(order_by=Project.sub_type_id, partition_by=Project.sub_type_id)
                .label("count"),
            )
            .filter(
                Project.is_active.is_(True),
                Project.is_deleted.is_(False),
                Project.type_id == type_id
            )
            .distinct(Project.sub_type_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self, type_id: int) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(type_id)

        subtype_insights = (
            db.session.query(SubType)
            .join(partition_query, partition_query.c.sub_type_id == SubType.id)
            .add_columns(
                SubType.name.label("sub_type"),
                SubType.id.label("sub_type_id"),
                partition_query.c.count.label("project_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(subtype_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        subtype_insights = [
            {
                "sub_type": row.sub_type,
                "sub_type_id": row.sub_type_id,
                "count": row.project_count,
            }
            for row in data
        ]
        return subtype_insights
