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
"""Checks a template version before it's saved or published.

These rules are checked here, not by database constraints, so they hold wherever the version is stored.
"""
from collections import Counter
from typing import List

from . import template as tpl
from .registry import EVENT, PHASE, RuleSet


def validate_version(version: tpl.Version, rule_set: RuleSet) -> List[str]:
    """Return every problem with the version, or an empty list when it's valid."""
    problems = _phase_problems(version) + _event_problems(version, rule_set) + _anchor_problems(version)
    problems += _effect_problems(version, rule_set)
    for check in rule_set.checks:
        problems += check(version)
    return problems


def _phase_problems(version):
    problems = []
    if not any(phase.in_default_sequence for phase in version.phases):
        problems.append("The version has no phases in its default sequence")
    for code, count in Counter(phase.phase_code_id for phase in version.phases).items():
        if count > 1:
            problems.append(f"Phase code {code} appears {count} times")
    for phase in version.phases:
        for value, allowed in (
            (phase.time_limit_kind, tpl.TIME_LIMIT_KINDS),
            (phase.day_basis, tpl.DAY_BASES),
            (phase.start_usually_set_by, tpl.BOUNDARY_SIDES),
            (phase.visibility, tpl.PHASE_VISIBILITIES),
        ):
            if value not in allowed:
                problems.append(f"{phase.name}: unknown value {value!r}")
        if phase.number_of_days < 0:
            problems.append(f"{phase.name}: number_of_days is negative")
    return problems


def _event_problems(version, rule_set):
    problems = []
    for key, count in Counter(event.key for _, event in version.events()).items():
        if count > 1:
            problems.append(f"Milestone key {key} appears {count} times")
    for flag in ("sets_work_start", "sets_official_start"):
        flagged = [event.name for _, event in version.events() if getattr(event, flag)]
        if len(flagged) > 1:
            problems.append(f"More than one milestone has {flag}: {', '.join(flagged)}")
    for phase in version.phases:
        # Hidden milestones are only added by an outcome, so they don't count.
        positions = Counter(event.event_position for event in phase.events if event.visibility != tpl.HIDDEN)
        for position in (tpl.START, tpl.END):
            if positions[position] != 1:
                problems.append(f"{phase.name}: has {positions[position]} {position} milestones, not 1")
        for event in phase.events:
            label = f"{phase.name} / {event.name}"
            for value, allowed in (
                (event.event_position, tpl.EVENT_POSITIONS),
                (event.visibility, tpl.EVENT_VISIBILITIES),
                (event.anchor_point, tpl.ANCHOR_POINTS),
            ):
                if value not in allowed:
                    problems.append(f"{label}: unknown value {value!r}")
            if event.role is not None and event.role not in rule_set.roles:
                problems.append(f"{label}: role {event.role!r} isn't in the {rule_set.name} rule set")
            if event.event_position in (tpl.START, tpl.END) and event.anchor_key is not None:
                problems.append(f"{label}: a {event.event_position} milestone can't be anchored to another")
    return problems


def _anchor_problems(version):
    problems = []
    anchors = {event.key: event.anchor_key for _, event in version.events()}
    for phase, event in version.events():
        if event.anchor_key is None:
            continue
        found = version.event_by_key(event.anchor_key)
        if found is None:
            problems.append(f"{phase.name} / {event.name}: its anchor isn't in the version")
        elif found[0] is not phase:
            problems.append(f"{phase.name} / {event.name}: its anchor '{found[1].name}' is in another phase")
        seen = {event.key}
        key = event.anchor_key
        while key is not None and key in anchors:
            if key in seen:
                problems.append(f"{phase.name} / {event.name}: its anchors form a cycle")
                break
            seen.add(key)
            key = anchors[key]
    return problems


def _effect_problems(version, rule_set):
    problems = []
    for phase, event in version.events():
        for outcome in event.outcomes:
            for effect in outcome.effects:
                label = f"{phase.name} / {event.name} / {outcome.name}: {effect.kind}"
                kind = rule_set.effect_kinds.get(effect.kind)
                if kind is None:
                    problems.append(f"{label} isn't an effect kind in the {rule_set.name} rule set")
                    continue
                found = [f"{label} {problem}" for problem in _target_problems(effect, kind, version)]
                found += [f"{label} {problem}" for problem in _param_problems(effect, kind)]
                if not found and kind.check:
                    found = [f"{label} {problem}" for problem in kind.check(effect, phase, event, version)]
                problems += found
    return problems


def _target_problems(effect, kind, version):
    phase_key, event_key = effect.target_phase_code_id, effect.target_event_key
    if kind.target != PHASE and phase_key is not None or kind.target != EVENT and event_key is not None:
        return ["has a target it doesn't take"]
    key = phase_key if kind.target == PHASE else event_key
    if kind.target is None or key is None:
        return ["needs a target"] if kind.target and kind.target_required else []
    found = version.phase_by_code(key) if kind.target == PHASE else version.event_by_key(key)
    return [] if found else ["has a target that isn't in the version"]


def _param_problems(effect, kind):
    problems = []
    allowed = {**kind.params, **kind.optional_params}
    for name in effect.params:
        if name not in allowed:
            problems.append(f"has an unknown param {name!r}")
    for name, types in allowed.items():
        if name not in effect.params:
            if name in kind.params:
                problems.append(f"needs param {name!r}")
            continue
        value = effect.params[name]
        # bool is an int, so it only passes where bool is allowed.
        if isinstance(value, bool) and bool not in types or not isinstance(value, types):
            problems.append(f"param {name!r} has the wrong type")
    return problems
