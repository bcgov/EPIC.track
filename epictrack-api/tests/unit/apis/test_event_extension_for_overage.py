# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Closing a legislated phase over its time limit by adding the extension in the same step, as the work plan does."""
from datetime import timedelta
from http import HTTPStatus
from urllib.parse import urljoin

from flask import g

from api.models import Event, EventConfiguration, EventTypeEnum, WorkPhase, db
from api.models.event_template import EventPositionEnum
from api.models.phase_code import PhaseVisibilityEnum
from tests.utilities.factory_scenarios import TestJwtClaims, TestWorkInfo
from tests.utilities.factory_utils import factory_auth_header
from tests.utilities.helpers import prepare_work_payload

API_BASE_URL = "/api/v1/"
DAYS_OVER = 5


def test_extension_added_with_the_end_lets_a_legislated_phase_close(client, jwt):
    """The date check gives the days needed; an extension of that many days, dated with the END, lets the END save."""
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.staff_admin_role)
    g.token_info = TestJwtClaims.staff_admin_role
    response = client.post(
        urljoin(API_BASE_URL, "works"), json=prepare_work_payload(TestWorkInfo.assessment_work.value), headers=headers
    )
    assert response.status_code == HTTPStatus.CREATED, response.json
    phase_id, number_of_days = _first_legislated_phase_under_way(response.json["id"])
    end = _milestone(phase_id, EventPositionEnum.END)
    end_id, planned_end = end.id, end.anticipated_date
    end_date = _milestone(phase_id, EventPositionEnum.START).actual_date + timedelta(days=number_of_days + DAYS_OVER)
    extension = _extension_configuration(phase_id)
    extension_request = {
        "name": extension.name,
        "event_configuration_id": extension.id,
        "number_of_days": DAYS_OVER,
        "anticipated_date": end_date.isoformat(),
        "actual_date": end_date.isoformat(),
    }
    db.session.expunge_all()

    assert _check(client, headers, end_id, end_date)["extension_days_required"] == DAYS_OVER
    refused = _save_end(client, headers, end_id, end_date)
    assert refused.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    assert f"at least {DAYS_OVER} days" in refused.get_data(as_text=True)

    added = client.post(
        urljoin(API_BASE_URL, f"milestones/workphases/{phase_id}/events?push_events=true"),
        json=extension_request,
        headers=headers,
    )

    assert added.status_code == HTTPStatus.CREATED, added.get_data(as_text=True)
    assert _check(client, headers, end_id, end_date)["extension_days_required"] == 0
    saved = _save_end(client, headers, end_id, end_date)
    assert saved.status_code == HTTPStatus.OK, saved.get_data(as_text=True)
    db.session.expire_all()
    end = db.session.get(Event, end_id)
    assert (end.anticipated_date.date() - planned_end.date()).days == DAYS_OVER
    assert end.actual_date.date() == end_date.date()
    assert db.session.get(WorkPhase, phase_id).is_completed


def _first_legislated_phase_under_way(work_id):
    """Complete the phases before the first legislated one, and every milestone in it but its END, in the database."""
    phases = sorted(
        WorkPhase.find_by_params({"work_id": work_id, "visibility": PhaseVisibilityEnum.REGULAR.value}),
        key=lambda p: p.sort_order,
    )
    for phase in phases:
        start = _milestone(phase.id, EventPositionEnum.START)
        start.actual_date = start.anticipated_date
        if phase.legislated:
            for event in _phase_milestones(phase.id):
                if event.event_configuration.event_position == EventPositionEnum.INTERMEDIATE:
                    event.actual_date = start.actual_date
            db.session.commit()
            return phase.id, phase.number_of_days
        end = _milestone(phase.id, EventPositionEnum.END)
        end.actual_date = end.anticipated_date
        phase.is_completed = True
    raise AssertionError("the work has no legislated phase")


def _phase_milestones(work_phase_id):
    return (
        db.session.query(Event)
        .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
        .filter(EventConfiguration.work_phase_id == work_phase_id, Event.is_active.is_(True))
        .all()
    )


def _milestone(work_phase_id, position):
    return next(
        e for e in _phase_milestones(work_phase_id) if e.event_configuration.event_position == position
    )


def _extension_configuration(work_phase_id):
    return (
        db.session.query(EventConfiguration)
        .filter(
            EventConfiguration.work_phase_id == work_phase_id,
            EventConfiguration.event_type_id == EventTypeEnum.TIME_LIMIT_EXTENSION.value,
        )
        .one()
    )


def _end_request(end_id, end_date):
    """The END as the work plan sends it: re-read, so the planned date carries any push."""
    end = db.session.get(Event, end_id)
    request = {
        "name": end.name,
        "event_configuration_id": end.event_configuration_id,
        "anticipated_date": end.anticipated_date.isoformat(),
        "actual_date": end_date.isoformat(),
    }
    db.session.expunge_all()
    return request


def _check(client, headers, end_id, end_date):
    response = client.post(
        urljoin(API_BASE_URL, f"milestones/check-events?event_id={end_id}"),
        json=_end_request(end_id, end_date),
        headers=headers,
    )
    assert response.status_code == HTTPStatus.OK, response.get_data(as_text=True)
    return response.json


def _save_end(client, headers, end_id, end_date):
    return client.put(
        urljoin(API_BASE_URL, f"milestones/events/{end_id}?push_events=false"),
        json=_end_request(end_id, end_date),
        headers=headers,
    )
