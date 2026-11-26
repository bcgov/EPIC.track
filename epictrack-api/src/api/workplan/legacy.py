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
"""Builds a template version from the legacy template tables that the xlsx import fills.

Legacy actions find their targets by phase and milestone name. Here they become outcome effects that
target phases and milestones in the version. Anything that can't be resolved is a miss.
"""
import re
import uuid
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Dict, List, NamedTuple, Optional, Tuple

import sqlalchemy as sa

from api.workplan.core import template as tpl
from api.workplan.core.registry import RuleSet

# The same legacy event template gives its milestone the same key in every version built from it.
_KEY_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, "epictrack:event_templates")

ROLES_BY_EVENT_TYPE = {10: "TIME_LIMIT_EXTENSION", 12: "TIME_LIMIT_SUSPENSION", 38: "TIME_LIMIT_RESUMPTION"}

_INT = re.compile(r"^\s*-?\d+\s*$")
_FROM_END = re.compile(r"^\s*number_of_days\s*(?:([+-])\s*(\d+))?\s*$")


@dataclass
class LegacyTemplateSet:  # pylint: disable=too-many-instance-attributes
    """The active legacy template rows of one work type and EA Act."""

    work_type_id: int
    ea_act_id: int
    name: str
    rule_set: str
    all_phases_require_overage_responsibility: bool
    phases: List[dict] = field(default_factory=list)
    events: List[dict] = field(default_factory=list)
    outcomes: List[dict] = field(default_factory=list)
    actions: List[dict] = field(default_factory=list)
    # Project state ids by name, letters only, upper case.
    project_states: Dict[str, int] = field(default_factory=dict)


class LegacyConversionError(Exception):
    """A legacy template set couldn't be converted. `misses` lists every row that failed."""

    def __init__(self, misses: List[str]):
        """Keep every miss."""
        super().__init__("\n".join(misses))
        self.misses = misses


EMPTY_START_AT = "empty_start_at"
UNPARSED_START_AT = "unparsed_start_at"


def anchor_from_start_at(start_at: Optional[str], has_parent: bool) -> Tuple[str, int, Optional[str]]:
    """Return the anchor point and offset a legacy start_at gives, and the problem if it gives neither.

    A whole number counts from the anchor's start. With a parent, `number_of_days` and `number_of_days-N`
    count from the parent's end, since number_of_days is the parent's length. Anything else counts as 0.
    """
    start_at = (start_at or "").strip()
    if _INT.match(start_at):
        return tpl.START, int(start_at), None
    from_end = _FROM_END.match(start_at)
    if has_parent and from_end:
        sign, days = from_end.groups()
        return tpl.END, -int(days) if sign == "-" else int(days or 0), None
    return tpl.START, 0, EMPTY_START_AT if not start_at else UNPARSED_START_AT


def load_legacy_sets(connection) -> List[LegacyTemplateSet]:
    """Load every work type and EA Act that has active legacy phases."""
    def rows(sql):
        return [dict(row) for row in connection.execute(sa.text(sql)).mappings()]

    phases = rows(
        "SELECT pc.id, pc.work_type_id, pc.ea_act_id, pc.name, pc.sort_order, pc.legislated, pc.number_of_days,"
        " pc.visibility, pc.is_intake, wt.name AS work_type_name, wt.rule_set,"
        " wt.all_phases_require_overage_responsibility"
        " FROM phase_codes pc JOIN work_types wt ON wt.id = pc.work_type_id WHERE pc.is_active"
    )
    events = rows(
        "SELECT id, phase_id, parent_id, name, event_type_id, event_category_id, event_position, visibility,"
        " start_at, number_of_days, multiple_days, sort_order FROM event_templates WHERE is_active"
    )
    outcomes = rows("SELECT id, event_template_id, name, sort_order FROM outcome_templates WHERE is_active")
    actions = rows(
        "SELECT at.id, at.outcome_id, a.name AS action, at.additional_params, at.sort_order"
        " FROM action_templates at JOIN actions a ON a.id = at.action_id WHERE at.is_active"
    )
    project_states = {_letters(row["name"]): row["id"] for row in rows("SELECT id, name FROM project_states")}

    events_by_phase = _group(events, "phase_id")
    outcomes_by_event = _group(outcomes, "event_template_id")
    actions_by_outcome = _group(actions, "outcome_id")
    sets = {}
    for phase in phases:
        key = (phase["work_type_id"], phase["ea_act_id"])
        if key not in sets:
            sets[key] = LegacyTemplateSet(
                work_type_id=key[0], ea_act_id=key[1], name=phase["work_type_name"], rule_set=phase["rule_set"],
                all_phases_require_overage_responsibility=bool(phase["all_phases_require_overage_responsibility"]),
                project_states=project_states,
            )
        legacy = sets[key]
        legacy.phases.append(phase)
        for event in events_by_phase[phase["id"]]:
            legacy.events.append(event)
            for outcome in outcomes_by_event[event["id"]]:
                legacy.outcomes.append(outcome)
                legacy.actions += actions_by_outcome[outcome["id"]]
    return [sets[key] for key in sorted(sets)]


def build_version_from_legacy(legacy: LegacyTemplateSet, rule_set: RuleSet) -> Tuple[tpl.Version, List[str]]:
    """Return the version built from a legacy template set, and notes on what was dropped or assumed.

    Raises LegacyConversionError listing every milestone or action that couldn't be converted.
    """
    builder = _Builder(legacy, rule_set)
    version = builder.build()
    if builder.misses:
        raise LegacyConversionError(builder.misses)
    return version, builder.notes


class _Source(NamedTuple):
    """The milestone whose outcome is being converted."""

    phase: tpl.Phase
    event: tpl.Event
    label: str


class _Builder:  # pylint: disable=too-many-instance-attributes, too-few-public-methods
    """Converts one legacy template set, collecting misses and notes as it goes."""

    def __init__(self, legacy: LegacyTemplateSet, rule_set: RuleSet):
        """Start an empty version for the set."""
        self.legacy = legacy
        self.rule_set = rule_set
        self.misses: List[str] = []
        self.notes: List[str] = []
        self.version = tpl.Version(work_type_id=legacy.work_type_id, ea_act_id=legacy.ea_act_id, rule_set=rule_set.name)
        self.phases: Dict[int, tpl.Phase] = {}
        self.events: Dict[int, tpl.Event] = {}
        self.start_at: Dict[int, Optional[str]] = {}
        self.codes_by_name: Dict[str, List[int]] = defaultdict(list)
        # AddPhase gives a phase a new name, which later actions use to find it.
        self.renamed: Dict[str, set] = defaultdict(set)
        self.converters = {
            "SetWorkState": self._set_work_state,
            "SetProjectStatus": self._set_project_status,
            "SetProjectState": self._set_project_state,
            "SetWorkDecisionMaker": self._set_decision_maker,
            "SetFederalInvolvement": self._set_federal_involvement,
            "CreateWork": self._create_work,
            "LockWorkStartDate": self._lock_work_start_date,
            "SetEventName": self._set_event_name,
            "SetEventDate": self._set_event_date,
            "AddEvent": self._add_event,
            "AddPhase": self._add_phase,
            "ChangePhaseEndEvent": self._change_phase_end_event,
            "SetEventsStatus": self._set_events_status,
            "SetPhasesStatus": self._set_phases_status,
        }

    def build(self) -> tpl.Version:
        """Convert the phases, milestones, anchors and outcomes."""
        self._add_phases()
        self._add_events()
        self._collect_renames()
        self._add_outcomes()
        return self.version

    def _add_phases(self):
        previous = None
        for row in sorted(self.legacy.phases, key=lambda r: (r["sort_order"] or 0, r["id"])):
            kind = tpl.LEGISLATED if row["legislated"] else tpl.FREE
            visibility = row["visibility"] or tpl.REGULAR
            phase = tpl.Phase(
                phase_code_id=row["id"], name=row["name"], time_limit_kind=kind,
                number_of_days=row["number_of_days"] or 0, visibility=visibility,
                in_default_sequence=visibility == tpl.REGULAR, is_intake=bool(row["is_intake"]),
                requires_overage_responsibility=(
                    kind == tpl.LEGISLATED or self.legacy.all_phases_require_overage_responsibility
                ),
            )
            phase.day_basis = self.rule_set.default_day_basis(phase, previous)
            if phase.in_default_sequence:
                previous = phase
            self.version.phases.append(phase)
            self.phases[phase.phase_code_id] = phase
            self.codes_by_name[phase.name].append(phase.phase_code_id)

    def _add_events(self):
        rows_by_phase = _group(self.legacy.events, "phase_id")
        for phase in self.version.phases:
            rows = sorted(rows_by_phase[phase.phase_code_id], key=lambda r: (r["sort_order"], r["id"]))
            for row in rows:
                event = tpl.Event(
                    key=uuid.uuid5(_KEY_NAMESPACE, str(row["id"])), name=row["name"],
                    event_type_id=row["event_type_id"], event_category_id=row["event_category_id"],
                    visibility=row["visibility"], event_position=row["event_position"] or tpl.INTERMEDIATE,
                    role=ROLES_BY_EVENT_TYPE.get(row["event_type_id"]), number_of_days=row["number_of_days"] or 0,
                    multiple_days=bool(row["multiple_days"]), legacy_event_template_id=row["id"],
                )
                phase.events.append(event)
                self.events[row["id"]] = event
                self.start_at[row["id"]] = row["start_at"]
            for row in rows:
                self._set_anchor(phase, row)

    def _set_anchor(self, phase, row):
        event = self.events[row["id"]]
        label = f"{self.legacy.name}: {phase.name} / {event.name}"
        if row["parent_id"] is not None:
            parent = self.events.get(row["parent_id"])
            if parent is None:
                self.misses.append(f"{label}: its parent milestone {row['parent_id']} isn't active")
                return
            event.anchor_key = parent.key
        event.anchor_point, event.offset_days, problem = anchor_from_start_at(
            row["start_at"], row["parent_id"] is not None)
        if problem is None:
            return
        start_at = (row["start_at"] or "").strip()
        if row["parent_id"] is None:
            self.notes.append(f"{label}: start_at {start_at!r} is counted as 0 days from the phase start")
        elif problem == EMPTY_START_AT:
            self.notes.append(f"{label}: an empty start_at is counted as 0 days from its parent")
        else:
            self.misses.append(f"{label}: can't convert start_at {start_at!r}")

    def _collect_renames(self):
        for action in self.legacy.actions:
            if action["action"] != "AddPhase":
                continue
            for item in _as_list(action["additional_params"]):
                codes = self.codes_by_name.get(item.get("phase_name"), [])
                if len(codes) == 1 and item.get("new_name") and item["new_name"] != item.get("phase_name"):
                    self.renamed[item["new_name"]].add(codes[0])

    def _add_outcomes(self):
        outcomes_by_event = _group(self.legacy.outcomes, "event_template_id")
        actions_by_outcome = _group(self.legacy.actions, "outcome_id")
        for phase, event in self.version.events():
            rows = sorted(outcomes_by_event[event.legacy_event_template_id], key=lambda r: (r["sort_order"], r["id"]))
            for row in rows:
                outcome = tpl.Outcome(name=row["name"])
                for action in sorted(actions_by_outcome[row["id"]], key=lambda r: (r["sort_order"], r["id"])):
                    label = f"{self.legacy.name}: {phase.name} / {event.name} / {outcome.name}: {action['action']}"
                    converter = self.converters.get(action["action"])
                    if converter is None:
                        self.misses.append(f"{label}: unknown action")
                        continue
                    for effect in converter(action["additional_params"] or {}, _Source(phase, event, label)):
                        if effect not in outcome.effects:
                            outcome.effects.append(effect)
                event.outcomes.append(outcome)

    def _phase_named(self, item, source, include_renamed=True) -> Optional[tpl.Phase]:
        for name, expected in (("work_type_id", self.legacy.work_type_id), ("ea_act_id", self.legacy.ea_act_id)):
            if item.get(name) is not None and item[name] != expected:
                self.misses.append(f"{source.label}: {name} {item[name]} isn't this template's")
                return None
        name = item.get("phase_name")
        if not name:
            return source.phase
        codes = self.codes_by_name.get(name) or (sorted(self.renamed.get(name, ())) if include_renamed else [])
        if len(codes) != 1:
            self.misses.append(f"{source.label}: phase '{name}' {'is ambiguous' if codes else 'not found'}")
            return None
        return self.phases[codes[0]]

    def _event_named(self, item, source, prefer_hidden=False) -> Optional[tpl.Event]:
        phase = self._phase_named(item, source)
        if phase is None:
            return None
        name = item.get("event_name")
        matches = [event for event in phase.events if event.name == name]
        # Calendar children often share a name, so a top-level milestone wins.
        top_level = [event for event in matches if event.anchor_key is None]
        hidden = [event for event in matches if event.visibility == tpl.HIDDEN]
        if len(top_level) == 1:
            return top_level[0]
        if not top_level and len(matches) == 1:
            return matches[0]
        if prefer_hidden and len(hidden) == 1:
            return hidden[0]
        found = "is ambiguous" if matches else "not found"
        self.misses.append(f"{source.label}: milestone '{name}' in '{phase.name}' {found}")
        return None

    def _set_work_state(self, params, _source):
        return [tpl.Effect("SET_WORK_STATE", params={"work_state": params.get("work_state")})]

    def _set_project_status(self, params, _source):
        return [tpl.Effect("SET_PROJECT_STATUS", params={"is_active": params.get("is_active")})]

    def _set_project_state(self, params, source):
        state_id = params.get("project_state_id")
        if state_id is None and params.get("project_state"):
            state_id = self.legacy.project_states.get(_letters(params["project_state"]))
            if state_id is None:
                self.misses.append(f"{source.label}: project state '{params['project_state']}' not found")
                return []
        return [tpl.Effect("SET_PROJECT_STATE", params={"project_state_id": state_id})]

    def _set_decision_maker(self, params, _source):
        return [tpl.Effect("SET_DECISION_MAKER", params={"position_id": params.get("position_id")})]

    def _set_federal_involvement(self, params, _source):
        params = {"federal_involvement_id": params.get("federal_involvement_id")}
        return [tpl.Effect("SET_FEDERAL_INVOLVEMENT", params=params)]

    def _create_work(self, params, source):
        if params.get("work_type") is None:
            self.notes.append(f"{source.label}: dropped, as it names no work type for the new work")
            return []
        return [tpl.Effect("CREATE_LINKED_WORK", params={"work_type_id": params["work_type"]})]

    def _lock_work_start_date(self, params, source):
        source.event.sets_work_start = True
        if params.get("start_at"):
            self.notes.append(f"{source.label}: sets the work start, without its start_at of {params['start_at']}")
        return []

    def _set_event_name(self, _params, source):
        self.notes.append(f"{source.label}: dropped, as milestones are no longer renamed")
        return []

    def _set_event_date(self, params, source):
        target = self._event_named(params, source)
        if target is None:
            return []
        offset = _to_int(params.get("start_at"))
        if target.event_position == tpl.START:
            # Phase sequencing dates a START, as the day after the previous phase's END.
            if offset not in (0, 1):
                self.notes.append(f"{source.label}: dropped, though it dated '{target.name}' {offset} days later")
            return []
        return [tpl.Effect("ANCHOR_EVENT", target_event_key=target.key, params={"offset_days": offset})]

    def _add_event(self, params, source):
        effects = []
        for item in _as_list(params):
            # AddEvent mostly brings in hidden milestones, so a single hidden match wins a shared name.
            target = self._event_named(item, source, prefer_hidden=True)
            if target is None:
                continue
            offset = _to_int(item.get("start_at", self.start_at[target.legacy_event_template_id]))
            if offset is None:
                self.misses.append(f"{source.label}: can't convert start_at for '{target.name}'")
                continue
            if target.visibility != tpl.HIDDEN:
                target.repeatable = True
            effect_params = {"offset_days": offset, "visibility": item.get("visibility", "MANDATORY")}
            if _to_bool(item.get("use_phase_start")):
                effect_params["from_phase_start"] = True
            if item.get("new_name") and item["new_name"] != target.name:
                effect_params["name"] = item["new_name"]
            effects.append(tpl.Effect("ADD_OCCURRENCE", target_event_key=target.key, params=effect_params))
        return effects

    def _add_phase(self, params, source):
        effects = []
        for item in _as_list(params):
            # AddPhase finds the phase code by its own name, never by a new name.
            phase = self._phase_named(item, source, include_renamed=False)
            if phase is None:
                continue
            effect_params = {}
            if item.get("new_name"):
                effect_params["name"] = item["new_name"]
            if item.get("legislated") is not None:
                effect_params["time_limit_kind"] = tpl.LEGISLATED if item["legislated"] else tpl.FREE
            effects.append(tpl.Effect("ADD_PHASES", target_phase_code_id=phase.phase_code_id, params=effect_params))
        return effects

    def _change_phase_end_event(self, params, source):
        if params.get("this_event"):
            return [tpl.Effect("END_PHASE_HERE")]
        target = self._event_named(params, source)
        if target is None:
            return []
        return [tpl.Effect("END_PHASE_HERE", target_event_key=None if target is source.event else target.key)]

    def _set_events_status(self, params, source):
        if not isinstance(params, list):
            if params.get("all_future_events") is not None:
                return [tpl.Effect("END_PHASE_HERE")]
            self.notes.append(f"{source.label}: dropped, as it does nothing without all_future_events")
            return []
        effects = []
        for item in params:
            if item.get("is_active") is not False:
                self.misses.append(f"{source.label}: only turning a milestone off is supported")
                continue
            target = self._event_named(item, source)
            if target is not None:
                effects.append(tpl.Effect("SKIP_EVENTS", target_event_key=target.key))
        return effects

    def _set_phases_status(self, params, source):
        if not isinstance(params, list):
            if params.get("all_future_phases") is not None:
                # v1 also turns off the rest of this phase's milestones and completes it.
                return [tpl.Effect("END_PHASE_HERE"), tpl.Effect("SKIP_PHASES", params={"all_later": True})]
            self.notes.append(f"{source.label}: dropped, as it does nothing without all_future_phases")
            return []
        effects = []
        for item in params:
            if item.get("is_active") is not False:
                self.misses.append(f"{source.label}: only turning a phase off is supported")
                continue
            # v1 finds these by phase code name only.
            phase = self._phase_named(item, source, include_renamed=False)
            if phase is not None:
                effects.append(tpl.Effect("SKIP_PHASES", target_phase_code_id=phase.phase_code_id))
        return effects


def _group(rows, key):
    grouped = defaultdict(list)
    for row in rows:
        grouped[row[key]].append(row)
    return grouped


def _as_list(params):
    return params if isinstance(params, list) else [params]


def _letters(name: str) -> str:
    return re.sub(r"[^A-Z]", "", name.upper())


def _to_int(value) -> Optional[int]:
    if isinstance(value, bool):
        return None
    if isinstance(value, int):
        return value
    return int(value) if isinstance(value, str) and _INT.match(value) else None


def _to_bool(value) -> bool:
    return value is True or isinstance(value, str) and value.strip().lower() == "true"
