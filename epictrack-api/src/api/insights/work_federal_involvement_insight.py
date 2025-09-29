"""Insight generator for work resource grouped by Federal Involvement"""


from typing import List

from sqlalchemy import func

from api.models import db
from api.models.federal_involvement import FederalInvolvement
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.ministry import Ministry
from api.models.project import Project
from api.models.work import Work
from api.models.work_type import WorkType
from api.insights.insights_table_filters import build_insights_filters
from api.utils.helpers import filter_query_by_staff


# pylint: disable=not-callable
class WorkFederalInvolvementInsightGenerator:
    """Insight generator for work resource grouped by Federal Involvement"""

    def generate_partition_query(self, filters: List = None, staff_id: int = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        query = db.session.query(
            Work.federal_involvement_id,
            func.count(func.distinct(Work.id)).label("count"),
        )
        # Join necessary tables for filters
        if filters:
            query = query.join(Ministry, Work.ministry_id == Ministry.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(IndigenousWork, IndigenousWork.work_id == Work.id)
            query = query.join(IndigenousNation, IndigenousWork.indigenous_nation_id == IndigenousNation.id)
        if staff_id:
            query = filter_query_by_staff(query, staff_id)
        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            Work.is_completed.is_(False),
            *filter_exprs if filter_exprs else [],
        )
        query = query.group_by(Work.federal_involvement_id)
        return query.subquery()

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters, staff_id)

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
