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
"""A work template version as plain data.

Phases are identified by their phase code and milestones by their key, so nothing here depends on
database ids. Lists are in sort order.
"""
import uuid
from dataclasses import dataclass, field
from typing import Iterator, List, Optional

START = "START"
INTERMEDIATE = "INTERMEDIATE"
END = "END"
EVENT_POSITIONS = (START, INTERMEDIATE, END)

HIDDEN = "HIDDEN"
EVENT_VISIBILITIES = ("MANDATORY", "SUGGESTED", "OPTIONAL", HIDDEN)

REGULAR = "REGULAR"
PHASE_VISIBILITIES = (REGULAR, HIDDEN)

FREE = "FREE"
SET = "SET"
LEGISLATED = "LEGISLATED"
TIME_LIMIT_KINDS = (FREE, SET, LEGISLATED)

DAY_ZERO = "ZERO"
DAY_ONE = "ONE"
DAY_BASES = (DAY_ZERO, DAY_ONE)

PREVIOUS_END = "PREVIOUS_END"
OWN_START = "OWN_START"
BOUNDARY_SIDES = (PREVIOUS_END, OWN_START)

ANCHOR_POINTS = (START, END)


@dataclass
class Effect:
    """One thing an outcome does."""

    kind: str
    target_phase_code_id: Optional[int] = None
    target_event_key: Optional[uuid.UUID] = None
    params: dict = field(default_factory=dict)


@dataclass
class Outcome:
    """An outcome a milestone can have, and its effects in the order they run."""

    name: str
    effects: List[Effect] = field(default_factory=list)


@dataclass
class Event:  # pylint: disable=too-many-instance-attributes
    """A milestone of a template phase."""

    key: uuid.UUID
    name: str
    event_type_id: int
    event_category_id: int
    visibility: str
    event_position: str = INTERMEDIATE
    role: Optional[str] = None
    # Empty means the phase's START.
    anchor_key: Optional[uuid.UUID] = None
    anchor_point: str = START
    offset_days: int = 0
    number_of_days: int = 0
    multiple_days: bool = False
    repeatable: bool = False
    sets_work_start: bool = False
    sets_official_start: bool = False
    legacy_event_template_id: Optional[int] = None
    outcomes: List[Outcome] = field(default_factory=list)


@dataclass
class Phase:  # pylint: disable=too-many-instance-attributes
    """A phase of a template version."""

    phase_code_id: int
    name: str
    time_limit_kind: str = FREE
    number_of_days: int = 0
    day_basis: str = DAY_ONE
    start_usually_set_by: str = PREVIOUS_END
    visibility: str = REGULAR
    in_default_sequence: bool = True
    is_intake: bool = False
    requires_overage_responsibility: bool = False
    events: List[Event] = field(default_factory=list)


@dataclass
class Version:
    """A template version: the phases a work of this type and EA Act runs through."""

    work_type_id: int
    ea_act_id: int
    rule_set: str
    phases: List[Phase] = field(default_factory=list)

    def events(self) -> Iterator[tuple]:
        """Yield (phase, event) for every milestone in the version."""
        for phase in self.phases:
            for event in phase.events:
                yield phase, event

    def phase_by_code(self, phase_code_id: int) -> Optional[Phase]:
        """Return the phase with this phase code, if the version has it."""
        return next((phase for phase in self.phases if phase.phase_code_id == phase_code_id), None)

    def event_by_key(self, key: uuid.UUID) -> Optional[tuple]:
        """Return (phase, event) for the milestone with this key, if the version has it."""
        return next(((phase, event) for phase, event in self.events() if event.key == key), None)
