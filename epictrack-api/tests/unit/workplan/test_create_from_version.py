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
"""Tests for creating a work from its template version, as the v2 engine does."""
from collections import Counter
from datetime import timedelta
from http import HTTPStatus

import pytest
import sqlalchemy as sa

from api.models import (
    Event, EventConfiguration, OutcomeConfiguration, OutcomeEffect, TemplateEvent, TemplatePhase, Work,
    WorkCalendarEvent, WorkPhase, WorkTemplate)
from api.models.event_category import EventCategoryEnum
from api.workplan import engine
from api.workplan.work_backfill import backfill_work
from tests.utilities.helpers import prepare_work_payload


@pytest.fixture
def v2(app):
    """Run the v2 engine for one test."""
    app.config["PHASE_ENGINE"] = engine.V2
    yield
    app.config["PHASE_ENGINE"] = engine.V1


def _create_works(client, auth_header, session, title):
    """One work from every template, created through the API."""
    works = []
    for index, template in enumerate(WorkTemplate.query.order_by(WorkTemplate.work_type_id)):
        payload = {**prepare_work_payload(), "work_type_id": template.work_type_id, "simple_title": f"{title} {index}"}
        response = client.post("/api/v1/works", json=payload, headers=auth_header)
        assert response.status_code == HTTPStatus.CREATED, response.json
        works.append((template, session.get(Work, response.json["id"])))
    session.flush()
    return works


def _phases(work):
    return WorkPhase.query.filter_by(work_id=work.id).order_by(WorkPhase.sort_order).all()


def _configurations(work):
    return EventConfiguration.query.join(WorkPhase).filter(WorkPhase.work_id == work.id).all()


@pytest.mark.usefixtures("v2")
def test_each_row_traces_to_version_one(client, auth_header, session):
    """A work's phases, milestones and outcomes are the version's, with the legacy rows the current engine runs."""
    for template, work in _create_works(client, auth_header, session, "Lineage"):
        [version] = template.versions
        assert work.template_version_id == version.id
        phases = _phases(work)
        assert [session.get(TemplatePhase, p.template_phase_id).phase_code_id for p in phases] == [
            p.phase_code_id for p in version.phases], template.name
        assert work.current_work_phase_id == phases[0].id
        configurations = {c.id: c for c in _configurations(work)}
        for configuration in configurations.values():
            event = session.get(TemplateEvent, configuration.template_event_id)
            anchor = configurations.get(configuration.anchor_configuration_id)
            assert (configuration.template_id, configuration.parent_id) == (
                event.legacy_event_template_id, configuration.anchor_configuration_id), template.name
            assert (anchor.template_event_id if anchor else None) == event.anchor_template_event_id, template.name
        for outcome in OutcomeConfiguration.query.filter(
                OutcomeConfiguration.event_configuration_id.in_(list(configurations))):
            assert outcome.template_outcome_id and outcome.outcome_template_id, (template.name, outcome.name)
        assert OutcomeEffect.query.join(OutcomeConfiguration).filter(
            OutcomeConfiguration.event_configuration_id.in_(list(configurations))).count(), template.name


@pytest.mark.usefixtures("v2", "history")
def test_the_settings_backfill_finds_nothing_to_change(client, auth_header, session):
    """The legacy columns agree with the new ones, so the current engine's backfill writes no history."""
    works = _create_works(client, auth_header, session, "Backfill")
    count = sa.text("SELECT (SELECT count(*) FROM works_history), (SELECT count(*) FROM work_phases_history),"
                    " (SELECT count(*) FROM event_configurations_history),"
                    " (SELECT count(*) FROM outcome_configurations_history), (SELECT count(*) FROM outcome_effects_history)")
    before = session.execute(count).one()

    for _, work in works:
        backfill_work(work.id)
    session.flush()

    assert session.execute(count).one() == before
    assert all(before)


@pytest.mark.usefixtures("v2")
def test_dates_follow_the_phase_rules(client, auth_header, session):
    """Phases follow each other with no gap, end after their time limit, and their milestones follow their anchors."""
    checked = Counter()
    for template, work in _create_works(client, auth_header, session, "Dates"):
        previous_end = None
        for phase in _phases(work):
            first_day = 1 if phase.day_basis.value == "ONE" else 0
            checked["day one"] += first_day
            assert (phase.end_date - phase.start_date).days == phase.number_of_days - first_day, phase.name
            if phase.visibility.value != "REGULAR":
                continue
            if previous_end is not None:
                assert phase.start_date == previous_end + timedelta(days=1), (template.name, phase.name)
            previous_end = phase.end_date
            for event in Event.query.join(EventConfiguration).filter(EventConfiguration.work_phase_id == phase.id):
                configuration = event.event_configuration
                if configuration.event_position.value == "START":
                    assert event.anticipated_date == phase.start_date
                elif configuration.event_position.value == "END":
                    assert event.anticipated_date == phase.end_date, (template.name, phase.name)
                elif event.source_event_id:
                    assert event.anticipated_date == _anchored_date(session, configuration, event.source_event_id)
        for link in WorkCalendarEvent.query.join(EventConfiguration).join(WorkPhase).filter(WorkPhase.work_id == work.id):
            assert link.event_configuration.event_category_id == EventCategoryEnum.CALENDAR.value
            assert link.calendar_event.anticipated_date == _anchored_date(
                session, link.event_configuration, link.source_event_id)
            checked[f"calendar from the {link.event_configuration.anchor_point.value}"] += 1
    # The test templates' dated children are all calendar events.
    assert set(checked) == {"day one", "calendar from the START", "calendar from the END"}, checked


def _anchored_date(session, configuration, source_event_id):
    source = session.get(Event, source_event_id)
    from_end = configuration.anchor_point.value == "END"
    return source.anticipated_date + timedelta(
        days=(source.number_of_days if from_end else 0) + configuration.offset_days)
