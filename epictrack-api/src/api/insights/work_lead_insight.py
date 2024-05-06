"""Insight generator for work resource grouped by work lead"""


from typing import List

from sqlalchemy import func
from sqlalchemy import and_
from api.models import db
from api.models.staff import Staff
from api.models.work import Work
from api.models.staff_work_role import StaffWorkRole
from api.models.role import RoleEnum


# pylint: disable=not-callable
class WorkLeadInsightGenerator:
    """Insight generator for work resource grouped by work lead"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                StaffWorkRole.staff_id,
                func.count()
                .label("count"),
            )
            .group_by(StaffWorkRole.staff_id)
            .join(Work, and_(StaffWorkRole.work_id == Work.id))
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
                StaffWorkRole.is_active.is_(True),
                StaffWorkRole.role_id.in_(
                    [RoleEnum.TEAM_CO_LEAD.value, RoleEnum.TEAM_LEAD.value]
                ),
            )
            .distinct(StaffWorkRole.staff_id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        lead_insights = (
            db.session.query(Staff)
            .join(partition_query, partition_query.c.staff_id == Staff.id)
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
