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
"""Tests for the template version validator and the rule set registry."""
import uuid

import pytest

from api.workplan.core import template as tpl
from api.workplan.core.registry import EffectKind, make_rule_set
from api.workplan.core.validation import validate_version
from api.workplan.rules import get_rule_set
from api.workplan.rules.eao import default_day_basis

EAO = get_rule_set("EAO")


def _event(name, position=tpl.INTERMEDIATE, visibility="MANDATORY", **fields):
    return tpl.Event(
        key=uuid.uuid4(), name=name, event_type_id=1, event_category_id=1, visibility=visibility,
        event_position=position, **fields,
    )


def _valid_version():
    """Two phases, each with a START and an END, and an outcome using most effect kinds."""
    start, end = _event("Start", tpl.START), _event("End", tpl.END)
    closes = _event("Closes", anchor_key=start.key, anchor_point=tpl.END, offset_days=-2)
    # A hidden END only arrives through an outcome, so the phase still has one END.
    hidden_end = _event("Withdrawn", tpl.END, visibility=tpl.HIDDEN)
    review_start, review_end = _event("Review start", tpl.START), _event("Review end", tpl.END)
    start.outcomes.append(tpl.Outcome("Approved", effects=[
        tpl.Effect("END_PHASE_HERE"),
        tpl.Effect("END_PHASE_HERE", target_event_key=hidden_end.key),
        tpl.Effect("SKIP_PHASES", params={"all_later": True}),
        tpl.Effect("ADD_PHASES", target_phase_code_id=2, params={"name": "Again", "time_limit_kind": tpl.LEGISLATED}),
        tpl.Effect("ANCHOR_EVENT", target_event_key=closes.key, params={"offset_days": 5}),
        tpl.Effect("ADD_OCCURRENCE", target_event_key=hidden_end.key, params={"offset_days": 0, "visibility": "OPTIONAL"}),
        tpl.Effect("SET_PROJECT_STATE", params={"project_state_id": 13}),
        tpl.Effect("SET_FEDERAL_INVOLVEMENT", params={"federal_involvement_id": None}),
    ]))
    return tpl.Version(work_type_id=1, ea_act_id=3, rule_set="EAO", phases=[
        tpl.Phase(phase_code_id=1, name="Intake", events=[start, closes, hidden_end, end]),
        tpl.Phase(phase_code_id=2, name="Review", time_limit_kind=tpl.LEGISLATED, events=[review_start, review_end]),
    ])


def _effects(version):
    return version.phases[0].events[0].outcomes[0].effects


def _set_effect(version, effect):
    _effects(version)[:] = [effect]


def _anchor_in_other_phase(version):
    version.phases[0].events[1].anchor_key = version.phases[1].events[0].key


def _anchor_cycle(version):
    closes = version.phases[0].events[1]
    late = _event("Late", anchor_key=closes.key)
    closes.anchor_key = late.key
    version.phases[0].events.append(late)


BROKEN = [
    (lambda v: v.phases[1].__setattr__("phase_code_id", 1), "Phase code 1 appears 2 times"),
    (lambda v: [p.__setattr__("in_default_sequence", False) for p in v.phases], "no phases in its default sequence"),
    (lambda v: v.phases[0].__setattr__("time_limit_kind", "SOMETIMES"), "Intake: unknown value 'SOMETIMES'"),
    (lambda v: v.phases[1].events[1].__setattr__("key", v.phases[1].events[0].key), "appears 2 times"),
    (lambda v: v.phases[1].events.pop(0), "Review: has 0 START milestones, not 1"),
    (lambda v: v.phases[0].events[2].__setattr__("visibility", "OPTIONAL"), "Intake: has 2 END milestones, not 1"),
    (lambda v: v.phases[1].events[0].__setattr__("anchor_key", v.phases[1].events[1].key), "can't be anchored"),
    (_anchor_in_other_phase, "Intake / Closes: its anchor 'Review start' is in another phase"),
    (_anchor_cycle, "its anchors form a cycle"),
    (lambda v: v.phases[0].events[1].__setattr__("role", "WORK_REFERRAL"), "isn't in the EAO rule set"),
    (
        lambda v: [e.__setattr__("sets_work_start", True) for e in v.phases[0].events[0:2]],
        "More than one milestone has sets_work_start: Start, Closes",
    ),
    (lambda v: _set_effect(v, tpl.Effect("RENAME_EVENT")), "RENAME_EVENT isn't an effect kind in the EAO rule set"),
    (lambda v: _set_effect(v, tpl.Effect("SKIP_EVENTS")), "SKIP_EVENTS needs a target"),
    (lambda v: _set_effect(v, tpl.Effect("SKIP_EVENTS", target_event_key=uuid.uuid4())), "isn't in the version"),
    (
        lambda v: _set_effect(v, tpl.Effect("SET_WORK_STATE", target_phase_code_id=1, params={"work_state": "X"})),
        "SET_WORK_STATE has a target it doesn't take",
    ),
    (lambda v: _set_effect(v, tpl.Effect("SET_WORK_STATE")), "SET_WORK_STATE needs param 'work_state'"),
    (
        lambda v: _set_effect(v, tpl.Effect("SET_WORK_STATE", params={"work_state": "X", "colour": "red"})),
        "has an unknown param 'colour'",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect("SET_DECISION_MAKER", params={"position_id": True})),
        "param 'position_id' has the wrong type",
    ),
    (lambda v: _set_effect(v, tpl.Effect("SKIP_PHASES")), "needs a target phase or all_later, not both"),
    (
        lambda v: _set_effect(v, tpl.Effect("SKIP_PHASES", target_phase_code_id=2, params={"all_later": True})),
        "needs a target phase or all_later, not both",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect("ADD_PHASES", target_phase_code_id=2, params={"time_limit_kind": "X"})),
        "has an unknown time_limit_kind 'X'",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect(
            "ADD_OCCURRENCE", target_event_key=v.phases[0].events[1].key,
            params={"offset_days": 0, "visibility": "OPTIONAL"},
        )),
        "its target 'Closes' isn't repeatable or hidden",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect(
            "ADD_OCCURRENCE", target_event_key=v.phases[0].events[2].key, params={"offset_days": 0, "visibility": "X"},
        )),
        "ADD_OCCURRENCE has an unknown visibility 'X'",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect("END_PHASE_HERE", target_event_key=v.phases[1].events[1].key)),
        "END_PHASE_HERE its target 'Review end' is in another phase",
    ),
    (
        lambda v: _set_effect(v, tpl.Effect(
            "ANCHOR_EVENT", target_event_key=v.phases[1].events[0].key, params={"offset_days": 1},
        )),
        "ANCHOR_EVENT its target 'Review start' is in another phase",
    ),
]


def test_a_valid_version_has_no_problems():
    """The validator passes a version that follows every rule."""
    assert validate_version(_valid_version(), EAO) == []


@pytest.mark.parametrize("break_it, problem", BROKEN)
def test_the_validator_rejects_a_broken_version(break_it, problem):
    """Each broken rule is reported, naming where it broke."""
    version = _valid_version()
    break_it(version)

    problems = validate_version(version, EAO)

    assert any(problem in found for found in problems), problems


def test_effect_kinds_come_from_the_rule_set():
    """An effect kind EAO adds isn't available to a rule set without it."""
    version = _valid_version()
    plain = make_rule_set("PLAIN", default_day_basis=default_day_basis)

    problems = validate_version(version, plain)

    assert problems == [
        "Intake / Start / Approved: SET_PROJECT_STATE isn't an effect kind in the PLAIN rule set",
        "Intake / Start / Approved: SET_FEDERAL_INVOLVEMENT isn't an effect kind in the PLAIN rule set",
    ]


def test_a_rule_set_adds_its_own_roles_and_checks():
    """A rule set's roles are allowed beside the core's, and its own checks run with the core's."""
    version = _valid_version()
    version.phases[0].events[1].role = "WORK_REFERRAL"
    # The last two effects use EAO's own kinds.
    del _effects(version)[-2:]
    rule_set = make_rule_set(
        "OWN", default_day_basis=default_day_basis, roles=("WORK_REFERRAL",),
        checks=(lambda v: [f"{len(v.phases)} phases is too few"],),
    )

    assert validate_version(version, rule_set) == ["2 phases is too few"]


@pytest.mark.parametrize("roles, effect_kinds, problem", [
    (("TIME_LIMIT_EXTENSION",), (), "registers a role twice"),
    ((), (EffectKind("SKIP_EVENTS"),), "registers effect kind SKIP_EVENTS twice"),
])
def test_a_rule_set_cant_register_a_role_or_effect_kind_twice(roles, effect_kinds, problem):
    """A rule set's own roles and kinds can't reuse the core's names."""
    with pytest.raises(ValueError, match=problem):
        make_rule_set("TWICE", default_day_basis=default_day_basis, roles=roles, effect_kinds=effect_kinds)


@pytest.mark.parametrize("kind, previous_kind, expected", [
    (tpl.LEGISLATED, tpl.FREE, tpl.DAY_ZERO),
    (tpl.LEGISLATED, tpl.SET, tpl.DAY_ZERO),
    (tpl.LEGISLATED, tpl.LEGISLATED, tpl.DAY_ONE),
    (tpl.LEGISLATED, None, tpl.DAY_ONE),
    (tpl.FREE, tpl.FREE, tpl.DAY_ONE),
    (tpl.SET, tpl.FREE, tpl.DAY_ONE),
])
def test_eao_counts_from_day_zero_only_after_a_non_legislated_phase(kind, previous_kind, expected):
    """A legislated phase after a non-legislated one counts from Day Zero, as the EA Act says."""
    previous = tpl.Phase(phase_code_id=1, name="Before", time_limit_kind=previous_kind) if previous_kind else None

    assert default_day_basis(tpl.Phase(phase_code_id=2, name="This", time_limit_kind=kind), previous) == expected
