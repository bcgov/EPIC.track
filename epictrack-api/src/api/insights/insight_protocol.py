"""Protocol class for insight generator."""

from typing import List, Protocol


class InsightGenerator(Protocol):
    """Defines the basic structure of an insight generator"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        ...

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        ...

    def _format_data(self, data: List) -> List[dict]:
        """Format data to the response format"""
        ...
