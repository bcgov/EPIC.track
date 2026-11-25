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
"""Adding a milestone that pushes the later dates."""
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
EXTENSION_DAYS = 10


def test_added_extension_pushes_later_milestones_with_their_phases(client, jwt):
    """A granted extension moves the phase's end and the next phase, milestones and phase dates alike."""
    headers = factory_auth_header(jwt=jwt, claims=TestJwtClaims.staff_admin_role)
    g.token_info = TestJwtClaims.staff_admin_role
    response = client.post(
        urljoin(API_BASE_URL, "works"), json=prepare_work_payload(TestWorkInfo.assessment_work.value), headers=headers
    )
    assert response.status_code == HTTPStatus.CREATED, response.json
    phase, next_phase = _first_legislated_phase_started(response.json["id"])
    extension = (
        db.session.query(EventConfiguration)
        .filter(
            EventConfiguration.work_phase_id == phase.id,
            EventConfiguration.event_type_id == EventTypeEnum.TIME_LIMIT_EXTENSION.value,
        )
        .one()
    )
    granted = _milestone(phase.id, EventPositionEnum.START).actual_date + timedelta(days=EXTENSION_DAYS)
    before = _dates(phase.id, next_phase.id)
    request = {
        "name": extension.name,
        "event_configuration_id": extension.id,
        "number_of_days": EXTENSION_DAYS,
        "anticipated_date": granted.isoformat(),
        "actual_date": granted.isoformat(),
    }
    # A request starts with an empty session.
    db.session.expunge_all()

    response = client.post(
        urljoin(API_BASE_URL, f"milestones/workphases/{phase.id}/events?push_events=true"), json=request, headers=headers
    )

    assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text=True)
    after = _dates(phase.id, next_phase.id)
    assert {name: (after[name] - before[name]).days for name in before} == {
        "end milestone": EXTENSION_DAYS,
        "phase end": EXTENSION_DAYS,
        "next start milestone": EXTENSION_DAYS,
        "next phase start": EXTENSION_DAYS,
    }


def _first_legislated_phase_started(work_id):
    """Complete the phases before the first legislated one and start it, straight in the database."""
    phases = sorted(
        WorkPhase.find_by_params({"work_id": work_id, "visibility": PhaseVisibilityEnum.REGULAR.value}),
        key=lambda p: p.sort_order,
    )
    for index, phase in enumerate(phases):
        start = _milestone(phase.id, EventPositionEnum.START)
        start.actual_date = start.anticipated_date
        if phase.legislated:
            db.session.commit()
            return phase, phases[index + 1]
        end = _milestone(phase.id, EventPositionEnum.END)
        end.actual_date = end.anticipated_date
        phase.is_completed = True
    raise AssertionError("the work has no legislated phase")


def _milestone(work_phase_id, position):
    return (
        db.session.query(Event)
        .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
        .filter(EventConfiguration.work_phase_id == work_phase_id, EventConfiguration.event_position == position)
        .one()
    )


def _dates(work_phase_id, next_work_phase_id):
    db.session.expire_all()
    return {
        "end milestone": _milestone(work_phase_id, EventPositionEnum.END).anticipated_date,
        "phase end": db.session.get(WorkPhase, work_phase_id).end_date,
        "next start milestone": _milestone(next_work_phase_id, EventPositionEnum.START).anticipated_date,
        "next phase start": db.session.get(WorkPhase, next_work_phase_id).start_date,
    }
