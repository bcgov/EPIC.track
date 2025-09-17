"""Insight generator for project resource grouped by types"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.project import Project
from api.models.types import Type
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class ProjectByTypeInsightGenerator:
    """Insight generator for project resource grouped by types"""

    def generate_partition_query(self, filters: List = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters) if filters else []
        partition_query = (
            db.session.query(
                Project.type_id,
                func.count()
                .over(order_by=Project.type_id, partition_by=Project.type_id)
                .label("count"),
            )
            .join(Type, Project.type_id == Type.id)
            .filter(
                Project.is_active.is_(True),
                Project.is_deleted.is_(False),
                *filter_exprs if filter_exprs else []
            )
            .distinct(Project.type_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self, filters: List = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters)

        type_insights = (
            db.session.query(Type)
            .join(partition_query, partition_query.c.type_id == Type.id)
            .add_columns(
                Type.name.label("type"),
                Type.id.label("type_id"),
                partition_query.c.count.label("project_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(type_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        type_insights = [
            {
                "type": row.type,
                "type_id": row.type_id,
                "count": row.project_count,
            }
            for row in data
        ]
        return type_insights
