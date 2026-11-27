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
"""Converts each work's own actions into outcome effects, finding targets the way the current engine does.

The migration that adds outcome_effects runs backfill_effects for every work, and the current engine runs it through
work_backfill.backfill_work after creating rows. Each run re-resolves every effect, since an added phase or
milestone changes what a name finds, and writes only what changed.

Prod runs the whole feature branch in one upgrade, so this reads and writes only columns that exist at
migration 91a696b6de4c.
"""
from dataclasses import dataclass, field
from typing import Dict, Iterable, List, NamedTuple, Optional, Tuple

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

from api.models import OutcomeEffect, db
from api.workplan.core import template as tpl
from api.workplan.core.validation import param_problems
from api.workplan.legacy import LegacyTemplateSet, _Builder, _group, _letters, _Source
from api.workplan.migration_issues import Issue, replace_issues
from api.workplan.rules import get_rule_set

DROPPED_ACTION = "dropped_action"
UNRESOLVED_ACTION = "unresolved_action"
ISSUES = (DROPPED_ACTION, UNRESOLVED_ACTION)

EFFECT_COLUMNS = (
    "sort_order", "kind", "target_work_phase_id", "target_event_configuration_id", "target_template_phase_id",
    "target_template_event_id", "params",
)

# Only this revision's columns, so a column added later can't break the migration's writes.
outcome_effects = sa.table(
    "outcome_effects",
    sa.column("id", sa.Integer), sa.column("outcome_configuration_id", sa.Integer), sa.column("sort_order", sa.Integer),
    sa.column("kind", sa.String), sa.column("target_work_phase_id", sa.Integer),
    sa.column("target_event_configuration_id", sa.Integer), sa.column("target_template_phase_id", sa.Integer),
    sa.column("target_template_event_id", sa.Integer), sa.column("params", JSONB), sa.column("created_by", sa.String),
)


@dataclass
class WorkActions:  # pylint: disable=too-many-instance-attributes
    """One work's own rows, as the effects backfill reads them."""

    id: int
    work_type_id: int
    ea_act_id: int
    rule_set: str
    phases: List[dict] = field(default_factory=list)
    configurations: List[dict] = field(default_factory=list)
    outcomes: List[dict] = field(default_factory=list)
    actions: List[dict] = field(default_factory=list)
    effects: List[dict] = field(default_factory=list)


@dataclass
class Lookups:
    """What a work's actions can name outside the work."""

    # Active phase code ids by (work type, EA Act), then name
    phase_codes: Dict[Tuple[int, int], Dict[str, List[int]]] = field(default_factory=dict)
    # Version 1's template phase ids by (work type, EA Act), then phase code
    template_phases: Dict[Tuple[int, int], Dict[int, int]] = field(default_factory=dict)
    # Version 1's milestones by template phase id
    template_events: Dict[int, List[dict]] = field(default_factory=dict)
    project_states: Dict[str, int] = field(default_factory=dict)


class WorkEffects(NamedTuple):
    """A work's outcome effects, the milestone flags its actions decide, and the actions that didn't fully convert."""

    # Effect rows by outcome configuration id, in sort order
    effects: Dict[int, List[dict]]
    # {configuration id: {"repeatable": ..., "sets_work_start": ...}}; version 1's repeatable milestones stay repeatable
    flags: Dict[int, dict]
    issues: List[Issue]


def load_work_actions(connection, work_ids: Optional[Iterable[int]] = None) -> Tuple[List[WorkActions], Lookups]:
    """Return every non-deleted work's rows, or just these works', and what their actions can name."""
    params = {} if work_ids is None else {"ids": list(work_ids)}
    only = "" if work_ids is None else " AND w.id = ANY(:ids)"

    def rows(sql):
        return [dict(row) for row in connection.execute(sa.text(sql), params).mappings()]

    works = {
        row["id"]: WorkActions(**row) for row in rows(
            "SELECT w.id, w.work_type_id, w.ea_act_id, wt.rule_set FROM works w"
            " JOIN work_types wt ON wt.id = w.work_type_id WHERE NOT w.is_deleted" + only
        )
    }
    in_works = " JOIN works w ON w.id = wp.work_id WHERE NOT w.is_deleted" + only
    of_outcomes = (
        " JOIN outcome_configurations oc ON oc.id = x.outcome_configuration_id"
        " JOIN event_configurations ec ON ec.id = oc.event_configuration_id"
        " JOIN work_phases wp ON wp.id = ec.work_phase_id" + in_works
    )
    for row in rows(
        "SELECT wp.id, wp.work_id, wp.name, wp.sort_order, wp.visibility, wp.is_active, pc.name AS code_name,"
        " pc.work_type_id AS code_work_type_id, pc.ea_act_id AS code_ea_act_id, pc.is_active AS code_is_active"
        " FROM work_phases wp JOIN phase_codes pc ON pc.id = wp.phase_id" + in_works
    ):
        works[row["work_id"]].phases.append(row)
    for row in rows(
        "SELECT ec.id, wp.work_id, ec.work_phase_id, ec.parent_id, ec.name, ec.event_type_id, ec.event_category_id,"
        " ec.event_position, ec.visibility, ec.start_at, ec.repeat_count, ec.is_active,"
        " COALESCE(te.repeatable, false) AS version_one_repeatable FROM event_configurations ec"
        " LEFT JOIN template_events te ON te.id = ec.template_event_id"
        " JOIN work_phases wp ON wp.id = ec.work_phase_id" + in_works
    ):
        works[row["work_id"]].configurations.append(row)
    for row in rows(
        "SELECT oc.id, wp.work_id, oc.event_configuration_id FROM outcome_configurations oc"
        " JOIN event_configurations ec ON ec.id = oc.event_configuration_id"
        " JOIN work_phases wp ON wp.id = ec.work_phase_id" + in_works
    ):
        works[row["work_id"]].outcomes.append(row)
    for row in rows(
        "SELECT x.id, wp.work_id, x.outcome_configuration_id, a.name AS action, x.additional_params, x.sort_order"
        " FROM action_configurations x JOIN actions a ON a.id = x.action_id" + of_outcomes
        + " AND x.is_active AND NOT x.is_deleted"
    ):
        works[row["work_id"]].actions.append(row)
    for row in rows(
        "SELECT x.id, wp.work_id, x.outcome_configuration_id, " + ", ".join(f"x.{c}" for c in EFFECT_COLUMNS)
        + " FROM outcome_effects x" + of_outcomes
    ):
        works[row["work_id"]].effects.append(row)
    return list(works.values()), _load_lookups(connection)


def _load_lookups(connection) -> Lookups:
    def rows(sql):
        return connection.execute(sa.text(sql)).mappings()

    lookups = Lookups()
    for row in rows("SELECT id, work_type_id, ea_act_id, name FROM phase_codes WHERE is_active ORDER BY id"):
        names = lookups.phase_codes.setdefault((row["work_type_id"], row["ea_act_id"]), {})
        names.setdefault(row["name"], []).append(row["id"])
    for row in rows(
        "SELECT t.work_type_id, t.ea_act_id, p.phase_code_id, p.id FROM template_phases p"
        " JOIN work_template_versions v ON v.id = p.template_version_id"
        " JOIN work_templates t ON t.id = v.work_template_id WHERE v.version = 1"
    ):
        phases = lookups.template_phases.setdefault((row["work_type_id"], row["ea_act_id"]), {})
        phases[row["phase_code_id"]] = row["id"]
    # The legacy start_at is what AddEvent falls back on.
    for row in rows(
        "SELECT e.id, e.template_phase_id, e.name, e.event_type_id, e.event_category_id, e.event_position,"
        " e.visibility, e.anchor_template_event_id AS parent_id, et.start_at FROM template_events e"
        " JOIN work_template_versions v ON v.id = e.template_version_id"
        " LEFT JOIN event_templates et ON et.id = e.legacy_event_template_id WHERE v.version = 1 ORDER BY e.sort_order"
    ):
        lookups.template_events.setdefault(row["template_phase_id"], []).append(dict(row))
    lookups.project_states = {_letters(row["name"]): row["id"] for row in rows("SELECT id, name FROM project_states")}
    return lookups


def plan_effects(work: WorkActions, lookups: Lookups) -> WorkEffects:
    """Return the effects of the work's actions, the flags they decide, and the actions that didn't fully convert."""
    return _WorkBuilder(work, lookups).convert()


class _InVersionOne(NamedTuple):
    """A target in a phase an earlier effect of the same outcome adds: the version 1 row it's copied from."""

    id: int


class _WorkBuilder(_Builder):  # pylint: disable=too-few-public-methods, too-many-instance-attributes
    """Converts one work's actions with version 1's converters, finding targets by the current engine's rules.

    Here a phase's identity (phase_code_id) is its work phase id and a milestone's (key) is its configuration id.
    In a phase the outcome adds, they're _InVersionOne.
    """

    def __init__(self, work: WorkActions, lookups: Lookups):
        """Lay the work's own phases and milestones out as a version."""
        key = (work.work_type_id, work.ea_act_id)
        legacy = LegacyTemplateSet(
            work_type_id=work.work_type_id, ea_act_id=work.ea_act_id, name=f"Work {work.id}", rule_set=work.rule_set,
            all_phases_require_overage_responsibility=False, project_states=lookups.project_states,
        )
        super().__init__(legacy, get_rule_set(work.rule_set))
        self.work = work
        self.lookups = lookups
        self.phase_codes = lookups.phase_codes.get(key, {})
        self.code_names = {code: name for name, codes in self.phase_codes.items() for code in codes}
        self.template_phases = lookups.template_phases.get(key, {})
        self.phase_rows = {row["id"]: row for row in work.phases}
        self.milestone_rows = {row["id"]: row for row in work.configurations}
        # Phases the current outcome's earlier AddPhase actions add, in order.
        self.added_phases: List[dict] = []
        for row in sorted(work.phases, key=lambda r: (r["sort_order"], r["id"])):
            phase = tpl.Phase(phase_code_id=row["id"], name=row["name"], visibility=row["visibility"])
            self.version.phases.append(phase)
            self.phases[row["id"]] = phase
        for row in sorted(work.configurations, key=lambda r: r["id"]):
            event = self._event(row["id"], row)
            self.phases[row["work_phase_id"]].events.append(event)
            self.events[row["id"]] = event

    @staticmethod
    def _event(key, row) -> tpl.Event:
        return tpl.Event(
            key=key, name=row["name"], event_type_id=row["event_type_id"], event_category_id=row["event_category_id"],
            visibility=row["visibility"], event_position=row["event_position"],
        )

    def convert(self) -> WorkEffects:
        """Convert the actions of every outcome in the work."""
        actions = _group(self.work.actions, "outcome_configuration_id")
        effects, issues = {}, []
        for outcome in sorted(self.work.outcomes, key=lambda r: r["id"]):
            event = self.events[outcome["event_configuration_id"]]
            phase = self.phases[self.milestone_rows[event.key]["work_phase_id"]]
            self.added_phases = []
            converted: List[tpl.Effect] = []
            for action in sorted(actions[outcome["id"]], key=lambda r: (r["sort_order"], r["id"])):
                issues += self._convert(action, _Source(phase, event, action["action"]), converted)
            effects[outcome["id"]] = [self._row(effect, order) for order, effect in enumerate(converted, start=1)]
        flags = {
            key: {
                "repeatable": event.repeatable or self.milestone_rows[key]["version_one_repeatable"],
                "sets_work_start": event.sets_work_start,
            }
            for key, event in self.events.items()
        }
        return WorkEffects(effects, flags, issues)

    def _convert(self, action, source, converted: List[tpl.Effect]) -> List[Issue]:
        notes, misses = len(self.notes), len(self.misses)
        converter = self.converters.get(action["action"])
        if converter is None:
            self.misses.append(f"{source.label}: unknown action")
        else:
            for effect in converter(action["additional_params"] or {}, source):
                problems = self._effect_problems(effect, source)
                self.misses += [f"{source.label}: {effect.kind} {problem}" for problem in problems]
                if problems or effect in converted:
                    continue
                converted.append(effect)
                if effect.kind == "ADD_PHASES":
                    code = effect.target_phase_code_id
                    self.added_phases.append({
                        "name": effect.params.get("name"), "code_name": self.code_names[code],
                        "template_phase_id": self.template_phases[code],
                    })

        def issue(code, detail):
            return Issue(self.work.id, "action_configurations", action["id"], code, detail)

        return [issue(DROPPED_ACTION, note) for note in self.notes[notes:]] + [
            issue(UNRESOLVED_ACTION, miss) for miss in self.misses[misses:]]

    def _effect_problems(self, effect, source) -> List[str]:
        # Targets come from the work itself, so only the params and the kind's own rule need checking.
        kind = self.rule_set.effect_kinds[effect.kind]
        problems = param_problems(effect, kind)
        if not problems and kind.check:
            problems = kind.check(effect, source.phase, source.event, self.version)
        return problems

    def _row(self, effect: tpl.Effect, sort_order: int) -> dict:
        phase, event = effect.target_phase_code_id, effect.target_event_key
        if effect.kind == "ADD_PHASES":
            phase = _InVersionOne(self.template_phases[phase])
        return {
            "sort_order": sort_order,
            "kind": effect.kind,
            "target_work_phase_id": None if isinstance(phase, _InVersionOne) else phase,
            "target_event_configuration_id": None if isinstance(event, _InVersionOne) else event,
            "target_template_phase_id": phase.id if isinstance(phase, _InVersionOne) else None,
            "target_template_event_id": event.id if isinstance(event, _InVersionOne) else None,
            "params": effect.params,
        }

    def _phase_named(self, item, source, include_renamed=True) -> Optional[tpl.Phase]:
        # SetPhasesStatus, which doesn't include renames, finds a phase by its phase code's name.
        return self._find_phase(item, source, by_code_name=not include_renamed, regular_only=True)

    def _find_phase(self, item, source, by_code_name, regular_only) -> Optional[tpl.Phase]:
        if not self._is_this_template(item, source):
            return None
        column = "code_name" if by_code_name else "name"
        name = item.get("phase_name") or self.phase_rows[source.phase.phase_code_id][column]
        matches = [
            row for row in self.work.phases
            if row[column] == name and row["is_active"] and row["code_is_active"]
            and (row["code_work_type_id"], row["code_ea_act_id"]) == (self.work.work_type_id, self.work.ea_act_id)
            and (row["visibility"] == tpl.REGULAR or not regular_only)
        ]
        # AddPhase puts its phase right after the source phase, so it's the latest unless a match already follows.
        added = [phase for phase in self.added_phases if phase[column] == name]
        source_order = self.phase_rows[source.phase.phase_code_id]["sort_order"]
        if added and all(row["sort_order"] <= source_order for row in matches):
            return self._phase_to_add(added[-1])
        if not matches:
            self.misses.append(f"{source.label}: phase '{name}' not found")
            return None
        # A phase that AddPhase repeated keeps its name, and the latest one wins.
        return self.phases[max(matches, key=lambda row: (row["sort_order"], row["id"]))["id"]]

    def _phase_to_add(self, added) -> tpl.Phase:
        key = _InVersionOne(added["template_phase_id"])
        phase = self.version.phase_by_code(key)
        if phase is None:
            phase = tpl.Phase(phase_code_id=key, name=added["name"] or added["code_name"])
            for row in self.lookups.template_events.get(key.id, []):
                event = self._event(_InVersionOne(row["id"]), row)
                phase.events.append(event)
                self.milestone_rows[event.key] = {**row, "repeat_count": 0, "is_active": True}
            self.version.phases.append(phase)
        return phase

    def _event_named(self, item, source, prefer_hidden=False) -> Optional[tpl.Event]:
        if item.get("this_event"):
            return source.event
        phase = self._phase_named(item, source)
        return self._milestone_named(item, source, phase, prefer_hidden=prefer_hidden) if phase else None

    def _occurrence_target(self, item, source) -> Optional[tpl.Event]:
        # AddEvent's phase can be hidden, and it copies an inactive milestone when there's no active one.
        phase = self._find_phase(item, source, by_code_name=False, regular_only=False)
        return self._milestone_named(item, source, phase, include_inactive=True, prefer_hidden=True) if phase else None

    def _milestone_named(self, item, source, phase, include_inactive=False, prefer_hidden=False) -> Optional[tpl.Event]:
        name = item.get("event_name")
        named = [(event, self.milestone_rows[event.key]) for event in phase.events if event.name == name]
        matches = [match for match in named if match[1]["is_active"]] or (named if include_inactive else [])
        if not matches:
            self.misses.append(f"{source.label}: milestone '{name}' in '{phase.name}' not found")
            return None

        # The latest occurrence wins. The current engine leaves ties open, so they go version 1's way.
        def rank(match):
            row = match[1]
            hidden = prefer_hidden and row["visibility"] == tpl.HIDDEN
            return row["repeat_count"], row["parent_id"] is None, hidden, -row["id"]

        return max(matches, key=rank)[0]

    def _default_start_at(self, target: tpl.Event) -> Optional[str]:
        return self.milestone_rows[target.key]["start_at"]

    def _phase_code_named(self, item, source) -> Optional[int]:
        # AddPhase finds an active phase code by name, not a work phase.
        if not self._is_this_template(item, source):
            return None
        name = item.get("phase_name")
        codes = self.phase_codes.get(name, [])
        if len(codes) == 1 and codes[0] in self.template_phases:
            return codes[0]
        problem = "is ambiguous" if len(codes) > 1 else "isn't in version 1" if codes else "not found"
        self.misses.append(f"{source.label}: phase '{name}' {problem}")
        return None


def changes(work: WorkActions, planned: WorkEffects) -> Tuple[List[dict], List[dict], List[int]]:
    """Return the effect rows to insert and to update, and the ids to delete, so only differences are written."""
    current = {(row["outcome_configuration_id"], row["sort_order"]): row for row in work.effects}
    inserts, updates = [], []
    for outcome_id, rows in planned.effects.items():
        for row in rows:
            old = current.pop((outcome_id, row["sort_order"]), None)
            if old is None:
                inserts.append({"outcome_configuration_id": outcome_id, **row})
            elif any(old[column] != row[column] for column in EFFECT_COLUMNS):
                updates.append({"id": old["id"], **row})
    return inserts, updates, [row["id"] for row in current.values()]


def backfill_effects(connection, work_ids: Optional[Iterable[int]] = None) -> List[Issue]:
    """Write every work's effects and the flags its actions decide, or just these works', with plain statements.

    No history rows are written.
    """
    works, lookups = load_work_actions(connection, work_ids)
    inserts, updates, deletes, flags, issues = [], [], [], [], []
    for work in works:
        planned = plan_effects(work, lookups)
        work_inserts, work_updates, work_deletes = changes(work, planned)
        inserts += work_inserts
        updates += work_updates
        deletes += work_deletes
        flags += [{"id": configuration_id, **values} for configuration_id, values in planned.flags.items()]
        issues += planned.issues
    if flags:
        connection.execute(
            sa.text("UPDATE event_configurations SET repeatable = :repeatable, sets_work_start = :sets_work_start"
                    " WHERE id = :id"),
            flags,
        )
    if deletes:
        connection.execute(outcome_effects.delete().where(outcome_effects.c.id.in_(deletes)))
    if updates:
        connection.execute(
            outcome_effects.update().where(outcome_effects.c.id == sa.bindparam("effect_id")),
            [{"effect_id": row["id"], **{column: row[column] for column in EFFECT_COLUMNS}} for row in updates],
        )
    if inserts:
        connection.execute(outcome_effects.insert(), [{**row, "created_by": "system"} for row in inserts])
    replace_issues(connection, [work.id for work in works], issues, ISSUES)
    return issues


def apply_effects(work: WorkActions, planned: WorkEffects) -> None:
    """Write one work's effect changes through the session, so history records them."""
    inserts, updates, deletes = changes(work, planned)
    records = {
        record.id: record for record in
        db.session.query(OutcomeEffect).filter(OutcomeEffect.id.in_([row["id"] for row in updates] + deletes))
    }
    for row in inserts:
        db.session.add(OutcomeEffect(**row))
    for row in updates:
        for column in EFFECT_COLUMNS:
            if getattr(records[row["id"]], column) != row[column]:
                setattr(records[row["id"]], column, row[column])
    for effect_id in deletes:
        db.session.delete(records[effect_id])
