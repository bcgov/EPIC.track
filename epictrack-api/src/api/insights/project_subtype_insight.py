"""Insight generator for project resource filtered by type and grouped by subtypes"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.project import Project
from api.models.sub_types import SubType
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class ProjectBySubTypeInsightGenerator:
    """Insight generator for project resource filtered by type and grouped by subtypes"""

    def generate_partition_query(self, type_id: int, filters: List = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "projects") if filters else []
        partition_query = (
            db.session.query(
                Project.sub_type_id,
                func.count()
                .over(order_by=Project.sub_type_id, partition_by=Project.sub_type_id)
                .label("count"),
            )
            .join(SubType, Project.sub_type_id == SubType.id)
            .filter(
                Project.is_active.is_(True),
                Project.is_deleted.is_(False),
                Project.type_id == type_id,
                *filter_exprs if filter_exprs else []
            )
            .distinct(Project.sub_type_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self, type_id: int, filters: List = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(type_id, filters)

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
