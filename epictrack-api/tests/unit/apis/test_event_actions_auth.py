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
"""Authorization tests for the actions triggered when a milestone event is completed."""
from datetime import timedelta
from http import HTTPStatus
from urllib.parse import urljoin

from flask import g

from api.models.action import ActionEnum
from api.models.action_configuration import ActionConfiguration
from api.models.event import Event
from api.models.event_configuration import EventConfiguration
from api.models.linked_work import LinkedWork
from api.models.outcome_configuration import OutcomeConfiguration
from api.models.role import Role
from api.models.staff_work_role import StaffWorkRole
from api.models.work import Work
from api.models.work_phase import WorkPhase
from api.schemas.response import EventResponseSchema
from tests.utilities.factory_scenarios import TestJwtClaims, TestWorkInfo
from tests.utilities.factory_utils import (
    factory_auth_header,
    factory_project_model,
    factory_staff_model,
)

API_BASE_URL = "/api/v1/"

# Minister's Designation works end with a decision whose outcome carries a CreateWork action
MINISTERS_DESIGNATION_WORK_TYPE = 2


def test_team_member_can_complete_event_with_create_work_action(session, client, jwt):
    """A viewer on the work team can complete the final decision event of a work.

    The outcome of that event carries a CreateWork action, which creates the follow up
    work. That must not require the global create role of a member of the source team.
    """
    work_id, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)
    _add_to_work_team(session, work_id, TestJwtClaims.viewer.value["email"])

    result = _complete_event(client, jwt, session, event, outcome_config, TestJwtClaims.viewer)

    assert result.status_code == HTTPStatus.OK, result.json
    linked_work = session.query(LinkedWork).filter(LinkedWork.source_work_id == work_id).one_or_none()
    assert linked_work is not None


def test_non_team_member_viewer_cannot_complete_event_with_create_work_action(session, client, jwt):
    """A viewer who is not on the work team still cannot complete the event."""
    _, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)

    result = _complete_event(client, jwt, session, event, outcome_config, TestJwtClaims.viewer)

    assert result.status_code == HTTPStatus.FORBIDDEN


def _work_with_pending_create_work_decision(client, jwt, session):
    """Create a work sitting on its final decision event, which carries a CreateWork action."""
    admin = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=admin)
    g.token_info = admin

    project = factory_project_model()
    staff = factory_staff_model()
    work_data = dict(TestWorkInfo.work1.value)
    work_data.update({
        "title": "Minister's Designation",
        "work_type_id": MINISTERS_DESIGNATION_WORK_TYPE,
        "project_id": project.id,
        "responsible_epd_id": staff.id,
        "work_lead_id": staff.id,
        "decision_by_id": staff.id,
    })
    work_response = client.post(urljoin(API_BASE_URL, "works"), json=work_data, headers=headers)
    assert work_response.status_code == HTTPStatus.CREATED, work_response.json
    work_id = work_response.json["id"]

    # The decision in the last phase whose outcome triggers CreateWork
    row = (
        session.query(OutcomeConfiguration, EventConfiguration, WorkPhase)
        .join(ActionConfiguration, ActionConfiguration.outcome_configuration_id == OutcomeConfiguration.id)
        .join(EventConfiguration, OutcomeConfiguration.event_configuration_id == EventConfiguration.id)
        .join(WorkPhase, EventConfiguration.work_phase_id == WorkPhase.id)
        .join(Event, Event.event_configuration_id == EventConfiguration.id)
        .filter(
            Event.work_id == work_id,
            ActionConfiguration.action_id == ActionEnum.CREATE_WORK.value,
            ActionConfiguration.additional_params.has_key("work_type"),  # noqa: W601
        )
        .order_by(WorkPhase.sort_order.desc())
        .first()
    )
    assert row is not None, "no CreateWork action configured on this work"
    outcome_config, event_config, target_phase = row
    event = session.query(Event).filter(Event.event_configuration_id == event_config.id).one()

    # Bring the work to the point where this decision is the milestone left to complete
    for phase in session.query(WorkPhase).filter(WorkPhase.work_id == work_id).all():
        if phase.sort_order < target_phase.sort_order:
            phase.is_completed = True
    for other in session.query(Event).filter(Event.work_id == work_id, Event.id != event.id).all():
        if other.actual_date is None:
            other.actual_date = other.anticipated_date
    work = session.query(Work).filter(Work.id == work_id).one()
    work.current_work_phase_id = target_phase.id
    session.commit()

    return work_id, event, outcome_config


def _add_to_work_team(session, work_id, email):
    """Make the user identified by `email` a team member of the work."""
    staff = factory_staff_model()
    staff.email = email
    session.add(staff)
    session.commit()
    session.add(StaffWorkRole(
        staff_id=staff.id,
        work_id=work_id,
        role_id=session.query(Role).first().id,
    ))
    session.commit()
    return staff


def _complete_event(client, jwt, session, event, outcome_config, claims):
    """Set the actual date and outcome on the event as the given user."""
    phase_start_event = next(
        e for e in session.query(Event).filter(Event.work_id == event.work_id).all()
        if e.event_configuration.work_phase_id == event.event_configuration.work_phase_id
        and e.event_configuration.event_position.value == "START"
    )
    payload = EventResponseSchema().dump(event)
    payload["actual_date"] = (phase_start_event.actual_date + timedelta(days=1)).isoformat()
    payload["outcome_id"] = outcome_config.id
    session.expire_all()

    return client.put(
        urljoin(API_BASE_URL, f"milestones/events/{event.id}?push_events=false"),
        headers=factory_auth_header(jwt=jwt, claims=claims),
        json=payload,
    )
