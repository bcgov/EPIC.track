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
"""Tests for editing milestone dates through the API, as the v2 engine plans them."""
from datetime import timedelta
from http import HTTPStatus
from unittest.mock import patch

import pytest

from api.models import CalendarEvent, Event, EventConfiguration, Work, WorkCalendarEvent, WorkPhase, WorkTemplate
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.workplan import engine
from tests.utilities.helpers import prepare_work_payload

WORK_START = "2024-01-01T00:00:00-08:00"


@pytest.fixture
def v2(app):
    """Run the v2 engine for one test."""
    app.config["PHASE_ENGINE"] = engine.V2
    yield
    app.config["PHASE_ENGINE"] = engine.V1


def _create_work(client, auth_header, session, work_type_id, title):
    payload = {**prepare_work_payload(), "work_type_id": work_type_id, "start_date": WORK_START, "simple_title": title}
    response = client.post("/api/v1/works", json=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED, response.json
    return session.get(Work, response.json["id"])


def _phases(work):
    return WorkPhase.query.filter_by(work_id=work.id, visibility=PhaseVisibilityEnum.REGULAR).order_by(
        WorkPhase.sort_order).all()


def _events(phase):
    return Event.query.join(EventConfiguration).filter(
        EventConfiguration.work_phase_id == phase.id, Event.is_active.is_(True)).order_by(Event.anticipated_date).all()


def _boundary(phase, position):
    return next(e for e in _events(phase) if e.event_configuration.event_position == position)


def _first_work_with(client, auth_header, session, wanted):
    """A work from the first template whose regular phases give `wanted(phases)` something."""
    for index, template in enumerate(WorkTemplate.query.order_by(WorkTemplate.work_type_id)):
        work = _create_work(client, auth_header, session, template.work_type_id, f"Edit dates {index}")
        found = wanted(_phases(work))
        if found:
            return work, found
    raise AssertionError("no test template has what the test needs")


def _request(event, anticipated=None, actual=None):
    return {
        "name": event.name, "event_configuration_id": event.event_configuration_id,
        "anticipated_date": (anticipated or event.anticipated_date).isoformat(),
        **({"actual_date": actual.isoformat()} if actual else {}),
    }


def _save(client, auth_header, session, event, push=False, **dates):
    request = _request(event, **dates)
    session.expunge_all()
    return client.put(f"/api/v1/milestones/events/{event.id}?push_events={str(push).lower()}", json=request,
                      headers=auth_header)


def _check(client, auth_header, session, event, **dates):
    request = _request(event, **dates)
    session.expunge_all()
    response = client.post(f"/api/v1/milestones/check-events?event_id={event.id}", json=request, headers=auth_header)
    assert response.status_code == HTTPStatus.OK, response.json
    return response.json


def _pushable(phases):
    """A non-legislated phase's planned top-level milestone with planned milestones after it, and the next phase."""
    for phase, after in zip(phases, phases[1:]):
        if phase.legislated:
            continue
        top_level = [e for e in _events(phase) if e.event_configuration.anchor_configuration_id is None]
        for event in top_level:
            later = [e for e in top_level if e.anticipated_date > event.anticipated_date]
            if event.event_configuration.event_position == EventPositionEnum.INTERMEDIATE and later:
                return phase, after, event
    return None


@pytest.mark.usefixtures("v2")
def test_the_dry_run_says_what_the_save_does(client, auth_header, session):
    """The check offers a push of the days the save then moves, through the end of the phase and the phases after."""
    work, (phase, after, event) = _first_work_with(client, auth_header, session, _pushable)
    before = {e.id: e.anticipated_date for p in _phases(work) for e in _events(p)}
    end, next_start, moved = _boundary(phase, EventPositionEnum.END), _boundary(after, EventPositionEnum.START), event.id
    end_id, next_start_id = end.id, next_start.id

    check = _check(client, auth_header, session, event, anticipated=event.anticipated_date + timedelta(days=3))
    saved = _save(client, auth_header, session, session.get(Event, moved), push=True,
                  anticipated=before[moved] + timedelta(days=3))

    assert (check["subsequent_event_push_required"], check["days_pushed"]) == (True, 3)
    assert saved.status_code == HTTPStatus.OK, saved.json
    session.expire_all()
    for event_id in (moved, end_id, next_start_id):
        assert session.get(Event, event_id).anticipated_date.date() == (before[event_id] + timedelta(days=3)).date()


@pytest.mark.usefixtures("v2")
def test_recording_an_end_opens_the_next_phase(client, auth_header, session):
    """The next phase's START is recorded the day after, the phase completes, and the work moves on."""
    work = _create_work(client, auth_header, session, WorkTemplate.query.order_by(WorkTemplate.work_type_id).first()
                        .work_type_id, "Record an end")
    first, second = _phases(work)[:2]
    end, start = _boundary(first, EventPositionEnum.END), _boundary(second, EventPositionEnum.START)
    end_date, start_id, first_id, second_id, work_id = end.anticipated_date, start.id, first.id, second.id, work.id

    saved = _save(client, auth_header, session, end, actual=end_date)

    assert saved.status_code == HTTPStatus.OK, saved.json
    session.expire_all()
    assert session.get(Event, start_id).actual_date == end_date + timedelta(days=1)
    assert session.get(WorkPhase, first_id).is_completed
    assert session.get(Work, work_id).current_work_phase_id == second_id


@pytest.mark.usefixtures("v2")
def test_skipping_the_date_logic_saves_only_the_milestone(app, client, auth_header, session):
    """With SKIP_EVENT_LOGIC set, moving an END leaves the next phase where it was."""
    work = _create_work(client, auth_header, session, WorkTemplate.query.order_by(WorkTemplate.work_type_id).first()
                        .work_type_id, "Skip the date logic")
    first, second = _phases(work)[:2]
    end, start = _boundary(first, EventPositionEnum.END), _boundary(second, EventPositionEnum.START)
    end_id, end_date, start_id, start_date = end.id, end.anticipated_date, start.id, start.anticipated_date

    with patch.dict(app.config, {"SKIP_EVENT_LOGIC": True}):
        saved = _save(client, auth_header, session, end, anticipated=end_date + timedelta(days=5))

    assert saved.status_code == HTTPStatus.OK, saved.json
    session.expire_all()
    assert session.get(Event, start_id).anticipated_date == start_date
    assert session.get(Event, end_id).anticipated_date.date() == (end_date + timedelta(days=5)).date()


@pytest.mark.usefixtures("v2")
def test_a_milestone_can_t_be_dated_outside_its_phase(client, auth_header, session):
    """The save says to move the phase's end first."""
    _, (phase, _, event) = _first_work_with(client, auth_header, session, _pushable)
    beyond = _boundary(phase, EventPositionEnum.END).anticipated_date + timedelta(days=5)

    refused = _save(client, auth_header, session, event, anticipated=beyond)

    assert refused.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert "outside its phase" in refused.get_data(as_text=True)


def _calendar_child(phases):
    """A calendar entry dated from a planned milestone, and that milestone."""
    for phase in phases:
        for event in _events(phase):
            link = WorkCalendarEvent.query.filter_by(source_event_id=event.id, is_active=True).first()
            dated = event.event_configuration.visibility in (
                EventTemplateVisibilityEnum.MANDATORY, EventTemplateVisibilityEnum.SUGGESTED)
            if link and dated and event.event_configuration.event_position == EventPositionEnum.INTERMEDIATE:
                return event, link
    return None


@pytest.mark.usefixtures("v2")
def test_calendar_entries_follow_their_milestone(client, auth_header, session):
    """Moving a milestone re-dates its calendar entries, which the current engine never saves."""
    _, (event, link) = _first_work_with(client, auth_header, session, _calendar_child)
    configuration = link.event_configuration
    expected = event.anticipated_date + timedelta(days=1 + configuration.offset_days + (
        event.number_of_days if configuration.anchor_point.value == "END" else 0))
    entry_id = link.calendar_event_id

    saved = _save(client, auth_header, session, event, anticipated=event.anticipated_date + timedelta(days=1))

    assert saved.status_code == HTTPStatus.OK, saved.json
    session.expire_all()
    assert session.get(CalendarEvent, entry_id).anticipated_date == expected
