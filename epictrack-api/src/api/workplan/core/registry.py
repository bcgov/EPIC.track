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
"""The milestone roles and outcome effect kinds a rule set offers: the core's, plus its own."""
from dataclasses import dataclass, field
from types import MappingProxyType
from typing import Callable, List, Mapping, Optional, Tuple

from . import template as tpl

PHASE = "phase"
EVENT = "event"

CORE_ROLES = ("TIME_LIMIT_EXTENSION", "TIME_LIMIT_SUSPENSION", "TIME_LIMIT_RESUMPTION")


@dataclass(frozen=True)
class EffectKind:
    """An outcome effect kind: what it targets, the params it takes, and any rule of its own.

    `check(effect, source_phase, source_event, version)` returns the effect's problems.
    """

    name: str
    target: Optional[str] = None
    target_required: bool = True
    params: Mapping[str, tuple] = field(default_factory=dict)
    optional_params: Mapping[str, tuple] = field(default_factory=dict)
    check: Optional[Callable[..., List[str]]] = None


@dataclass(frozen=True)
class RuleSet:
    """A business area's rules: its roles and effect kinds, its defaults, and its extra checks."""

    name: str
    roles: frozenset
    effect_kinds: Mapping[str, EffectKind]
    # (phase, previous phase in the default sequence or None) -> day basis
    default_day_basis: Callable[[tpl.Phase, Optional[tpl.Phase]], str]
    # (version) -> problems
    checks: Tuple[Callable[[tpl.Version], List[str]], ...] = ()


def _target_in_same_phase(effect, source_phase, _source_event, version):
    found = version.event_by_key(effect.target_event_key) if effect.target_event_key else None
    if found and found[0] is not source_phase:
        return [f"its target '{found[1].name}' is in another phase"]
    return []


def _phase_or_all_later(effect, _source_phase, _source_event, _version):
    if (effect.target_phase_code_id is None) == (effect.params.get("all_later") is not True):
        return ["needs a target phase or all_later, not both"]
    return []


def _known_time_limit_kind(effect, _source_phase, _source_event, _version):
    kind = effect.params.get("time_limit_kind")
    if kind is not None and kind not in tpl.TIME_LIMIT_KINDS:
        return [f"has an unknown time_limit_kind {kind!r}"]
    return []


def _occurrence_target(effect, _source_phase, _source_event, version):
    problems = []
    found = version.event_by_key(effect.target_event_key) if effect.target_event_key else None
    if found and not (found[1].repeatable or found[1].visibility == tpl.HIDDEN):
        problems.append(f"its target '{found[1].name}' isn't repeatable or hidden")
    visibility = effect.params.get("visibility")
    if visibility is not None and visibility not in tpl.EVENT_VISIBILITIES:
        problems.append(f"has an unknown visibility {visibility!r}")
    return problems


CORE_EFFECT_KINDS = (
    EffectKind("SET_WORK_STATE", params={"work_state": (str,)}),
    # The target, or this milestone when there's none, becomes the phase's END.
    EffectKind("END_PHASE_HERE", target=EVENT, target_required=False, check=_target_in_same_phase),
    EffectKind(
        "SKIP_PHASES", target=PHASE, target_required=False, optional_params={"all_later": (bool,)},
        check=_phase_or_all_later,
    ),
    EffectKind("SKIP_EVENTS", target=EVENT),
    EffectKind(
        "ADD_PHASES", target=PHASE, optional_params={"name": (str,), "time_limit_kind": (str,)},
        check=_known_time_limit_kind,
    ),
    EffectKind(
        "ADD_OCCURRENCE", target=EVENT, params={"offset_days": (int,), "visibility": (str,)},
        optional_params={"from_phase_start": (bool,), "name": (str,)}, check=_occurrence_target,
    ),
    EffectKind("ANCHOR_EVENT", target=EVENT, params={"offset_days": (int,)}, check=_target_in_same_phase),
    EffectKind("SET_DECISION_MAKER", params={"position_id": (int,)}),
    EffectKind("CREATE_LINKED_WORK", params={"work_type_id": (int,)}),
)


def make_rule_set(name, *, default_day_basis, roles=(), effect_kinds=(), checks=()) -> RuleSet:
    """Build a rule set from the core's roles and effect kinds plus its own."""
    all_roles = CORE_ROLES + tuple(roles)
    if len(set(all_roles)) != len(all_roles):
        raise ValueError(f"Rule set {name} registers a role twice")
    kinds = {}
    for kind in CORE_EFFECT_KINDS + tuple(effect_kinds):
        if kind.name in kinds:
            raise ValueError(f"Rule set {name} registers effect kind {kind.name} twice")
        kinds[kind.name] = kind
    return RuleSet(
        name=name, roles=frozenset(all_roles), effect_kinds=MappingProxyType(kinds),
        default_day_basis=default_day_basis, checks=tuple(checks),
    )
