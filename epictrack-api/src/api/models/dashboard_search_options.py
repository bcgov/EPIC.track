"""This module holds data classes."""

from typing import List, Optional

from attr import dataclass


@dataclass
class WorkplanDashboardSearchOptions:  # pylint: disable=too-many-instance-attributes
    """Used to store work dashboard search options."""

    project_types: Optional[List[int]]
    regions: Optional[List[int]]
    staff_id: Optional[int]
    teams: Optional[List[int]]
    text: str
    work_states: Optional[List[str]]
    work_types: Optional[List[int]]


@dataclass
class StatusDashboardSearchOptions:  # pylint: disable=too-many-instance-attributes
    """Used to store status dashboard search options."""

    is_approved: Optional[List[bool]]
    project_status: Optional[List[bool]]
    regions: Optional[List[int]]
    staff_id: Optional[int]
    staleness: Optional[List[str]]
    teams: Optional[List[int]]
    text: str
    work_status: Optional[List[bool]]
    work_types: Optional[List[int]]


@dataclass
class IssuesDashboardSearchOptions:  # pylint: disable=too-many-instance-attributes
    """Used to store issue dashboard search options."""

    is_approved: Optional[List[bool]]
    issue_state: Optional[List[str]]
    regions: Optional[List[int]]
    staff_id: Optional[int]
    staleness: Optional[List[str]]
    teams: Optional[List[int]]
    text: str
    work_types: Optional[List[int]]


@dataclass
class EventCalendarSearchOptions:  # pylint: disable=too-many-instance-attributes
    """Used to store event calendar search options."""

    event_types: Optional[List[int]]
    project_types: Optional[List[int]]
    regions: Optional[List[int]]
    staff_id: Optional[int]
    teams: Optional[List[int]]
    text: str
    work_ids: Optional[List[int]]
    work_types: Optional[List[int]]
    year: int
