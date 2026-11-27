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
"""A work's plan as plain data: its phases, milestones and calendar entries, with dates to the day."""
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, List, Optional

from . import template as tpl


@dataclass
class PlanMilestone:  # pylint: disable=too-many-instance-attributes
    """A milestone of the work."""

    id: int
    phase_id: int
    position: str
    anticipated: date
    name: str = ""
    actual: Optional[date] = None
    number_of_days: int = 0
    role: Optional[str] = None
    # The milestone a child is dated from, and how.
    anchor_id: Optional[int] = None
    anchor_point: str = tpl.START
    offset_days: int = 0
    # Only primary-category milestones push others or are pushed.
    in_cascade: bool = True

    @property
    def date(self) -> date:
        """The actual date once there is one, otherwise the planned one."""
        return self.actual or self.anticipated


@dataclass
class PlanCalendarEntry:
    """A calendar entry dated from a milestone."""

    id: int
    anchor_id: int
    anchor_point: str
    offset_days: int
    anticipated: date


@dataclass
class PlanPhase:  # pylint: disable=too-many-instance-attributes
    """A phase in the work's sequence."""

    id: int
    time_limit: int
    day_basis: str
    legislated: bool
    completed: bool
    start: date
    end: date
    milestone_ids: List[int] = field(default_factory=list)


@dataclass
class WorkPlan:
    """A work's phases in order, with their milestones and calendar entries."""

    work_id: int
    current_phase_id: Optional[int]
    phases: List[PlanPhase]
    milestones: Dict[int, PlanMilestone]
    calendar: List[PlanCalendarEntry] = field(default_factory=list)
    work_start: Optional[date] = None

    def phase(self, phase_id: int) -> PlanPhase:
        """Return the phase with this id."""
        return next(phase for phase in self.phases if phase.id == phase_id)

    def boundary(self, phase: PlanPhase, position: str) -> Optional[PlanMilestone]:
        """Return the phase's START or END milestone."""
        return next((
            self.milestones[i] for i in phase.milestone_ids
            if self.milestones[i].position == position and self.milestones[i].in_cascade
        ), None)
