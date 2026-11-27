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
"""Plans what a change to a milestone's dates does to the work. The save and the dry run share it, so they agree."""
import copy
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Dict, List, Optional, Set

from . import template as tpl
from .days import Milestone, deadline
from .work_plan import PlanMilestone, PlanPhase, WorkPlan


class ChangeRefusedError(Exception):
    """A change the rules don't allow."""

    def __init__(self, message: str):
        """Keep the message the user sees."""
        super().__init__(message)
        self.message = message


@dataclass
class ChangeRequest:
    """A milestone's new dates, and whether later planned milestones in its phase move with it."""

    milestone_id: int
    anticipated: date
    actual: Optional[date]
    number_of_days: int
    push: bool


@dataclass
class Changeset:  # pylint: disable=too-many-instance-attributes
    """What a change sets or moves, and what the dry run tells the user."""

    # {milestone id: {"anticipated": date, "actual": date}}, only what changed
    milestones: Dict[int, Dict[str, Optional[date]]] = field(default_factory=dict)
    # {phase id: {"start": date, "end": date, "completed": bool}}, only what changed
    phases: Dict[int, dict] = field(default_factory=dict)
    calendar: Dict[int, date] = field(default_factory=dict)
    current_phase_id: Optional[int] = None
    work_completed: bool = False
    work_start: Optional[date] = None
    # {phase id: its END's actual date} for the phases this change completes, for the overage gate
    closed_phases: Dict[int, date] = field(default_factory=dict)
    days_moved: int = 0
    # Later planned milestones in the phase would move with a push.
    asks_to_push: bool = False
    # A legislated phase's END would be planned past its deadline.
    past_deadline: bool = False


def plan_change(plan: WorkPlan, request: ChangeRequest, today: date) -> Changeset:
    """Apply the date rules to a copy of the plan, and return what changed."""
    planner = _Planner(copy.deepcopy(plan), request, today)
    planner.run()
    return planner.changes(plan)


def _days(number: int) -> timedelta:
    return timedelta(days=number)


_POSITION_ORDER = {tpl.START: 0, tpl.INTERMEDIATE: 1, tpl.END: 2}


def _order(milestone: PlanMilestone) -> tuple:
    # On the same day, a phase's START comes first and its END last.
    return milestone.date, _POSITION_ORDER[milestone.position], milestone.id


class _Planner:  # pylint: disable=too-many-instance-attributes
    def __init__(self, plan: WorkPlan, request: ChangeRequest, today: date):
        self.plan = plan
        self.request = request
        self.today = today
        self.milestone = plan.milestones[request.milestone_id]
        self.phase = plan.phase(self.milestone.phase_id)
        # Milestones whose dates this change sets or moves, and phases whose bounds move: only these are checked,
        # so a work with dates outside the rules can still be edited.
        self.moved: Set[int] = set()
        self.reshaped: Set[int] = set()
        self.closing: Set[int] = set()
        self.outside_before = {m.id for m in plan.milestones.values() if self._outside(m)}
        self.inverted_before = {phase.id for phase in plan.phases if phase.end < phase.start}
        # Only recording a new actual date aligns a boundary exactly.
        self.recording = request.actual is not None and self.milestone.actual is None
        self.days_moved = 0
        self.asks_to_push = False
        self.past_deadline = False

    def run(self):
        """Set the milestone's dates and carry the change through the work."""
        milestone, request = self.milestone, self.request
        self._check_request()
        index = self.plan.phases.index(self.phase)
        old_date = milestone.date
        old_end = milestone.date + _days(milestone.number_of_days)
        old_deadlines = {self._deadline(self.phase), self._deadline(self.phase, self.phase.day_basis)}
        later = self._later_in_phase(milestone) if milestone.in_cascade else []
        milestone.anticipated, milestone.actual = request.anticipated, request.actual
        milestone.number_of_days = request.number_of_days
        self.moved.add(milestone.id)
        # A milestone pushes by how far its end moves: its date plus its days.
        self.days_moved = (milestone.date + _days(milestone.number_of_days) - old_end).days
        self.asks_to_push = bool(self.days_moved and later)
        position = milestone.position if milestone.in_cascade else None
        if position == tpl.END:
            self._end_set(index, (milestone.date - old_date).days)
        elif position == tpl.START:
            self._start_set(index, (milestone.date - old_date).days, old_deadlines, later)
        elif request.push:
            self._push(later, self.days_moved)
        self._date_children()
        self._settle()

    def _check_request(self):
        milestone, request = self.milestone, self.request
        if request.actual and request.actual != milestone.actual and request.actual > self.today:
            raise ChangeRefusedError("An actual date can't be in the future.")
        if milestone.actual and request.actual != milestone.actual:
            raise ChangeRefusedError("An actual date that's already entered can't be changed yet.")

    def _later_in_phase(self, milestone: PlanMilestone) -> List[PlanMilestone]:
        """The planned top-level milestones after this one in its phase, which a push moves."""
        return [
            m for m in (self.plan.milestones[i] for i in self.phase.milestone_ids)
            if m.id != milestone.id and m.in_cascade and m.actual is None and m.anchor_id is None
            and m.position != tpl.START
            and _order(m) > _order(milestone) and not (m.position == tpl.END and self.phase.legislated)
        ]

    def _deadline(self, phase: PlanPhase, day_basis: Optional[str] = None) -> Optional[date]:
        start = self.plan.boundary(phase, tpl.START)
        if not phase.legislated or start is None:
            return None
        milestones = [
            Milestone(m.role, m.actual, m.number_of_days)
            for m in (self.plan.milestones[i] for i in phase.milestone_ids)
        ]
        return deadline(start.date, phase.time_limit, day_basis or phase.count_basis or phase.day_basis, milestones)

    def _move(self, milestone: PlanMilestone, days: int):
        if days and milestone.actual is None:
            milestone.anticipated += _days(days)
            self.moved.add(milestone.id)

    def _push(self, milestones: List[PlanMilestone], days: int):
        for milestone in milestones:
            self._move(milestone, days)
            if milestone.position == tpl.END:
                self._end_set(self.plan.phases.index(self.phase), days)

    def _end_set(self, index: int, days: int):
        """The next phase follows this one's end, and the phases after it keep their places."""
        phase = self.plan.phases[index]
        end = self.plan.boundary(phase, tpl.END)
        self.reshaped.add(phase.id)
        if end.actual and not phase.completed:
            phase.completed = True
            self.closing.add(phase.id)
        if index + 1 < len(self.plan.phases):
            self._set_next_start(index + 1, end, days)

    def _set_next_start(self, index: int, end: PlanMilestone, days: int):
        phase = self.plan.phases[index]
        start = self.plan.boundary(phase, tpl.START)
        if start is None:
            return
        recorded = self.recording and end.id == self.milestone.id
        # Recording the end aligns the next start with it; a planned move keeps any gap the work already has.
        target = end.date + _days(1) if recorded else start.date + _days(days)
        if start.actual:
            if start.actual != target:
                raise ChangeRefusedError(
                    f"'{start.name}' already has an actual date, so the phase before it can't end on "
                    f"{end.date.isoformat()}.")
            return
        shift = (target - start.date).days
        if recorded and target <= self.today:
            # Recording the end opens the next phase, once that day has come.
            start.actual = target
            self.moved.add(start.id)
        for later in self.plan.phases[index:]:
            self.reshaped.add(later.id)
            for milestone in (self.plan.milestones[i] for i in later.milestone_ids):
                if milestone.anchor_id is None and milestone.in_cascade:
                    self._move(milestone, shift)

    def _start_set(self, index: int, days: int, old_deadlines: Set[date], later: List[PlanMilestone]):
        """The previous phase's end follows this start; a legislated END follows its deadline."""
        phase, start = self.phase, self.milestone
        self.reshaped.add(phase.id)
        if index == 0:
            self.plan.work_start = start.date
        else:
            self._set_previous_end(index - 1, start, days)
        end = self.plan.boundary(phase, tpl.END)
        # An END on its deadline, counted either way, follows it.
        if phase.legislated and end is not None and end.actual is None and end.anticipated in old_deadlines:
            self._move(end, days)
            self._end_set(index, days)
        if self.request.push:
            self._push(later, self.days_moved)

    def _set_previous_end(self, index: int, start: PlanMilestone, days: int):
        phase = self.plan.phases[index]
        end = self.plan.boundary(phase, tpl.END)
        if end is None:
            return
        recorded = self.recording and start.id == self.milestone.id
        # Recording the start aligns the previous end with it; a planned move keeps any gap the work already has.
        target = start.date - _days(1) if recorded else end.date + _days(days)
        self.reshaped.add(phase.id)
        if end.actual:
            if end.actual != target:
                raise ChangeRefusedError(
                    f"'{end.name}' already has an actual date, so the next phase can't start on "
                    f"{start.date.isoformat()}.")
            return
        if recorded:
            end.actual = target
            phase.completed = True
            self.closing.add(phase.id)
        else:
            end.anticipated = target
        self.moved.add(end.id)

    def _date_children(self):
        """Children follow the milestone they're dated from, whether or not the change pushes."""
        changed = True
        while changed:
            changed = False
            for child in self.plan.milestones.values():
                if child.anchor_id in self.moved and child.actual is None and child.id not in self.moved:
                    anchor = self.plan.milestones[child.anchor_id]
                    child.anticipated = self._anchored(anchor, child.anchor_point, child.offset_days)
                    self.moved.add(child.id)
                    changed = True
        for entry in self.plan.calendar:
            if entry.anchor_id in self.moved:
                entry.anticipated = self._anchored(self.plan.milestones[entry.anchor_id], entry.anchor_point,
                                                   entry.offset_days)

    @staticmethod
    def _anchored(anchor: PlanMilestone, anchor_point: str, offset_days: int) -> date:
        return anchor.date + _days((anchor.number_of_days if anchor_point == tpl.END else 0) + offset_days)

    def _settle(self):
        """Phases take their dates from their START and END, and every moved date has to fit the rules."""
        for phase in self.plan.phases:
            start, end = self.plan.boundary(phase, tpl.START), self.plan.boundary(phase, tpl.END)
            phase.start = start.date if start else phase.start
            phase.end = end.date if end else phase.end
            phase.completed = bool(end and end.actual) or phase.completed
        for phase in self.plan.phases:
            if phase.id not in self.reshaped:
                continue
            if phase.end < phase.start and phase.id not in self.inverted_before:
                raise ChangeRefusedError("A phase's end can't come before its start.")
            end = self.plan.boundary(phase, tpl.END)
            phase_deadline = self._deadline(phase)
            if phase_deadline and end and end.actual is None and end.anticipated > phase_deadline:
                self.past_deadline = True
        for index, phase in enumerate(self.plan.phases):
            if phase.id in self.closing and not all(earlier.completed for earlier in self.plan.phases[:index]):
                raise ChangeRefusedError("Phases are completed in order: complete the earlier phases first.")
        for milestone in self.plan.milestones.values():
            touched = milestone.id in self.moved or (milestone.actual and milestone.phase_id in self.reshaped)
            # A date that was already outside its phase doesn't block the change, unless it's the one being set.
            new_problem = milestone.id == self.milestone.id or milestone.id not in self.outside_before
            if touched and new_problem and self._outside(milestone):
                raise ChangeRefusedError(
                    f"'{milestone.name}' can't be dated outside its phase. Move the phase's end first.")

    def _outside(self, milestone: PlanMilestone) -> bool:
        if milestone.position != tpl.INTERMEDIATE:
            return False
        phase = self.plan.phase(milestone.phase_id)
        return not phase.start <= milestone.date <= phase.end

    def changes(self, before: WorkPlan) -> Changeset:
        """What differs from the plan before the change."""
        result = Changeset(days_moved=self.days_moved, asks_to_push=self.asks_to_push, past_deadline=self.past_deadline)
        for milestone_id, milestone in self.plan.milestones.items():
            old = before.milestones[milestone_id]
            for name in ("anticipated", "actual"):
                if getattr(milestone, name) != getattr(old, name):
                    result.milestones.setdefault(milestone_id, {})[name] = getattr(milestone, name)
        for phase, old in zip(self.plan.phases, before.phases):
            for name in ("start", "end", "completed"):
                if getattr(phase, name) != getattr(old, name):
                    result.phases.setdefault(phase.id, {})[name] = getattr(phase, name)
            if phase.completed and not old.completed:
                result.closed_phases[phase.id] = self.plan.boundary(phase, tpl.END).actual
        for entry, old in zip(self.plan.calendar, before.calendar):
            if entry.anticipated != old.anticipated:
                result.calendar[entry.id] = entry.anticipated
        # Only closing a phase moves the work on: an ended work keeps its current phase and state.
        if result.closed_phases:
            current = next((phase.id for phase in self.plan.phases if not phase.completed), None)
            if current != before.current_phase_id:
                result.current_phase_id = current
            result.work_completed = current is None
        if self.plan.work_start != before.work_start:
            result.work_start = self.plan.work_start
        return result
