"""Insight generator for work resource grouped by year closed"""

from typing import List

from sqlalchemy import func, extract

from api.models import db
from api.models.work import Work
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class WorkClosureByWorkState:
    """Insight generator for work resource grouped by Work year closed"""

    def fetch_data(self, filters: List = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters) if filters else []
        closed_details_query = (
            db.session.query(
                extract('year', Work.work_decision_date).label('year'),
                Work.work_state.label('work_state'),
                func.count(func.distinct(Work.id)).label('count')
            )
            .filter(
                Work.work_decision_date.isnot(None),
                *filter_exprs if filter_exprs else []
            )
            .join(Work.work_type)
            .join(Work.project)
            .group_by(extract('year', Work.work_decision_date), Work.work_state)
            .order_by(extract('year', Work.work_decision_date), Work.work_state)
            .all()
        )
        return self._format_data(closed_details_query)

    def _format_data(self, data) -> List[dict]:
        # """Format data to the response format"""
        work_closure_breakdown_insights = [
            {
                "year": row.year,
                "count": row.count,
                "work_state": row.work_state.value,
            }
            for row in data
        ]
        return work_closure_breakdown_insights
