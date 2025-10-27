"""Insight generator for phase resource grouped by phases"""

from typing import List

from api.models.work_type import WorkType
from api.insights.insights_table_filters import build_insights_filters
from api.insights.utils import get_filtered_work_phases


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class OverageByYearInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_year: int = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data from db"""
        filter_exprs = build_insights_filters(filters, "phases") if filters else []
        selected_work_type = WorkType.find_by_id(int(selected_work_type_id)) if selected_work_type_id != "all" else None

        work_phases = get_filtered_work_phases(
                        filter_exprs=filter_exprs,
                        selected_work_type=selected_work_type,
                        selected_year=selected_year,
                        staff_id=staff_id
                    )

        return self._format_data(work_phases)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        phase_insights = [
            {
                "phase": phase[0],
                "percent_overage": round(phase[1], 2),
            }
            for phase in data
        ]
        return sorted(phase_insights, key=lambda x: x['percent_overage'], reverse=True)
