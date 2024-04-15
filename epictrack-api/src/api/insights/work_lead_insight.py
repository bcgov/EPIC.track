"""Insight generator for work resource grouped by work lead"""


from typing import List

from sqlalchemy import func
from sqlalchemy import and_
from api.models import db
from api.models.staff import Staff
from api.models.work import Work
from api.models.staff_work_role import StaffWorkRole


# pylint: disable=not-callable
class WorkLeadInsightGenerator:
    """Insight generator for work resource grouped by work lead"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Work.work_lead_id,
                func.count()
                .over(order_by=Work.work_lead_id, partition_by=Work.work_lead_id)
                .label("count"),
            )
            .join(StaffWorkRole, and_(StaffWorkRole.work_id == Work.id, StaffWorkRole.staff_id == Work.work_lead_id))
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
                StaffWorkRole.is_active.is_(True),
                StaffWorkRole.staff_id.in_(db.session.query(Work.work_lead_id)),
            )
            .distinct(Work.work_lead_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        lead_insights = (
            db.session.query(Staff)
            .join(partition_query, partition_query.c.work_lead_id == Staff.id)
            .add_columns(
                Staff.full_name.label("work_lead"),
                Staff.id.label("work_lead_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(lead_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        lead_insights = [
            {
                "work_lead": row.work_lead,
                "work_lead_id": row.work_lead_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return lead_insights
