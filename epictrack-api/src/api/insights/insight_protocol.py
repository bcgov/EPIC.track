"""Protocol class for insight generator."""

from typing import List, Optional, Protocol


class InsightGenerator(Protocol):
    """Defines the basic structure of an insight generator"""

    def generate_partition_query(self):
        """Generates the group by subquery."""

    def fetch_data(self, **kwargs: Optional[dict]) -> List[dict]:
        """Fetch data from db"""

    def _format_data(self, data: List) -> List[dict]:
        """Format data to the response format"""
