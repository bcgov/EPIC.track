# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""A phase's day counts: the one definition every screen and check uses."""
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import List, NamedTuple, Optional

from . import template as tpl

TIME_LIMIT_EXTENSION = "TIME_LIMIT_EXTENSION"
TIME_LIMIT_RESUMPTION = "TIME_LIMIT_RESUMPTION"


class Milestone(NamedTuple):
    """A milestone of the phase, as the counts read it."""

    role: Optional[str]
    actual_date: Optional[date]
    number_of_days: Optional[int]


@dataclass
class PhaseFacts:  # pylint: disable=too-many-instance-attributes
    """What a phase's counts depend on."""

    # None when there's nothing to count, as for a phase completed without both dates.
    start: Optional[date]
    # When it ended, or the end date being entered.
    end: Optional[date] = None
    # Empty or 0 means the phase has no time limit, and its planned length is what it's allowed.
    time_limit: Optional[int] = None
    planned_days: int = 0
    day_basis: str = tpl.DAY_ZERO
    # The work's current phase, not yet complete.
    is_current: bool = False
    suspended_since: Optional[date] = None
    milestones: List[Milestone] = field(default_factory=list)


class PhaseDays(NamedTuple):
    """A phase's day counts."""

    time_allowed: int
    extension_days: int
    suspended_days: int
    days_taken: int
    days_left: int

    @property
    def days_over(self) -> int:
        """Days taken beyond the time allowed, or below 0 when there's time left."""
        return self.days_taken - self.time_allowed


def phase_days(facts: PhaseFacts, today: date) -> PhaseDays:
    """Count a phase's days.

    Extensions count once they have an actual date. A suspension pauses the clock: its days leave the days taken,
    while one still running counts up to today in the current phase. Day One counts the start day as day 1.
    """
    extension_days = _dated_days(facts.milestones, TIME_LIMIT_EXTENSION)
    time_allowed = facts.time_limit + extension_days if facts.time_limit else facts.planned_days
    # v1 records each suspension's length on the resumption that ends it.
    suspended_days = _dated_days(facts.milestones, TIME_LIMIT_RESUMPTION)
    first_day = 1 if facts.day_basis == tpl.DAY_ONE else 0
    if facts.start is None:
        elapsed = 0
    elif facts.end is not None:
        elapsed = (facts.end - facts.start).days + first_day
    elif facts.is_current:
        elapsed = (today - facts.start).days + first_day
        if facts.suspended_since is not None:
            suspended_days += (today - facts.suspended_since).days
    else:
        elapsed = 0
    days_taken = max(0, elapsed - suspended_days)
    days_left = time_allowed - days_taken if facts.is_current else time_allowed
    return PhaseDays(time_allowed, extension_days, suspended_days, days_taken, days_left)


def deadline(start: date, time_limit: int, day_basis: str, milestones: List[Milestone]) -> date:
    """A legislated phase's END: its start plus the time allowed and the days suspended, less Day One's start day."""
    days = time_limit + _dated_days(milestones, TIME_LIMIT_EXTENSION) + _dated_days(milestones, TIME_LIMIT_RESUMPTION)
    return start + timedelta(days=days - (1 if day_basis == tpl.DAY_ONE else 0))


def _dated_days(milestones: List[Milestone], role: str) -> int:
    return sum(m.number_of_days or 0 for m in milestones if m.role == role and m.actual_date is not None)
