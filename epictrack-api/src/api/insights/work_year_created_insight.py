"""Insight generator for work resource grouped by creation year"""

from typing import List

from sqlalchemy import func, extract

from api.models import db
from api.models.work import Work
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class WorkByYearOpenedInsightGenerator:
    """Insight generator for work resource grouped by Work start year"""

    def fetch_data(self, filters: List = None, staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "works") if filters else []
        year_query = (
            db.session.query(
                extract('year', Work.start_date).label('year'),
                func.count(func.distinct(Work.id)).label('count'),
                func.row_number().over(order_by=extract('year', Work.start_date)).label('id')
            )
            .join(Work.work_type)
            .join(Work.project)
            .join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
            .join(Staff, StaffWorkRole.staff_id == Staff.id)
            .filter(Staff.id == staff_id if staff_id else True, *filter_exprs if filter_exprs else [])
            .group_by(extract('year', Work.start_date))
            .order_by(extract('year', Work.start_date).desc())
            .all()
        )
        return self._format_data(year_query)

    def _format_data(self, data) -> List[dict]:
        # """Format data to the response format"""
        work_year_insights = [
            {
                "year": row.year,
                "count": row.count,
                "id": row.id,
            }
            for row in data
        ]
        return work_year_insights
