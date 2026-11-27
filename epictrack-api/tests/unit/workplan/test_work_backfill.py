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
"""Tests for filling each work's template lineage and settings."""
from datetime import datetime, timezone
from http import HTTPStatus

import pytest
import sqlalchemy as sa

from api.models import (
    ActionConfiguration, Event, EventConfiguration, MigrationIssue, OutcomeConfiguration, TemplateEvent,
    TemplateOutcome, TemplatePhase, Work, WorkPhase, WorkTemplate, WorkTemplateVersion)
from api.models.action import ActionEnum
from api.services.event import EventService
from api.workplan import work_backfill, work_effects
from api.workplan.work_backfill import VersionOne, WorkRows, backfill_work, plan_settings
from tests.utilities.helpers import prepare_work_payload

NOW = datetime(2026, 11, 26, tzinfo=timezone.utc)
SETTINGS = {
    "works": ("template_version_id",),
    "work_phases": ("template_phase_id", "time_limit_kind", "day_basis", "is_intake",
                    "requires_overage_responsibility"),
    "event_configurations": ("template_event_id", "role", "anchor_configuration_id", "anchor_point", "offset_days",
                             "repeatable", "sets_work_start", "sets_official_start"),
    "outcome_configurations": ("template_outcome_id",),
}


def _create_work(client, auth_header, session, work_type_id, title):
    payload = {**prepare_work_payload(), "work_type_id": work_type_id, "simple_title": title}
    response = client.post("/api/v1/works", json=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED, response.json
    return session.get(Work, response.json["id"])


def _phases(work):
    return WorkPhase.query.filter_by(work_id=work.id).order_by(WorkPhase.sort_order).all()


def _configurations(work):
    return EventConfiguration.query.join(WorkPhase).filter(WorkPhase.work_id == work.id).all()


def _outcomes(work):
    return OutcomeConfiguration.query.join(EventConfiguration).join(WorkPhase).filter(
        WorkPhase.work_id == work.id).all()


def _issues(work):
    return MigrationIssue.query.filter_by(work_id=work.id).all()


def test_a_new_work_takes_its_settings_from_version_one(client, auth_header, session):
    """Each phase, milestone and outcome of a work created from each template traces to version 1 and matches it."""
    for index, template in enumerate(WorkTemplate.query.order_by(WorkTemplate.work_type_id)):
        work = _create_work(client, auth_header, session, template.work_type_id, f"Backfill {index}")
        [version] = template.versions

        assert work.template_version_id == version.id
        for phase in _phases(work):
            template_phase = session.get(TemplatePhase, phase.template_phase_id)
            assert (template_phase.phase_code_id, phase.time_limit_kind, phase.day_basis, phase.is_intake,
                    phase.requires_overage_responsibility) == (
                phase.phase_id, template_phase.time_limit_kind, template_phase.day_basis, template_phase.is_intake,
                template_phase.requires_overage_responsibility), template.name
        configurations = {configuration.id: configuration for configuration in _configurations(work)}
        for configuration in configurations.values():
            event = session.get(TemplateEvent, configuration.template_event_id)
            anchor = configurations.get(configuration.anchor_configuration_id)
            assert (event.legacy_event_template_id, event.role, event.anchor_point, event.offset_days,
                    event.repeatable, event.sets_work_start) == (
                configuration.template_id, configuration.role, configuration.anchor_point, configuration.offset_days,
                configuration.repeatable, configuration.sets_work_start), template.name
            assert (anchor.template_event_id if anchor else None) == event.anchor_template_event_id, template.name
        for outcome in _outcomes(work):
            template_outcome = session.get(TemplateOutcome, outcome.template_outcome_id)
            assert (template_outcome.name, template_outcome.template_event_id) == (
                outcome.name, outcome.event_configuration.template_event_id), template.name
        # A new work only carries the assumptions and drops its template makes, never a lineage issue.
        assert {issue.issue for issue in _issues(work)} <= {
            work_backfill.EMPTY_START_AT, work_backfill.UNPARSED_START_AT, work_effects.DROPPED_ACTION}, template.name


def test_running_it_again_changes_nothing(client, auth_header, session):
    """A second run writes no history rows and keeps the same issues."""
    work = _create_work(client, auth_header, session, 1, "Again")
    session.add(MigrationIssue(work_id=work.id, table_name="event_configurations", row_id=1,
                               issue=work_backfill.EMPTY_START_AT))
    session.flush()
    backfill_work(work.id)
    session.flush()
    before = (_history_rows(session, work), [(i.table_name, i.row_id, i.issue) for i in _issues(work)])

    backfill_work(work.id)
    session.flush()

    assert (_history_rows(session, work), [(i.table_name, i.row_id, i.issue) for i in _issues(work)]) == before
    assert [issue for issue in before[1] if issue[2] in work_backfill.ISSUES] == []


def _history_rows(session, work):
    return session.execute(sa.text(
        "SELECT (SELECT count(*) FROM works_history WHERE id = :id),"
        " (SELECT count(*) FROM work_phases_history WHERE work_id = :id),"
        " (SELECT count(*) FROM event_configurations_history h JOIN work_phases wp ON wp.id = h.work_phase_id"
        "  WHERE wp.work_id = :id)"), {"id": work.id}).one()


def test_the_migration_writes_what_the_hooks_write(client, auth_header, session):
    """The plain UPDATEs the migration runs give the same values as the session writes after creating a work."""
    work = _create_work(client, auth_header, session, 6, "Migration")
    session.flush()
    expected = _settings(session, work)
    for table, columns in SETTINGS.items():
        defaults = {"anchor_point": "'START'", "offset_days": "0", "time_limit_kind": "'FREE'", "day_basis": "'ONE'"}
        assignments = ", ".join(
            f"{c} = {defaults.get(c, 'false' if c.startswith(('is_', 'requires', 'repeat', 'sets_')) else 'NULL')}"
            for c in columns)
        session.execute(sa.text(f"UPDATE {table} SET {assignments} WHERE id = ANY(:ids)"),
                        {"ids": list(expected[table])})

    work_backfill.backfill_settings(session.connection(), [work.id])
    session.expire_all()

    assert _settings(session, work) == expected


def _settings(session, work):
    ids = {
        "works": [work.id], "work_phases": [p.id for p in _phases(work)],
        "event_configurations": [c.id for c in _configurations(work)],
        "outcome_configurations": [o.id for o in _outcomes(work)],
    }
    return {
        table: {
            row["id"]: dict(row) for row in session.execute(
                sa.text(f"SELECT id, {', '.join(SETTINGS[table])} FROM {table} WHERE id = ANY(:ids)"),
                {"ids": ids[table]}).mappings()
        }
        for table in SETTINGS
    }


def test_an_outcome_that_adds_a_phase_leaves_its_rows_backfilled(client, auth_header, session):
    """The hook after an outcome's actions fills the rows AddPhase created and marks the effects applied."""
    work_type_id = session.execute(sa.text(
        "SELECT pc.work_type_id FROM action_templates at JOIN actions a ON a.id = at.action_id"
        " JOIN outcome_templates ot ON ot.id = at.outcome_id JOIN event_templates et ON et.id = ot.event_template_id"
        " JOIN phase_codes pc ON pc.id = et.phase_id"
        " WHERE a.name = 'AddPhase' AND at.is_active AND et.visibility = 'MANDATORY' ORDER BY at.id LIMIT 1"
    )).scalar_one()
    work = _create_work(client, auth_header, session, work_type_id, "Adds a phase")
    phases_before = {phase.id for phase in _phases(work)}
    outcome, event = session.query(OutcomeConfiguration, Event).join(
        ActionConfiguration, ActionConfiguration.outcome_configuration_id == OutcomeConfiguration.id).join(
        Event, Event.event_configuration_id == OutcomeConfiguration.event_configuration_id).filter(
        Event.work_id == work.id, ActionConfiguration.action_id == ActionEnum.ADD_PHASE.value).first()
    event.actual_date = event.anticipated_date

    EventService._process_actions(event, outcome.id)  # pylint: disable=protected-access
    session.flush()

    added = [phase for phase in _phases(work) if phase.id not in phases_before]
    assert added
    for phase in added:
        assert phase.template_phase_id is not None
        configurations = EventConfiguration.query.filter_by(work_phase_id=phase.id).all()
        assert configurations and all(c.template_event_id is not None for c in configurations)
    assert event.effects_applied_at is not None


def _work(phases=(), configurations=(), outcomes=(), all_phases_require=False):
    return WorkRows(
        id=1, work_type_id=1, ea_act_id=3, rule_set="EAO", all_phases_require_overage_responsibility=all_phases_require,
        phases=[
            {"id": index, "phase_id": index, "sort_order": index, "is_intake": False, "is_active": True,
             "is_deleted": False, "visibility": "REGULAR", **phase}
            for index, phase in enumerate(phases, start=1)
        ],
        configurations=[
            {"id": row_id, "template_id": row_id, "parent_id": parent_id, "start_at": start_at, "event_type_id": 1}
            for row_id, parent_id, start_at in configurations
        ],
        outcomes=list(outcomes),
    )


def test_start_at_becomes_an_anchor_and_an_offset():
    """Whole numbers count from the anchor's start, number_of_days-N from the parent's end; the rest is an issue."""
    work = _work(configurations=[
        (1, None, "5"), (2, 1, "3"), (3, 1, "number_of_days-2"), (4, None, ""), (5, 1, "later"), (6, 99, "4"),
    ])

    updates, issues = plan_settings(work, None, NOW)

    rows = updates["event_configurations"]
    assert [(rows[i]["anchor_configuration_id"], rows[i]["anchor_point"], rows[i]["offset_days"]) for i in rows] == [
        (None, "START", 5), (1, "START", 3), (1, "END", -2), (None, "START", 0), (1, "START", 0), (None, "START", 4),
    ]
    assert [(issue.row_id, issue.issue) for issue in issues] == [
        (4, work_backfill.EMPTY_START_AT), (5, work_backfill.UNPARSED_START_AT), (6, work_backfill.MISSING_PARENT),
    ]


@pytest.mark.parametrize("phases, expected", [
    ([{"legislated": False}, {"legislated": True}], ["ONE", "ZERO"]),
    # An interregnum between two legislated phases makes the second one Day Zero.
    ([{"legislated": True}, {"legislated": False}, {"legislated": True}], ["ONE", "ONE", "ZERO"]),
    # A skipped or hidden phase isn't in the sequence.
    ([{"legislated": True}, {"legislated": False, "is_active": False}, {"legislated": True}], ["ONE", "ONE", "ONE"]),
    ([{"legislated": True}, {"legislated": False, "visibility": "HIDDEN"}, {"legislated": True}],
     ["ONE", "ONE", "ONE"]),
])
def test_day_basis_follows_the_work_s_own_phases(phases, expected):
    """The rule set's day basis is worked out over the phases the work has, including ones an outcome added."""
    updates, _ = plan_settings(_work(phases), None, NOW)

    assert [row["day_basis"] for row in updates["work_phases"].values()] == expected


@pytest.mark.parametrize(
    "legislated, all_phases_require, expected",
    [(True, False, True), (False, True, True), (True, True, True), (False, False, False)],
)
def test_phase_requires_overage_responsibility(legislated, all_phases_require, expected):
    """A legislated phase, or any phase of a work type that says so, needs a responsibility."""
    updates, _ = plan_settings(_work([{"legislated": legislated}], all_phases_require=all_phases_require), None, NOW)

    assert updates["work_phases"][1]["requires_overage_responsibility"] is expected


def test_rows_version_one_lacks_are_issues():
    """A phase or configuration on a retired template row, and an outcome with no match, keep no lineage."""
    version = VersionOne(id=7, phases={1: 70})
    version.events[1] = {"id": 10, "repeatable": True, "sets_work_start": False, "sets_official_start": False}
    work = _work([{"legislated": False}, {"legislated": False}], configurations=[(1, None, "0"), (2, None, "0")], outcomes=[
        {"id": 5, "event_configuration_id": 1, "name": "Approved"},
        {"id": 6, "event_configuration_id": 2, "name": "Approved"},
    ])

    updates, issues = plan_settings(work, version, NOW)

    assert updates["works"][1] == {"template_version_id": 7}
    assert [updates["work_phases"][i]["template_phase_id"] for i in (1, 2)] == [70, None]
    assert [(updates["event_configurations"][i]["template_event_id"], updates["event_configurations"][i]["repeatable"])
            for i in (1, 2)] == [(10, True), (None, False)]
    assert updates["outcome_configurations"] == {5: {"template_outcome_id": None}, 6: {"template_outcome_id": None}}
    assert [(issue.table_name, issue.row_id, issue.issue) for issue in issues] == [
        ("work_phases", 2, work_backfill.RETIRED_TEMPLATE_ROW),
        ("event_configurations", 2, work_backfill.RETIRED_TEMPLATE_ROW),
        ("outcome_configurations", 5, work_backfill.UNMATCHED_OUTCOME),
    ]


def test_events_with_an_actual_date_have_had_their_effects_applied():
    """The current engine ran the outcome's actions when the actual date was entered."""
    work = _work()
    work.events_with_actual_date = [3, 4]

    updates, _ = plan_settings(work, None, NOW)

    assert updates["events"] == {3: {"effects_applied_at": NOW}, 4: {"effects_applied_at": NOW}}


def test_every_work_type_has_a_version_one():
    """Every work type the test templates load has the version 1 that works trace to."""
    assert WorkTemplateVersion.query.filter_by(version=1).count() == WorkTemplate.query.count() > 0
