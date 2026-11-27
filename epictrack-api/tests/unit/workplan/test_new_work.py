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
"""Tests for planning a new work from its template version."""
import uuid

from api.workplan.core import template as tpl
from api.workplan.core.new_work import plan_new_work


def _event(name, position=tpl.INTERMEDIATE, visibility="MANDATORY", anchor=None, point=tpl.START, offset=0, days=0):
    return tpl.Event(
        key=uuid.uuid5(uuid.NAMESPACE_URL, name), name=name, event_type_id=1, event_category_id=1,
        visibility=visibility, event_position=position, anchor_key=anchor.key if anchor else None, anchor_point=point,
        offset_days=offset, number_of_days=days,
    )


def _phase(code, days, basis=tpl.DAY_ZERO, visibility=tpl.REGULAR, events=()):
    return tpl.Phase(
        phase_code_id=code, name=f"Phase {code}", number_of_days=days, day_basis=basis, visibility=visibility,
        in_default_sequence=visibility == tpl.REGULAR, events=list(events),
    )


def _plan(*phases):
    return plan_new_work(tpl.Version(work_type_id=1, ea_act_id=3, rule_set="EAO", phases=list(phases)))


def test_each_phase_starts_the_day_after_the_last_one_ends():
    """A Day Zero phase ends its time limit after it starts, and a Day One phase a day sooner."""
    plan = _plan(_phase(1, 90), _phase(2, 30, tpl.DAY_ONE), _phase(3, 60))

    assert [(p.start_day, p.end_day) for p in plan] == [(0, 90), (91, 120), (121, 181)]


def test_a_phase_outside_the_sequence_doesn_t_move_the_next_one():
    """A hidden phase gets the dates the next phase would have, and the next phase still starts there."""
    plan = _plan(_phase(1, 10), _phase(2, 5, visibility=tpl.HIDDEN), _phase(3, 10))

    assert [(p.start_day, p.end_day) for p in plan] == [(0, 10), (11, 16), (11, 21)]


def test_start_and_end_milestones_take_the_phase_s_dates():
    """The END falls on the phase's end whatever its own offset says."""
    start, end = _event("Start", tpl.START, offset=5), _event("End", tpl.END, offset=999)

    [phase] = _plan(_phase(1, 30, tpl.DAY_ONE, events=[start, end]))

    assert [m.day for m in phase.milestones] == [0, 29]


def test_milestones_follow_their_anchors():
    """A milestone counts from the phase start, its anchor's date, or its anchor's end."""
    parent = _event("Comment period", offset=7, days=30)
    phase_events = [parent, _event("Open house", anchor=parent, offset=3),
                    _event("Ending soon", anchor=parent, point=tpl.END, offset=-2)]

    [phase] = _plan(_phase(1, 90, events=phase_events))

    assert [m.day for m in phase.milestones] == [7, 10, 35]


def test_dated_milestones_are_the_ones_the_current_engine_dates():
    """Mandatory and suggested top-level milestones, and the same children of dated ones, get dates."""
    parent = _event("Parent")
    optional = _event("Optional", visibility="OPTIONAL")
    child = _event("Child", visibility="SUGGESTED", anchor=parent)
    phase_events = [
        parent, optional, _event("Hidden", visibility="HIDDEN"), child,
        _event("Child of optional", anchor=optional), _event("Grandchild", anchor=child),
    ]

    [regular, hidden] = _plan(_phase(1, 30, events=phase_events), _phase(2, 30, visibility=tpl.HIDDEN, events=[
        _event("In a hidden phase")]))

    assert [(m.dated, m.source_key) for m in regular.milestones] == [
        (True, None), (False, None), (False, None), (True, parent.key), (False, None), (False, None)]
    assert [m.dated for m in hidden.milestones] == [False]
