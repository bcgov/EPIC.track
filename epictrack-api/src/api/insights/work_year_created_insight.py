"""Insight generator for work resource grouped by creation year"""

from typing import List

from sqlalchemy import func, extract

from api.models import db
from api.models.work import Work


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class WorkByYearOpenedInsightGenerator:
    """Insight generator for work resource grouped by Work start year"""

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        year_query = (
            db.session.query(
                extract('year', Work.start_date).label('year'),
                func.count().label('count'),
                func.row_number().over(order_by=extract('year', Work.start_date)).label('id')
            )
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
