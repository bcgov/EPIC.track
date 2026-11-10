"""Contract tests for the records Track pushes to DEMI."""
import json
import time
from pathlib import Path

import pytest

from api.models import (
    PRIMARY_CATEGORIES, Event, EventCategoryEnum, EventConfiguration, EventTemplate, OutcomeConfiguration, PhaseCode)
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.models.project import ProjectStateEnum
from api.services.demi_payload import resolve_record
from tests.utilities.factory_utils import factory_project_model, factory_work_model, factory_work_phase_model

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"
STAFF_TEXT = "STAFF-ONLY"
FIXTURE_STAMP = 1762675200000
NON_PRIMARY_CATEGORY = next(category for category in EventCategoryEnum if category not in PRIMARY_CATEGORIES)
MANDATORY = (EventPositionEnum.INTERMEDIATE, EventTemplateVisibilityEnum.MANDATORY)

PROJECT = {
    "name": "Payload Contract Mine",
    "description": "Open pit copper mine",
    "address": "Near Smithers, BC",
    "type_id": 1,
    "sub_type_id": 1,
    "proponent_id": 1,
    "region_id_env": 1,
    "region_id_flnro": 1,
    "latitude": "54.7804",
    "longitude": "-127.1743",
    "abbreviation": "PCMINE",
}


def _work(project, work_type_id, is_active=True, is_deleted=False):
    work = factory_work_model({
        "report_description": f"{STAFF_TEXT} report",
        "epic_description": f"{STAFF_TEXT} epic",
        "is_active": is_active,
        "start_date": "2024-01-15T08:00:00+00:00",
        "ministry_id": 1,
        "ea_act_id": 3,
        "eao_team_id": 1,
        "federal_involvement_id": 1,
        "work_type_id": work_type_id,
        "substitution_act_id": 1,
    })
    work.project_id = project.id
    work.is_deleted = is_deleted
    work.simple_title = "North Pit"
    work.status_notes = f"{STAFF_TEXT} status"
    work.issue_notes = f"{STAFF_TEXT} issue"
    work.first_nation_notes = f"{STAFF_TEXT} first nation"
    work.anticipated_decision_date = "2025-06-30T07:00:00+00:00"
    return work.save()


def _phase(work, phase_code, name, sort_order, visibility=PhaseVisibilityEnum.REGULAR):
    phase = factory_work_phase_model(
        {
            "phase_id": phase_code.id,
            "start_date": "2024-01-15T08:00:00+00:00",
            "end_date": "2024-04-15T07:00:00+00:00",
            "sort_order": sort_order,
        },
        work_id=work.id,
    )
    phase.name = name
    phase.visibility = visibility
    phase.number_of_days = 90
    phase.legislated = True
    phase.responsibility_notes = f"{STAFF_TEXT} responsibility"
    return phase.save()


def _flag(row, **values):
    for column, value in values.items():
        setattr(row, column, value)
    return row.save()


def _event(phase, name, sort_order, position, visibility, outcome=None, category=EventCategoryEnum.MILESTONE):
    configuration = EventConfiguration(
        name=f"{name} template",
        template_id=EventTemplate.query.first().id,
        event_type_id=1,
        event_position=position,
        event_category_id=category.value,
        number_of_days=0,
        sort_order=sort_order,
        work_phase_id=phase.id,
        visibility=visibility,
    ).save()
    outcome_id = None
    if outcome:
        outcome_id = OutcomeConfiguration(
            name=outcome, event_configuration_id=configuration.id, sort_order=1
        ).save().id
    return Event(
        name=name,
        work_id=phase.work_id,
        event_configuration_id=configuration.id,
        anticipated_date="2024-02-01T08:00:00+00:00",
        actual_date="2024-02-02T08:00:00+00:00",
        number_of_days=1,
        outcome_id=outcome_id,
        description=f"{STAFF_TEXT} description",
        notes=f"{STAFF_TEXT} notes",
        reason=f"{STAFF_TEXT} reason",
        topic=f"{STAFF_TEXT} topic",
    ).save()


@pytest.fixture
def seeded(session):
    """One project with a shown work, phase and events, plus rows each feed rule leaves out."""
    project = factory_project_model(PROJECT)
    project.project_state_id = ProjectStateEnum.PRE_WORK.value
    project.ea_certificate = "M24-01"
    project.eac_signed = "2024-05-01"
    project.save()
    phase_code = PhaseCode(
        name="Effects Assessment", work_type_id=6, ea_act_id=3, sort_order=1,
        visibility=PhaseVisibilityEnum.REGULAR,
    ).save()

    assessment = _work(project, work_type_id=6)
    shown = _phase(assessment, phase_code, "Effects Assessment", sort_order=1)
    _event(shown, "Assessment start", 1, EventPositionEnum.START, EventTemplateVisibilityEnum.MANDATORY)
    _event(shown, "Hidden check-in", 2, EventPositionEnum.INTERMEDIATE, EventTemplateVisibilityEnum.HIDDEN)
    decision = _event(shown, "Decision", 3, EventPositionEnum.END, EventTemplateVisibilityEnum.MANDATORY,
                      outcome="Certificate Issued")
    hidden = _phase(assessment, phase_code, "Internal review", sort_order=2, visibility=PhaseVisibilityEnum.HIDDEN)
    _flag(_phase(assessment, phase_code, "Inactive phase", sort_order=3), is_active=False)
    _flag(_phase(assessment, phase_code, "Deleted phase", sort_order=4), is_deleted=True)
    _flag(_event(shown, "Inactive event", 4, *MANDATORY), is_active=False)
    _flag(_event(shown, "Deleted event", 5, *MANDATORY), is_deleted=True)
    _event(shown, "Non-primary event", 6, *MANDATORY, category=NON_PRIMARY_CATEGORY)

    return {
        "project": project,
        "phase_code": phase_code,
        "work": assessment,
        "phase": shown,
        "hidden_phase": hidden,
        "event": decision,
        "ids": {
            "project": {project.id: 1001},
            "work": {assessment.id: 2001},
            "phase": {shown.id: 3001},
            "phase_code": {phase_code.id: 6001},
            "event": {},
            "configuration": {},
        },
    }


def _swap(ids, kind, value, start):
    return ids[kind].setdefault(value, start + len(ids[kind]))


def _event_ids(event, ids):
    event["id"] = _swap(ids, "event", event["id"], 4001)
    event["work_id"] = ids["work"][event["work_id"]]
    event["work_phase_id"] = ids["phase"][event["work_phase_id"]]
    configuration = event["event_configuration"]
    configuration["id"] = _swap(ids, "configuration", configuration["id"], 5001)


def _phase_ids(phase, ids):
    phase["id"] = ids["phase"][phase["id"]]
    phase["work_id"] = ids["work"][phase["work_id"]]
    phase["phase"]["id"] = ids["phase_code"][phase["phase"]["id"]]
    for event in phase.get("events", []):
        _event_ids(event, ids)


def _with_fixture_ids(body, ids):
    """Swap database ids and the stamp for the fixture's, so the comparison does not depend on sequences."""
    body["pushedAt"] = FIXTURE_STAMP
    if "project" in body:
        body["project"]["id"] = ids["project"][body["project"]["id"]]
    if "work" in body:
        work = body["work"]
        work["id"] = ids["work"][work["id"]]
        work["project_id"] = ids["project"][work["project_id"]]
        for phase in work.get("phases", []):
            _phase_ids(phase, ids)
    if "phase" in body:
        _phase_ids(body["phase"], ids)
    if "event" in body:
        _event_ids(body["event"], ids)
    return body


@pytest.mark.parametrize(
    "table, row, nested, fixture",
    [
        ("projects", "project", False, "demi_record_project.json"),
        ("works", "work", False, "demi_record_work.json"),
        ("works", "work", True, "demi_record_new_work.json"),
        ("work_phases", "phase", False, "demi_record_phase.json"),
        ("events", "event", False, "demi_record_event.json"),
    ],
)
def test_record_matches_fixture(seeded, table, row, nested, fixture):
    """Each record holds its own fields, and a new work its shown phases and primary events, never staff text."""
    before = int(time.time() * 1000)

    record = resolve_record(table, seeded[row].id, nested=nested)

    assert before - 1000 <= record.body["pushedAt"] <= int(time.time() * 1000) + 1000
    assert STAFF_TEXT not in json.dumps(record.body)
    expected = json.loads((FIXTURES / fixture).read_text())
    assert _with_fixture_ids(record.body, seeded["ids"]) == expected


@pytest.mark.parametrize("column, value", [("is_deleted", True), ("is_active", False)])
def test_deleted_or_inactive_event_sends_delete(seeded, column, value):
    """An event that left the feed is removed from DEMI."""
    _flag(seeded["event"], **{column: value})

    assert resolve_record("events", seeded["event"].id).delete


@pytest.mark.parametrize(
    "column, value", [("is_deleted", True), ("is_active", False), ("visibility", PhaseVisibilityEnum.HIDDEN)]
)
def test_phase_leaving_the_feed_sends_delete(seeded, column, value):
    """A deleted, inactive or hidden phase is removed from DEMI."""
    _flag(seeded["phase"], **{column: value})

    assert resolve_record("work_phases", seeded["phase"].id).delete


def test_non_primary_event_sends_nothing(seeded):
    """Only milestone categories reach DEMI."""
    event = Event.query.filter(Event.name == "Non-primary event").one()

    assert resolve_record("events", event.id) is None


def test_event_in_phase_outside_the_feed_sends_nothing(seeded):
    """The phase's own DELETE removed the event, so a send would only hit a missing parent."""
    event = _event(seeded["hidden_phase"], "Inside hidden phase", 1, *MANDATORY)

    assert resolve_record("events", event.id) is None


@pytest.mark.parametrize("values, delete", [({"is_deleted": True}, True), ({"is_active": False}, False)])
def test_deleted_work_is_excluded_and_inactive_work_included(seeded, values, delete):
    """Works mirror every non-deleted work, active or not."""
    _flag(seeded["work"], **values)

    assert resolve_record("works", seeded["work"].id).delete is delete


def test_deleted_project_sends_delete_and_no_child(seeded):
    """A deleted project is removed whole, so its records send nothing of their own."""
    _flag(seeded["project"], is_deleted=True)

    assert resolve_record("projects", seeded["project"].id).delete
    assert resolve_record("works", seeded["work"].id) is None
