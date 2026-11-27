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
"""Tests for planning what a change to a milestone's dates does."""
from datetime import date, timedelta

import pytest

from api.workplan.core import template as tpl
from api.workplan.core.change import ChangeRefusedError, ChangeRequest, plan_change
from api.workplan.core.work_plan import PlanCalendarEntry, PlanMilestone, PlanPhase, WorkPlan

DAY_0 = date(2026, 1, 1)
LATER = DAY_0 + timedelta(days=365)


def _day(number):
    return DAY_0 + timedelta(days=number)


def _milestone(milestone_id, phase_id, position, day, **fields):
    return PlanMilestone(
        id=milestone_id, phase_id=phase_id, position=position, anticipated=_day(day), name=f"Milestone {milestone_id}",
        **fields)


def _work():
    """Phase 1 (days 0-10), legislated phase 2 (11-40, a 29-day limit, its END on the deadline), phase 3 (41-60)."""
    milestones = [
        _milestone(11, 1, tpl.START, 0), _milestone(12, 1, tpl.INTERMEDIATE, 5, number_of_days=4),
        _milestone(13, 1, tpl.END, 10),
        _milestone(14, 1, tpl.INTERMEDIATE, 7, anchor_id=12, offset_days=2),
        _milestone(15, 1, tpl.INTERMEDIATE, 8, anchor_id=12, anchor_point=tpl.END, offset_days=-1),
        _milestone(21, 2, tpl.START, 11), _milestone(22, 2, tpl.INTERMEDIATE, 20),
        _milestone(24, 2, tpl.INTERMEDIATE, 30), _milestone(23, 2, tpl.END, 40),
        _milestone(31, 3, tpl.START, 41), _milestone(32, 3, tpl.INTERMEDIATE, 50), _milestone(33, 3, tpl.END, 60),
    ]
    phases = [
        PlanPhase(1, 10, tpl.DAY_ZERO, False, False, _day(0), _day(10), [11, 12, 13, 14, 15]),
        PlanPhase(2, 29, tpl.DAY_ZERO, True, False, _day(11), _day(40), [21, 22, 24, 23]),
        PlanPhase(3, 19, tpl.DAY_ZERO, False, False, _day(41), _day(60), [31, 32, 33]),
    ]
    return WorkPlan(
        work_id=1, current_phase_id=1, phases=phases, milestones={m.id: m for m in milestones},
        calendar=[PlanCalendarEntry(91, 12, tpl.END, -1, _day(8))], work_start=_day(0),
    )


def _change(plan, milestone_id, day=None, actual=None, push=False, days=None, today=LATER):
    milestone = plan.milestones[milestone_id]
    request = ChangeRequest(
        milestone_id=milestone_id, anticipated=_day(day) if day is not None else milestone.anticipated,
        actual=_day(actual) if actual is not None else milestone.actual,
        number_of_days=milestone.number_of_days if days is None else days, push=push,
    )
    return plan_change(plan, request, today)


def _planned(changes):
    return {i: (c["anticipated"] - DAY_0).days for i, c in changes.milestones.items() if "anticipated" in c}


def _actual(changes):
    return {i: (c["actual"] - DAY_0).days for i, c in changes.milestones.items() if c.get("actual")}


def test_an_actual_date_can_t_be_in_the_future():
    """Nothing is recorded as done before it happens."""
    with pytest.raises(ChangeRefusedError, match="future"):
        _change(_work(), 12, actual=6, today=_day(5))


def test_an_entered_actual_date_isn_t_changed_here():
    """Correcting an actual date is its own change, with its own permission."""
    plan = _work()
    plan.milestones[12].actual = _day(5)

    with pytest.raises(ChangeRefusedError, match="already entered"):
        _change(plan, 12, actual=6)


def test_moving_an_end_moves_every_later_phase():
    """The next phase starts the day after, and the phases after it keep their places."""
    changes = _change(_work(), 13, day=15)

    assert _planned(changes) == {13: 15, 21: 16, 22: 25, 24: 35, 23: 45, 31: 46, 32: 55, 33: 65}
    assert changes.phases[2] == {"start": _day(16), "end": _day(45)}
    assert (changes.days_moved, changes.asks_to_push) == (5, False)


def test_recording_an_end_completes_the_phase_and_opens_the_next():
    """The next phase's START is recorded the day after, and the work moves on to it."""
    changes = _change(_work(), 13, actual=12)

    assert _actual(changes) == {13: 12, 21: 13}
    assert _planned(changes) == {22: 22, 24: 32, 23: 42, 31: 43, 32: 52, 33: 62}
    assert (changes.closed_phases, changes.current_phase_id) == ({1: _day(12)}, 2)


def test_moving_a_start_moves_the_previous_end_and_a_legislated_end_on_its_deadline():
    """The phase before ends the day before; an END on the deadline follows it, and so do the phases after."""
    changes = _change(_work(), 21, day=14)

    assert _planned(changes) == {21: 14, 13: 13, 23: 43, 31: 44, 32: 53, 33: 63}
    assert (changes.days_moved, changes.asks_to_push, changes.past_deadline) == (3, True, False)


def test_a_legislated_end_planned_off_its_deadline_stays():
    """A Lead's plan for the END is kept, and the warning says it's past the deadline."""
    plan = _work()
    plan.milestones[23].anticipated = _day(45)

    changes = _change(plan, 21, day=14)

    assert 23 not in changes.milestones
    assert changes.past_deadline


def test_a_day_one_deadline_counts_the_start_day():
    """A Day One phase's END on its deadline follows the START one day sooner than a Day Zero one."""
    plan = _work()
    plan.phases[1].day_basis = tpl.DAY_ONE
    plan.milestones[23].anticipated = _day(39)

    assert _planned(_change(plan, 21, day=14))[23] == 42


def test_recording_a_start_closes_the_phase_before_it():
    """Recording the next phase's start backdates the earlier phase's end and completes it."""
    changes = _change(_work(), 21, actual=11)

    assert _actual(changes) == {21: 11, 13: 10}
    assert (changes.closed_phases, changes.current_phase_id) == ({1: _day(10)}, 2)


def test_phases_complete_in_order():
    """A phase's END can't be recorded while an earlier phase is open."""
    with pytest.raises(ChangeRefusedError, match="in order"):
        _change(_work(), 23, actual=40)


def test_a_push_moves_the_later_milestones_and_the_phases_after():
    """In a non-legislated phase the END moves with the push, and the later phases follow it."""
    changes = _change(_work(), 12, day=7, push=True)

    assert _planned(changes) == {12: 7, 13: 12, 14: 9, 15: 10, 21: 13, 22: 22, 24: 32, 23: 42, 31: 43, 32: 52, 33: 62}
    assert changes.calendar == {91: _day(10)}


def test_without_a_push_only_children_follow():
    """Children follow their anchor's date, or its end, and calendar entries too."""
    changes = _change(_work(), 12, day=6)

    assert _planned(changes) == {12: 6, 14: 8, 15: 9}
    assert changes.calendar == {91: _day(9)}


def test_a_push_can_t_carry_a_milestone_past_a_legislated_end():
    """The legislated END doesn't move with a push, so a milestone pushed past it is refused."""
    assert _planned(_change(_work(), 22, day=28, push=True)) == {22: 28, 24: 38}
    with pytest.raises(ChangeRefusedError, match="'Milestone 24' can't be dated outside its phase"):
        _change(_work(), 22, day=32, push=True)


def test_an_end_can_t_come_before_its_start():
    """A phase can't end before it starts."""
    with pytest.raises(ChangeRefusedError, match="before its start"):
        _change(_work(), 13, day=-1)


def test_only_new_problems_block_a_change():
    """A date already outside its phase doesn't block a change that moves it, but a date being set can't be outside."""
    plan = _work()
    plan.milestones[32].anticipated = _day(70)

    assert _planned(_change(plan, 13, day=15))[32] == 75
    with pytest.raises(ChangeRefusedError, match="outside its phase"):
        _change(plan, 32, day=72)


def test_the_last_end_completes_the_work():
    """With every phase done, the work is completed."""
    plan = _work()
    for milestone_id in (11, 13, 21, 23, 31):
        plan.milestones[milestone_id].actual = plan.milestones[milestone_id].anticipated
    plan.phases[0].completed = plan.phases[1].completed = True
    plan.current_phase_id = 3

    changes = _change(plan, 33, actual=60)

    assert (changes.closed_phases, changes.current_phase_id, changes.work_completed) == ({3: _day(60)}, None, True)


def test_the_first_start_sets_the_work_start():
    """The work starts when its first phase does."""
    assert _change(_work(), 11, day=-3).work_start == _day(-3)


def test_a_planned_move_keeps_a_gap_the_work_already_has():
    """Moving a planned END moves the later phases by the same days, without closing an earlier gap."""
    plan = _work()
    for milestone_id in (21, 22, 24, 23, 31, 32, 33):
        plan.milestones[milestone_id].anticipated += timedelta(days=30)

    assert _planned(_change(plan, 13, day=13))[21] == 44


def test_recording_an_end_aligns_the_next_start_even_across_a_gap():
    """Once the end is recorded, the next phase starts the day after it."""
    plan = _work()
    for milestone_id in (21, 22, 24, 23, 31, 32, 33):
        plan.milestones[milestone_id].anticipated += timedelta(days=30)

    assert _actual(_change(plan, 13, actual=10))[21] == 11


def test_recording_an_end_today_plans_the_next_start_for_tomorrow():
    """A next START that hasn't come yet is planned, not recorded."""
    changes = _change(_work(), 13, actual=9, today=_day(9))

    assert (_actual(changes), _planned(changes)[21]) == ({13: 9}, 10)


def test_an_actual_date_already_saved_isn_t_checked_again():
    """Saving a milestone whose stored actual date is later than today doesn't fail on it."""
    plan = _work()
    plan.milestones[21].actual = _day(11)

    assert _change(plan, 21, day=11, today=_day(10)).milestones == {}


def test_a_milestone_outside_the_cascade_moves_only_its_children():
    """A calendar milestone neither pushes nor is pushed, but its children follow it and it stays inside its phase."""
    plan = _work()
    plan.milestones[16] = _milestone(16, 1, tpl.INTERMEDIATE, 6, in_cascade=False)
    plan.milestones[17] = _milestone(17, 1, tpl.INTERMEDIATE, 8, anchor_id=16, offset_days=2)
    plan.phases[0].milestone_ids += [16, 17]

    assert 16 not in _planned(_change(plan, 12, day=7, push=True))
    assert _planned(_change(plan, 16, day=7, push=True)) == {16: 7, 17: 9}
    with pytest.raises(ChangeRefusedError, match="outside its phase"):
        _change(plan, 16, day=12)


def test_an_end_on_the_same_day_is_still_later():
    """A phase's END comes after the other milestones on its day, so a push moves it."""
    plan = _work()
    plan.milestones[32].anticipated = _day(60)

    assert _planned(_change(plan, 32, day=62, push=True))[33] == 62
