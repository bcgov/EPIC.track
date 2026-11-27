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
"""Tests for converting each work's own actions into outcome effects."""
from http import HTTPStatus

import pytest
import sqlalchemy as sa

from api.models import (
    ActionConfiguration, Event, EventConfiguration, MigrationIssue, OutcomeConfiguration, OutcomeEffect,
    TemplateEvent, TemplateOutcome, Work, WorkPhase, WorkTemplate)
from api.models.action import ActionEnum
from api.services.event import EventService
from api.workplan import work_effects
from api.workplan.work_backfill import backfill_work
from api.workplan.work_effects import Lookups, WorkActions, changes, plan_effects
from tests.utilities.helpers import prepare_work_payload

THIS_TYPE = {"work_type_id": 1, "ea_act_id": 3}
LOOKUPS = Lookups(
    phase_codes={(1, 3): {"Early": [101], "Review": [102], "Decision": [103]}},
    template_phases={(1, 3): {101: 201, 102: 202, 103: 203}},
    template_events={202: [{
        "id": 302, "template_phase_id": 202, "name": "Report", "event_type_id": 1, "event_category_id": 1,
        "event_position": "INTERMEDIATE", "visibility": "MANDATORY", "parent_id": None, "start_at": "5",
    }]},
    project_states={"PRECONSTRUCTION": 7},
)


def _phase(row_id, name, sort_order=None, **columns):
    return {
        "id": row_id, "work_id": 1, "name": name, "sort_order": sort_order or row_id, "visibility": "REGULAR",
        "is_active": True, "code_name": name, "code_work_type_id": 1, "code_ea_act_id": 3, "code_is_active": True,
        **columns,
    }


def _milestone(row_id, work_phase_id, name, **columns):
    return {
        "id": row_id, "work_id": 1, "work_phase_id": work_phase_id, "parent_id": None, "name": name,
        "event_type_id": 1, "event_category_id": 1, "event_position": "INTERMEDIATE", "visibility": "MANDATORY",
        "start_at": "0", "repeat_count": 0, "is_active": True, "version_one_repeatable": False, **columns,
    }


PHASES = [_phase(1, "Early"), _phase(2, "Review"), _phase(3, "Decision")]
MILESTONES = [
    _milestone(11, 1, "Submission"), _milestone(12, 1, "Notice"), _milestone(21, 2, "Start of Review"),
    _milestone(22, 2, "Report"), _milestone(31, 3, "Decision", event_position="END"),
]


def _work(actions, phases=None, milestones=None, source=11):
    """A work whose milestone `source` has one outcome with these (action, params) in order."""
    return WorkActions(
        id=1, work_type_id=1, ea_act_id=3, rule_set="EAO", phases=phases or PHASES,
        configurations=milestones or MILESTONES, outcomes=[{"id": 50, "work_id": 1, "event_configuration_id": source}],
        actions=[
            {"id": 60 + order, "work_id": 1, "outcome_configuration_id": 50, "action": action,
             "additional_params": params, "sort_order": order}
            for order, (action, params) in enumerate(actions, start=1)
        ],
    )


def _effects(planned):
    return [
        (row["kind"], row["target_work_phase_id"], row["target_event_configuration_id"],
         row["target_template_phase_id"], row["target_template_event_id"], row["params"])
        for row in planned.effects[50]
    ]


def _issues(planned):
    return [(issue.row_id, issue.issue) for issue in planned.issues]


@pytest.mark.parametrize("action, params, expected", [
    ("SetWorkState", {"work_state": "COMPLETED"}, [("SET_WORK_STATE", None, None, None, None,
                                                    {"work_state": "COMPLETED"})]),
    ("SetProjectStatus", {"is_active": False}, [("SET_PROJECT_STATUS", None, None, None, None, {"is_active": False})]),
    ("SetProjectState", {"project_state": "Pre-Construction"},
     [("SET_PROJECT_STATE", None, None, None, None, {"project_state_id": 7})]),
    ("SetWorkDecisionMaker", {"position_id": 4}, [("SET_DECISION_MAKER", None, None, None, None, {"position_id": 4})]),
    ("SetFederalInvolvement", {"federal_involvement_id": 2},
     [("SET_FEDERAL_INVOLVEMENT", None, None, None, None, {"federal_involvement_id": 2})]),
    ("CreateWork", {"work_type": 5}, [("CREATE_LINKED_WORK", None, None, None, None, {"work_type_id": 5})]),
    ("SetEventDate", {**THIS_TYPE, "phase_name": "Early", "event_name": "Notice", "start_at": 3},
     [("ANCHOR_EVENT", None, 12, None, None, {"offset_days": 3})]),
    ("AddEvent", [{**THIS_TYPE, "phase_name": "Early", "event_name": "Notice", "start_at": "2"}],
     [("ADD_OCCURRENCE", None, 12, None, None, {"offset_days": 2, "visibility": "MANDATORY"})]),
    ("AddPhase", [{**THIS_TYPE, "phase_name": "Review", "new_name": "Second Review", "legislated": True}],
     [("ADD_PHASES", None, None, 202, None, {"name": "Second Review", "time_limit_kind": "LEGISLATED"})]),
    ("ChangePhaseEndEvent", {**THIS_TYPE, "this_event": True, "phase_name": "Early", "event_name": "Submission"},
     [("END_PHASE_HERE", None, None, None, None, {})]),
    ("SetEventsStatus", [{**THIS_TYPE, "phase_name": "Review", "event_name": "Report", "is_active": False}],
     [("SKIP_EVENTS", None, 22, None, None, {})]),
    ("SetEventsStatus", {"all_future_events": False}, [("END_PHASE_HERE", None, None, None, None, {})]),
    ("SetPhasesStatus", [{**THIS_TYPE, "phase_name": "Review", "is_active": False}],
     [("SKIP_PHASES", 2, None, None, None, {})]),
    ("SetPhasesStatus", {"all_future_phases": False},
     [("END_PHASE_HERE", None, None, None, None, {}), ("SKIP_PHASES", None, None, None, None, {"all_later": True})]),
])
def test_each_action_becomes_its_effects(action, params, expected):
    """Every kept action converts the way version 1's do, with targets in the work."""
    planned = plan_effects(_work([(action, params)]), LOOKUPS)

    assert (_effects(planned), planned.issues) == (expected, [])


@pytest.mark.parametrize("action, params", [
    ("SetEventName", {**THIS_TYPE, "phase_name": "Early", "event_name": "Notice", "new_name": "Renamed"}),
    # Phase sequencing dates a START, so a gap other than a day is lost.
    ("SetEventDate", {**THIS_TYPE, "phase_name": "Review", "event_name": "Start of Review", "start_at": 29}),
])
def test_a_dropped_action_is_an_issue(action, params):
    """An action version 1 drops leaves no effect, and the work keeps a note of it."""
    milestones = [*MILESTONES[:2], _milestone(21, 2, "Start of Review", event_position="START"), *MILESTONES[3:]]

    planned = plan_effects(_work([(action, params)], milestones=milestones), LOOKUPS)

    assert (_effects(planned), _issues(planned)) == ([], [(61, work_effects.DROPPED_ACTION)])


def test_add_event_and_lock_work_start_date_set_the_milestone_flags():
    """A milestone an AddEvent copies is repeatable, as is a copy of version 1's, and a work start lock sets it."""
    milestones = [*MILESTONES[:4], _milestone(31, 3, "Decision", version_one_repeatable=True)]

    planned = plan_effects(_work([
        ("AddEvent", [{**THIS_TYPE, "phase_name": "Early", "event_name": "Notice"}]),
        ("LockWorkStartDate", {"start_date_locked": True}),
    ], milestones=milestones), LOOKUPS)

    assert {key: flags for key, flags in planned.flags.items() if any(flags.values())} == {
        11: {"repeatable": False, "sets_work_start": True}, 12: {"repeatable": True, "sets_work_start": False},
        31: {"repeatable": True, "sets_work_start": False},
    }


def test_the_latest_phase_and_occurrence_win():
    """A phase that AddPhase repeated, and a milestone that AddEvent repeated, are found by their latest copy."""
    phases = [*PHASES, _phase(4, "Review", sort_order=5)]
    milestones = [*MILESTONES, _milestone(41, 4, "Report"), _milestone(42, 4, "Report", repeat_count=1)]

    planned = plan_effects(_work(
        [("SetEventsStatus", [{**THIS_TYPE, "phase_name": "Review", "event_name": "Report", "is_active": False}])],
        phases=phases, milestones=milestones), LOOKUPS)

    assert [effect[2] for effect in _effects(planned)] == [42]


def test_only_add_event_finds_a_hidden_phase_or_an_inactive_milestone():
    """The current engine finds active REGULAR phases and active milestones, except for AddEvent."""
    phases = [PHASES[0], _phase(2, "Review", visibility="HIDDEN"), PHASES[2]]
    milestones = [*MILESTONES[:3], _milestone(22, 2, "Report", is_active=False), MILESTONES[4]]
    item = {**THIS_TYPE, "phase_name": "Review", "event_name": "Report"}

    planned = plan_effects(_work(
        [("SetEventsStatus", [{**item, "is_active": False}]), ("AddEvent", [{**item, "start_at": 1}])],
        phases=phases, milestones=milestones), LOOKUPS)

    assert [effect[:3] for effect in _effects(planned)] == [("ADD_OCCURRENCE", None, 22)]
    assert _issues(planned) == [(61, work_effects.UNRESOLVED_ACTION)]


def test_set_phases_status_finds_a_phase_by_its_phase_code_s_name():
    """A SetPhasesStatus ignores an AddPhase rename, while the other actions use it."""
    phases = [PHASES[0], _phase(2, "Second Review", code_name="Review"), PHASES[2]]

    planned = plan_effects(_work([
        ("SetPhasesStatus", [{**THIS_TYPE, "phase_name": "Review", "is_active": False}]),
        ("SetEventsStatus", [{**THIS_TYPE, "phase_name": "Review", "event_name": "Report", "is_active": False}]),
    ], phases=phases), LOOKUPS)

    assert [effect[:2] for effect in _effects(planned)] == [("SKIP_PHASES", 2)]
    assert _issues(planned) == [(62, work_effects.UNRESOLVED_ACTION)]


@pytest.mark.parametrize("source, expected", [
    # The new copy goes in after the Review phase it's added from, so it's the latest.
    (22, ("SKIP_EVENTS", None, None, None, 302)),
    # Added from Early, the copy goes in before the existing Review, which stays the latest.
    (11, ("SKIP_EVENTS", None, 22, None, None)),
])
def test_a_target_in_a_phase_the_outcome_adds_is_version_one_s(source, expected):
    """An action after an AddPhase targets the copy when it's the latest, through the version 1 milestone it copies."""
    planned = plan_effects(_work([
        ("AddPhase", [{**THIS_TYPE, "phase_name": "Review", "new_name": "Review", "legislated": False}]),
        ("SetEventsStatus", [{**THIS_TYPE, "phase_name": "Review", "event_name": "Report", "is_active": False}]),
    ], source=source), LOOKUPS)

    assert (_effects(planned)[1][:5], planned.issues) == (expected, [])


def test_actions_for_another_template_or_a_missing_target_are_issues():
    """Nothing is guessed: a target the current engine wouldn't find leaves no effect."""
    planned = plan_effects(_work([
        ("SetEventsStatus", [{"work_type_id": 2, "ea_act_id": 3, "phase_name": "Review", "event_name": "Report",
                              "is_active": False}]),
        ("SetEventDate", {**THIS_TYPE, "phase_name": "Early", "event_name": "Missing", "start_at": 1}),
        ("AddPhase", [{**THIS_TYPE, "phase_name": "Retired", "new_name": "Retired"}]),
        ("Unknown", {}),
    ]), LOOKUPS)

    assert (_effects(planned), [issue.issue for issue in planned.issues]) == ([], [work_effects.UNRESOLVED_ACTION] * 4)


def test_only_differences_are_written():
    """Effects are matched by outcome and sort order, so a re-run updates, adds and removes only what changed."""
    work = _work([("SetWorkState", {"work_state": "COMPLETED"}), ("SetProjectStatus", {"is_active": False})])
    planned = plan_effects(work, LOOKUPS)
    [kept, changed] = planned.effects[50]
    work.effects = [
        {"id": 1, "outcome_configuration_id": 50, **kept},
        {"id": 2, "outcome_configuration_id": 50, **changed, "params": {"is_active": True}},
        {"id": 3, "outcome_configuration_id": 50, **kept, "sort_order": 3},
    ]
    planned.effects[51] = [kept]

    assert changes(work, planned) == ([{"outcome_configuration_id": 51, **kept}], [{"id": 2, **changed}], [3])


def _create_work(client, auth_header, session, work_type_id, title):
    payload = {**prepare_work_payload(), "work_type_id": work_type_id, "simple_title": title}
    response = client.post("/api/v1/works", json=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED, response.json
    return session.get(Work, response.json["id"])


def _outcomes(work):
    return OutcomeConfiguration.query.join(EventConfiguration).join(WorkPhase).filter(
        WorkPhase.work_id == work.id).order_by(OutcomeConfiguration.id).all()


def _work_effects(session, work):
    return [dict(row) for row in session.execute(sa.text(
        "SELECT oe.outcome_configuration_id, oe.sort_order, oe.kind, oe.target_work_phase_id,"
        " oe.target_event_configuration_id, oe.target_template_phase_id, oe.target_template_event_id, oe.params"
        " FROM outcome_effects oe JOIN outcome_configurations oc ON oc.id = oe.outcome_configuration_id"
        " JOIN event_configurations ec ON ec.id = oc.event_configuration_id"
        " JOIN work_phases wp ON wp.id = ec.work_phase_id WHERE wp.work_id = :id"
        " ORDER BY oe.outcome_configuration_id, oe.sort_order"), {"id": work.id}).mappings()]


def _as_version_one(session, effect):
    """The effect with each target given as the version 1 row it traces to."""
    phase = session.get(WorkPhase, effect.target_work_phase_id) if effect.target_work_phase_id else None
    milestone = (session.get(EventConfiguration, effect.target_event_configuration_id)
                 if effect.target_event_configuration_id else None)
    return (effect.kind, effect.target_template_phase_id or (phase and phase.template_phase_id),
            effect.target_template_event_id or (milestone and milestone.template_event_id), effect.params)


def test_a_new_work_s_effects_are_version_one_s(client, auth_header, session):
    """Each outcome of a work created from each template does what its version 1 outcome does."""
    for index, template in enumerate(WorkTemplate.query.order_by(WorkTemplate.work_type_id)):
        work = _create_work(client, auth_header, session, template.work_type_id, f"Effects {index}")
        session.flush()
        for outcome in _outcomes(work):
            expected = [
                (effect.kind, effect.target_template_phase_id, effect.target_template_event_id, effect.params)
                for effect in session.get(TemplateOutcome, outcome.template_outcome_id).effects
            ]
            effects = OutcomeEffect.query.filter_by(outcome_configuration_id=outcome.id).order_by(
                OutcomeEffect.sort_order).all()
            assert [_as_version_one(session, effect) for effect in effects] == expected, (template.name, outcome.name)
        issues = MigrationIssue.query.filter_by(work_id=work.id, issue=work_effects.UNRESOLVED_ACTION).all()
        assert not issues, (template.name, [issue.detail for issue in issues])


def _template_with(session, action_name, condition=""):
    return session.execute(sa.text(
        "SELECT pc.work_type_id FROM action_templates at JOIN actions a ON a.id = at.action_id"
        " JOIN outcome_templates ot ON ot.id = at.outcome_id JOIN event_templates et ON et.id = ot.event_template_id"
        " JOIN phase_codes pc ON pc.id = et.phase_id"
        f" WHERE a.name = :action AND at.is_active AND et.visibility = 'MANDATORY' {condition} ORDER BY at.id LIMIT 1"
    ), {"action": action_name}).scalar_one()


def test_an_added_occurrence_gets_effects_and_becomes_the_target(client, auth_header, session):
    """After AddEvent runs, the copy's outcomes have effects, and the AddEvent effect targets the copy."""
    unnamed = "AND jsonb_typeof(at.additional_params) = 'object' AND NOT at.additional_params ? 'new_name'"
    work = _create_work(client, auth_header, session, _template_with(session, "AddEvent", unnamed), "Adds one")
    before = {c.id for c in EventConfiguration.query.join(WorkPhase).filter(WorkPhase.work_id == work.id)}
    action, event = session.query(ActionConfiguration, Event).join(
        OutcomeConfiguration, OutcomeConfiguration.id == ActionConfiguration.outcome_configuration_id).join(
        Event, Event.event_configuration_id == OutcomeConfiguration.event_configuration_id).filter(
        Event.work_id == work.id, ActionConfiguration.action_id == ActionEnum.ADD_EVENT.value,
        sa.func.jsonb_typeof(ActionConfiguration.additional_params) == "object",
        ~ActionConfiguration.additional_params.has_key("new_name")).first()
    event.actual_date = event.anticipated_date

    EventService._process_actions(event, action.outcome_configuration_id)  # pylint: disable=protected-access
    session.flush()

    effects = OutcomeEffect.query.filter_by(outcome_configuration_id=action.outcome_configuration_id,
                                            kind="ADD_OCCURRENCE").all()
    # An occurrence AddEvent renames isn't found by the old name, so it isn't the target.
    copies = [
        session.get(EventConfiguration, e.target_event_configuration_id) for e in effects if "name" not in e.params]
    assert copies and all(c.id not in before and c.repeat_count >= 1 and c.repeatable for c in copies)
    for outcome in OutcomeConfiguration.query.filter(OutcomeConfiguration.event_configuration_id.in_(
            [c.id for c in copies])):
        actions = ActionConfiguration.query.filter_by(outcome_configuration_id=outcome.id, is_active=True).count()
        assert OutcomeEffect.query.filter_by(outcome_configuration_id=outcome.id).count() or not actions


@pytest.mark.usefixtures("history")
def test_running_it_again_writes_nothing(client, auth_header, session):
    """A second run leaves every effect row as it was and writes no history."""
    work = _create_work(client, auth_header, session, 6, "Effects again")
    backfill_work(work.id)
    session.flush()
    before = _snapshot(session, work)

    backfill_work(work.id)
    session.flush()

    assert _snapshot(session, work) == before
    assert before[1] and all(before[0][:2])


@pytest.mark.usefixtures("history")
def test_a_flag_the_work_s_own_actions_decide_isn_t_rewritten(client, auth_header, session):
    """Where version 1 and the work's own actions disagree on a flag, a second run still writes no history."""
    work = _create_work(client, auth_header, session, _template_with(session, "LockWorkStartDate"), "Own flags")
    locks = ActionConfiguration.query.join(OutcomeConfiguration).join(EventConfiguration).join(WorkPhase).filter(
        WorkPhase.work_id == work.id, ActionConfiguration.action_id == ActionEnum.LOCK_WORK_START_DATE.value).all()
    for lock in locks:
        lock.is_active = False
    backfill_work(work.id)
    session.flush()
    before = _snapshot(session, work)

    backfill_work(work.id)
    session.flush()

    assert _snapshot(session, work) == before
    milestones = {lock.outcome_configuration.event_configuration for lock in locks}
    assert milestones and before[0][1] and all(
        not m.sets_work_start and session.get(TemplateEvent, m.template_event_id).sets_work_start for m in milestones)


def _snapshot(session, work):
    """History row counts, every effect id, and the work's effects."""
    return session.execute(sa.text(
        "SELECT (SELECT count(*) FROM outcome_effects_history), (SELECT count(*) FROM event_configurations_history),"
        " (SELECT array_agg(id ORDER BY id) FROM outcome_effects)")).one(), _work_effects(session, work), _flags(
        session, work)


def test_the_migration_writes_what_the_hook_writes(client, auth_header, session):
    """The plain statements the migration runs give the same effects and flags as the hook's session writes."""
    work = _create_work(client, auth_header, session, 6, "Effects migration")
    session.flush()
    expected = (_work_effects(session, work), _flags(session, work))
    session.execute(sa.text("DELETE FROM outcome_effects WHERE id = ANY(:ids)"),
                    {"ids": [e.id for o in _outcomes(work) for e in OutcomeEffect.query.filter_by(
                        outcome_configuration_id=o.id)]})
    session.execute(sa.text("UPDATE event_configurations SET repeatable = NOT repeatable,"
                            " sets_work_start = NOT sets_work_start WHERE id = ANY(:ids)"),
                    {"ids": list(expected[1])})

    work_effects.backfill_effects(session.connection(), [work.id])
    session.expire_all()

    assert (_work_effects(session, work), _flags(session, work)) == expected


def _flags(session, work):
    return {
        row.id: (row.repeatable, row.sets_work_start)
        for row in EventConfiguration.query.join(WorkPhase).filter(WorkPhase.work_id == work.id)
    }


def test_delete_work_removes_its_effects(client, auth_header, session):
    """delete_work() deletes a work's outcome effects and their history before its outcomes."""
    work = _create_work(client, auth_header, session, 6, "Effects deleted")
    session.flush()
    assert _work_effects(session, work)
    outcome_ids = [outcome.id for outcome in _outcomes(work)]

    session.execute(sa.text("SELECT delete_work(:id)"), {"id": work.id})

    assert session.execute(sa.text(
        "SELECT (SELECT count(*) FROM outcome_effects WHERE outcome_configuration_id = ANY(:ids)),"
        " (SELECT count(*) FROM outcome_effects_history WHERE outcome_configuration_id = ANY(:ids)),"
        " (SELECT count(*) FROM works WHERE id = :id)"), {"ids": outcome_ids, "id": work.id}).one() == (0, 0, 0)
