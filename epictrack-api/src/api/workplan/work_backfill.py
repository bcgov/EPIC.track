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
"""Fills each work's template lineage and settings from its own legacy rows and version 1.

The migration that adds the columns runs it for every work. The current engine runs it for a work after
creating rows, so the columns stay current until the new engine takes over. Running it again changes nothing.

Prod runs the whole feature branch in one upgrade, so this reads and writes only columns that exist at
migration 5f07df4f6621. A later column gets a backfill of its own.
"""
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, NamedTuple, Optional, Tuple

import sqlalchemy as sa

from api.models import Event, EventConfiguration, OutcomeConfiguration, Work, WorkPhase, db
from api.workplan.core import template as tpl
from api.workplan.legacy import EMPTY_START_AT, ROLES_BY_EVENT_TYPE, UNPARSED_START_AT, anchor_from_start_at
from api.workplan.rules import get_rule_set

RETIRED_TEMPLATE_ROW = "retired_template_row"
MISSING_PARENT = "missing_parent"
UNMATCHED_OUTCOME = "unmatched_outcome"
ISSUES = (EMPTY_START_AT, UNPARSED_START_AT, RETIRED_TEMPLATE_ROW, MISSING_PARENT, UNMATCHED_OUTCOME)

_MODELS = {
    "works": Work, "work_phases": WorkPhase, "event_configurations": EventConfiguration, "events": Event,
    "outcome_configurations": OutcomeConfiguration,
}

# {table: {row id: {column: value}}}
Updates = Dict[str, Dict[int, Dict[str, Any]]]


class Issue(NamedTuple):
    """A row the backfill had to assume something for, or couldn't link to version 1."""

    work_id: int
    table_name: str
    row_id: int
    issue: str
    detail: str


@dataclass
class WorkRows:  # pylint: disable=too-many-instance-attributes
    """One work's own rows, as the backfill reads them."""

    id: int
    work_type_id: int
    ea_act_id: int
    rule_set: str
    all_phases_require_overage_responsibility: bool
    phases: List[dict] = field(default_factory=list)
    configurations: List[dict] = field(default_factory=list)
    outcomes: List[dict] = field(default_factory=list)
    events_with_actual_date: List[int] = field(default_factory=list)


@dataclass
class VersionOne:
    """Ids of version 1's rows, keyed the way a work's legacy rows find them."""

    id: int
    # template_phases.id by phase code
    phases: Dict[int, int] = field(default_factory=dict)
    # template_events rows by legacy_event_template_id
    events: Dict[int, dict] = field(default_factory=dict)
    # template_outcomes.id by (template event id, outcome name)
    outcomes: Dict[Tuple[int, str], List[int]] = field(default_factory=lambda: defaultdict(list))


class _Kind(NamedTuple):
    time_limit_kind: str


def load_work_rows(
    connection, work_ids: Optional[Iterable[int]] = None
) -> Tuple[List[WorkRows], Dict[Tuple[int, int], VersionOne]]:
    """Return every non-deleted work, or just these, and version 1 of their templates by work type and Act."""
    params = {} if work_ids is None else {"ids": list(work_ids)}
    only = "" if work_ids is None else " AND w.id = ANY(:ids)"

    def rows(sql, **extra):
        return [dict(row) for row in connection.execute(sa.text(sql), {**params, **extra}).mappings()]

    works = {
        row["id"]: WorkRows(**row) for row in rows(
            "SELECT w.id, w.work_type_id, w.ea_act_id, wt.rule_set, wt.all_phases_require_overage_responsibility"
            " FROM works w JOIN work_types wt ON wt.id = w.work_type_id WHERE NOT w.is_deleted" + only
        )
    }
    in_works = " JOIN works w ON w.id = wp.work_id WHERE NOT w.is_deleted" + only
    for row in rows(
        "SELECT wp.id, wp.work_id, wp.phase_id, wp.legislated, wp.visibility, wp.sort_order, wp.is_active,"
        " wp.is_deleted, pc.is_intake FROM work_phases wp JOIN phase_codes pc ON pc.id = wp.phase_id" + in_works
    ):
        works[row["work_id"]].phases.append(row)
    for row in rows(
        "SELECT ec.id, wp.work_id, ec.template_id, ec.parent_id, ec.start_at, ec.event_type_id"
        " FROM event_configurations ec JOIN work_phases wp ON wp.id = ec.work_phase_id" + in_works
    ):
        works[row["work_id"]].configurations.append(row)
    for row in rows(
        "SELECT oc.id, wp.work_id, oc.event_configuration_id, oc.name FROM outcome_configurations oc"
        " JOIN event_configurations ec ON ec.id = oc.event_configuration_id"
        " JOIN work_phases wp ON wp.id = ec.work_phase_id" + in_works
    ):
        works[row["work_id"]].outcomes.append(row)
    for row in rows(
        "SELECT e.id, e.work_id FROM events e JOIN works w ON w.id = e.work_id"
        " WHERE NOT w.is_deleted AND e.actual_date IS NOT NULL AND e.effects_applied_at IS NULL" + only
    ):
        works[row["work_id"]].events_with_actual_date.append(row["id"])
    return list(works.values()), _load_version_one(connection, {(w.work_type_id, w.ea_act_id) for w in works.values()})


def _load_version_one(connection, keys) -> Dict[Tuple[int, int], VersionOne]:
    def rows(sql, **params):
        return [dict(row) for row in connection.execute(sa.text(sql), params).mappings()]

    versions = {
        (row["work_type_id"], row["ea_act_id"]): VersionOne(id=row["id"]) for row in rows(
            "SELECT wt.work_type_id, wt.ea_act_id, v.id FROM work_templates wt"
            " JOIN work_template_versions v ON v.work_template_id = wt.id WHERE v.version = 1"
        ) if (row["work_type_id"], row["ea_act_id"]) in keys
    }
    by_id = {version.id: version for version in versions.values()}
    ids = list(by_id)
    for row in rows("SELECT id, template_version_id, phase_code_id FROM template_phases"
                    " WHERE template_version_id = ANY(:ids)", ids=ids):
        by_id[row["template_version_id"]].phases[row["phase_code_id"]] = row["id"]
    for row in rows("SELECT id, template_version_id, legacy_event_template_id, repeatable, sets_work_start,"
                    " sets_official_start FROM template_events WHERE template_version_id = ANY(:ids)", ids=ids):
        by_id[row["template_version_id"]].events[row["legacy_event_template_id"]] = row
    for row in rows("SELECT o.id, o.template_event_id, o.name, e.template_version_id FROM template_outcomes o"
                    " JOIN template_events e ON e.id = o.template_event_id"
                    " WHERE e.template_version_id = ANY(:ids)", ids=ids):
        by_id[row["template_version_id"]].outcomes[(row["template_event_id"], row["name"])].append(row["id"])
    return versions


def plan_settings(work: WorkRows, version: Optional[VersionOne], now: datetime) -> Tuple[Updates, List[Issue]]:
    """Return the values for one work's rows, and the rows the backfill had to assume something for."""
    updates: Updates = defaultdict(dict)
    issues: List[Issue] = []
    updates["works"][work.id] = {"template_version_id": version.id if version else None}
    _plan_phases(work, version, updates, issues)
    lineage = _plan_configurations(work, version, updates, issues)
    _plan_outcomes(work, version, lineage, updates, issues)
    for event_id in work.events_with_actual_date:
        # The current engine ran the outcome's actions when the actual date was entered.
        updates["events"][event_id] = {"effects_applied_at": now}
    return dict(updates), issues


def _plan_phases(work: WorkRows, version: Optional[VersionOne], updates: Updates, issues: List[Issue]):
    rule_set = get_rule_set(work.rule_set)
    previous = None
    for row in sorted(work.phases, key=lambda r: (r["sort_order"], r["id"])):
        phase = _Kind(tpl.LEGISLATED if row["legislated"] else tpl.FREE)
        template_phase_id = version.phases.get(row["phase_id"]) if version else None
        if version and template_phase_id is None:
            issues.append(Issue(work.id, "work_phases", row["id"], RETIRED_TEMPLATE_ROW,
                                f"phase code {row['phase_id']} isn't in version 1"))
        updates["work_phases"][row["id"]] = {
            "template_phase_id": template_phase_id,
            "time_limit_kind": phase.time_limit_kind,
            "day_basis": rule_set.default_day_basis(phase, previous),
            "is_intake": bool(row["is_intake"]),
            "requires_overage_responsibility": bool(
                row["legislated"] or work.all_phases_require_overage_responsibility),
        }
        # Skipped and hidden phases aren't in the sequence, so they don't set the next phase's basis.
        if row["is_active"] and not row["is_deleted"] and row["visibility"] == tpl.REGULAR:
            previous = phase


def _plan_configurations(work: WorkRows, version: Optional[VersionOne], updates: Updates, issues: List[Issue]):
    in_work = {row["id"] for row in work.configurations}
    lineage = {}
    for row in work.configurations:
        def issue(code, detail, row=row):
            issues.append(Issue(work.id, "event_configurations", row["id"], code, detail))

        anchor = row["parent_id"] if row["parent_id"] in in_work else None
        if row["parent_id"] is not None and anchor is None:
            issue(MISSING_PARENT, f"parent {row['parent_id']} isn't in the work, so it counts from the phase start")
        anchor_point, offset_days, problem = anchor_from_start_at(row["start_at"], anchor is not None)
        if problem:
            issue(problem, f"start_at {row['start_at']!r} is counted as 0 days")
        template_event = version.events.get(row["template_id"]) if version else None
        if version and template_event is None:
            issue(RETIRED_TEMPLATE_ROW, f"event template {row['template_id']} isn't in version 1")
        lineage[row["id"]] = template_event["id"] if template_event else None
        updates["event_configurations"][row["id"]] = {
            "template_event_id": lineage[row["id"]],
            "role": ROLES_BY_EVENT_TYPE.get(row["event_type_id"]),
            "anchor_configuration_id": anchor,
            "anchor_point": anchor_point,
            "offset_days": offset_days,
            "repeatable": bool(template_event and template_event["repeatable"]),
            "sets_work_start": bool(template_event and template_event["sets_work_start"]),
            "sets_official_start": bool(template_event and template_event["sets_official_start"]),
        }
    return lineage


def _plan_outcomes(work, version, lineage, updates: Updates, issues: List[Issue]):
    for row in work.outcomes:
        template_event_id = lineage.get(row["event_configuration_id"])
        matches = version.outcomes.get((template_event_id, row["name"]), []) if template_event_id else []
        if template_event_id and len(matches) != 1:
            issues.append(Issue(
                work.id, "outcome_configurations", row["id"], UNMATCHED_OUTCOME,
                f"{len(matches)} version 1 outcomes are named {row['name']!r}"))
        updates["outcome_configurations"][row["id"]] = {"template_outcome_id": matches[0] if len(matches) == 1 else None}


def backfill_settings(connection, work_ids: Optional[Iterable[int]] = None) -> List[Issue]:
    """Write every work's settings, or just these works', with plain UPDATEs. No history rows are written."""
    works, versions = load_work_rows(connection, work_ids)
    now = datetime.now(timezone.utc)
    merged: Updates = defaultdict(dict)
    all_issues = []
    for work in works:
        updates, issues = plan_settings(work, versions.get((work.work_type_id, work.ea_act_id)), now)
        for table, values in updates.items():
            merged[table].update(values)
        all_issues += issues
    for table, rows in merged.items():
        columns = sorted(next(iter(rows.values())))
        connection.execute(
            sa.text(f"UPDATE {table} SET {', '.join(f'{c} = :{c}' for c in columns)} WHERE id = :id"),
            [{"id": row_id, **values} for row_id, values in rows.items()],
        )
    _replace_issues(connection, [work.id for work in works], all_issues)
    return all_issues


def backfill_work_settings(work_id: int) -> None:
    """Bring one work's settings up to date through the session, so history records what changes."""
    db.session.flush()
    works, versions = load_work_rows(db.session.connection(), [work_id])
    if not works:
        return
    [work] = works
    updates, issues = plan_settings(work, versions.get((work.work_type_id, work.ea_act_id)), datetime.now(timezone.utc))
    for table, rows in updates.items():
        model = _MODELS[table]
        for record in db.session.query(model).filter(model.id.in_(list(rows))):
            for column, value in rows[record.id].items():
                value = _python_value(model, column, value)
                if getattr(record, column) != value:
                    setattr(record, column, value)
    _replace_issues(db.session.connection(), [work_id], issues)


def _python_value(model, column: str, value):
    enum_class = getattr(model.__table__.c[column].type, "enum_class", None)
    return enum_class(value) if enum_class is not None and value is not None else value


def _replace_issues(connection, work_ids: List[int], issues: List[Issue]):
    if not work_ids:
        return
    connection.execute(
        sa.text("DELETE FROM migration_issues WHERE work_id = ANY(:ids) AND issue = ANY(:codes)"),
        {"ids": work_ids, "codes": list(ISSUES)},
    )
    if issues:
        connection.execute(
            sa.text("INSERT INTO migration_issues (work_id, table_name, row_id, issue, detail)"
                    " VALUES (:work_id, :table_name, :row_id, :issue, :detail)"),
            [issue._asdict() for issue in issues],
        )
