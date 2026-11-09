"""Contract test for the project payload Track pushes to DEMI."""
import json
import time
from pathlib import Path

from api.models import (
    PRIMARY_CATEGORIES, Event, EventCategoryEnum, EventConfiguration, EventTemplate, OutcomeConfiguration, PhaseCode)
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.models.project import ProjectStateEnum
from api.services.demi_payload import build_project_payload
from tests.utilities.factory_utils import factory_project_model, factory_work_model, factory_work_phase_model

FIXTURE = Path(__file__).resolve().parents[2] / "fixtures" / "demi_project_payload.json"
STAFF_TEXT = "STAFF-ONLY"
NON_PRIMARY_CATEGORY = next(category for category in EventCategoryEnum if category not in PRIMARY_CATEGORIES)

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


def _seed():
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
    _event(shown, "Decision", 3, EventPositionEnum.END, EventTemplateVisibilityEnum.MANDATORY,
           outcome="Certificate Issued")
    hidden = _phase(assessment, phase_code, "Internal review", sort_order=2,
                    visibility=PhaseVisibilityEnum.HIDDEN)
    _event(hidden, "Inside hidden phase", 1, EventPositionEnum.START, EventTemplateVisibilityEnum.MANDATORY)
    _flag(_phase(assessment, phase_code, "Inactive phase", sort_order=3), is_active=False)
    _flag(_phase(assessment, phase_code, "Deleted phase", sort_order=4), is_deleted=True)
    mandatory = (EventPositionEnum.INTERMEDIATE, EventTemplateVisibilityEnum.MANDATORY)
    _flag(_event(shown, "Inactive event", 4, *mandatory), is_active=False)
    _flag(_event(shown, "Deleted event", 5, *mandatory), is_deleted=True)
    _event(shown, "Non-primary event", 6, *mandatory, category=NON_PRIMARY_CATEGORY)

    intake = _work(project, work_type_id=4, is_active=False)
    deleted = _work(project, work_type_id=6, is_deleted=True)
    _phase(deleted, phase_code, "Deleted work phase", sort_order=1)

    return {
        "project": {project.id: 1001},
        "work": {assessment.id: 2001, intake.id: 2002},
        "phase": {shown.id: 3001},
    }


def _with_fixture_ids(payload, ids, events):
    """Swap database ids for the fixture's, so the comparison does not depend on sequence values."""
    payload["project"]["id"] = ids["project"][payload["project"]["id"]]
    for work in payload["works"]:
        work["id"] = ids["work"].get(work["id"], work["id"])
        work["project_id"] = ids["project"][work["project_id"]]
        for phase in work["phases"]:
            phase["id"] = ids["phase"].get(phase["id"], phase["id"])
            for event in phase["events"]:
                event["id"] = events.setdefault(event["id"], 4001 + len(events))
    return payload


def test_payload_matches_fixture(session):
    """Deleted works, hidden phases and staff text stay out; inactive and unmirrored works go in."""
    ids = _seed()
    before = int(time.time() * 1000)

    payload = build_project_payload(next(iter(ids["project"])))

    assert before - 1000 <= payload["pushedAt"] <= int(time.time() * 1000) + 1000
    assert STAFF_TEXT not in json.dumps(payload)
    expected = json.loads(FIXTURE.read_text())
    payload["pushedAt"] = expected["pushedAt"]
    assert _with_fixture_ids(payload, ids, {}) == expected


def test_deleted_project_has_no_payload(session):
    """A PUT is only built for a live project."""
    project = factory_project_model(PROJECT)
    project.is_deleted = True
    project.save()

    assert build_project_payload(project.id) is None
