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
"""The plan of a new work: when each phase and milestone falls, in days from the work's start."""
import uuid
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from . import template as tpl

# Milestones with these visibilities get a date when the work is created; the others wait to be added.
DATED_VISIBILITIES = ("MANDATORY", "SUGGESTED")


@dataclass
class PlannedMilestone:
    """When a milestone falls, and whether the new work dates it."""

    key: uuid.UUID
    day: int
    dated: bool = False
    # The milestone a dated child is dated from.
    source_key: Optional[uuid.UUID] = None


@dataclass
class PlannedPhase:
    """When a phase starts and ends, and its milestones in the version's order."""

    phase_code_id: int
    start_day: int
    end_day: int
    milestones: List[PlannedMilestone] = field(default_factory=list)


def plan_new_work(version: tpl.Version) -> List[PlannedPhase]:
    """Plan a new work's phases and milestones from its template version.

    Each phase in the default sequence starts the day after the previous one ends, and ends after its time limit,
    counting its start day for Day One. A phase outside the sequence gets the dates the next one would have.
    """
    plan, start = [], 0
    for phase in version.phases:
        end = start + phase.number_of_days - (1 if phase.day_basis == tpl.DAY_ONE else 0)
        plan.append(_plan_phase(phase, start, end))
        if phase.in_default_sequence:
            start = end + 1
    return plan


def _plan_phase(phase: tpl.Phase, start: int, end: int) -> PlannedPhase:
    events: Dict[uuid.UUID, tpl.Event] = {event.key: event for event in phase.events}
    days: Dict[uuid.UUID, int] = {}

    def day_of(event: tpl.Event) -> int:
        if event.key not in days:
            if event.event_position == tpl.START:
                days[event.key] = start
            elif event.event_position == tpl.END:
                days[event.key] = end
            elif event.anchor_key is None:
                days[event.key] = start + event.offset_days
            else:
                anchor = events[event.anchor_key]
                # A milestone's end is its date plus its number of days.
                anchor_day = day_of(anchor) + (anchor.number_of_days if event.anchor_point == tpl.END else 0)
                days[event.key] = anchor_day + event.offset_days
        return days[event.key]

    def dated(event: tpl.Event) -> bool:
        if phase.visibility != tpl.REGULAR or event.visibility not in DATED_VISIBILITIES:
            return False
        if event.anchor_key is None:
            return True
        # Only a dated top-level milestone's children are dated, as in the current engine.
        anchor = events[event.anchor_key]
        return anchor.anchor_key is None and dated(anchor)

    return PlannedPhase(
        phase_code_id=phase.phase_code_id, start_day=start, end_day=end,
        milestones=[
            PlannedMilestone(
                key=event.key, day=day_of(event), dated=dated(event),
                source_key=event.anchor_key if dated(event) else None,
            )
            for event in phase.events
        ],
    )
