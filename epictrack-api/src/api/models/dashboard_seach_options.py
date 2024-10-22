"""This module holds data classes."""

from typing import List, Optional

from attr import dataclass


@dataclass
class WorkplanDashboardSearchOptions:  # pylint: disable=too-many-instance-attributes
    """Used to store work dashboard search options."""

    text: str
    teams: Optional[List[int]]
    work_states: Optional[List[str]]
    regions: Optional[List[int]]
    project_types: Optional[List[int]]
    work_types: Optional[List[int]]
    staff_id: Optional[int]
