"""Insight generator for phase resource grouped by phases"""

from typing import List


from api.insights.utils import compute_phase_overage_insights, get_filtered_work_phases


# pylint: disable=not-callable
# pylint: disable=too-few-public-methods
class PercentPhaseOverageInsightGenerator:
    """Insight generator for phase resource grouped by phases"""

    def fetch_data(self, filters: List = None, selected_work_type_id: str = "all", staff_id: int = None) -> List[dict]:
        """Fetch data for the insight"""
        work_phases = get_filtered_work_phases(filters=filters, selected_work_type_id=selected_work_type_id, selected_year=None, staff_id=staff_id)

        overage_by_phase = compute_phase_overage_insights(work_phases)

        return self._format_data(overage_by_phase)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        phase_insights = [
            {
                "phase_id": phase_id,
                "phase": phase_info['phase'],
                "count_with_overages": phase_info['count_with_overages'],
                "percent_overage": phase_info['percent_overage'],
                "count": phase_info['count'],
            }
            for phase_id, phase_info in data.items()
        ]
        return sorted(phase_insights, key=lambda x: x['percent_overage'], reverse=True)
