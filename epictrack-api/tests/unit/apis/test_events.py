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
"""Test suite for Events."""
import copy
from datetime import timedelta
from http import HTTPStatus
from urllib.parse import urljoin

from collections import defaultdict
from faker import Faker
from flask import g

from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import (
    factory_auth_header,
    factory_project_model,
    factory_staff_model,
)
from tests.utilities.factory_scenarios import TestWorkInfo
from api.services.event import EventService
from api.services.work import WorkService
from api.services.work_phase import WorkPhase
from api.models.event_configuration import EventPositionEnum
from api.schemas.response import EventResponseSchema

API_BASE_URL = "/api/v1/"

fake = Faker()
NUMBER_OF_DAYS_TO_BE_PUSHED = 7


def test_change_date_start_event_non_legislated_phase_push(client, jwt):
    """Change the date of start event in a non-legislated phase by 7 days and choose to push subsequent events"""
    # If you change the anticipated date of the start event in a non-legislated phase, the number of days will be added
    # to all the events in the current phase as well as all the subsequent phase
    _change_start_event_anticipated_date(jwt, client, push_events=True)


def test_change_date_start_event_non_legislated_phase_not_push(client, jwt):
    """Change the date of start event in a non-legislated phase by 7 days and choose not to push subsequent events"""
    # Change the anticipated date of the start event in a non-legislated phase, then choose not to
    # push the subsequent event Only the currrent event will be changed
    _change_start_event_anticipated_date(jwt, client, push_events=False)


def test_change_date_start_event_legislated_phase_push(client, jwt):
    """Change the date of start event in a legislated phase by 7 days and choose to push subsequent events"""
    # Change the aniticipated date of the start event in a legislated phaes, then choose to push the subsequent events
    # all the events will be pushed till the end event in the last phase
    _change_start_event_anticipated_date(jwt, client, push_events=True, legislated=True)


def test_change_date_start_event_legislated_phase_not_push(client, jwt):
    """Change the date of start event in a legislated phase by 7 days and choose not to push subsequent events"""
    # Change the aniticipated date of the start event in a legislated phaes, then choose to push the subsequent events
    # Only the current event and the end event will be changed
    _change_start_event_anticipated_date(
        jwt, client, push_events=False, legislated=True
    )


def _change_start_event_anticipated_date(
    jwt, client, push_events: bool = False, legislated: bool = False
):
    """Change the anticipated date of the start event in a phase"""
    # Arrange
    # Set the admin user token
    headers = _set_admin_user(jwt=jwt)
    # Create an assessment work. This will create all the events
    # event_configuration, outcome_configuration and action_configurations
    work_data = _set_up_work_object()
    work = WorkService.create_work(work_data)
    work_phases = WorkPhase.find_by_params({"work_id": work.id})
    # first work phase in the assessment would be non-legislated and second is legislated
    # according to the ea act 2018
    work_phase_id_to_test = work_phases[0].id if not legislated else work_phases[1].id
    # Get workphase for checking
    work_phase = WorkPhase.find_by_id(work_phase_id_to_test)
    work_phase_start_date = work_phase.start_date
    work_phase_end_date = work_phase.end_date

    assert work is not None
    # Act
    phase_events = EventService.find_events(
        work_id=work.id, work_phase_id=work_phase_id_to_test
    )
    # Storing the anticipated dates of all events for the purpose of validating it after
    # the date change
    event_date_dict = defaultdict()
    for event in phase_events:
        event_date_dict[event.id] = event.anticipated_date
    start_event = copy.copy(
        next(
            (
                event
                for event in phase_events
                if event.event_configuration.event_position.value
                == EventPositionEnum.START.value
            ),
            None,
        )
    )
    end_event = next(
        (
            event
            for event in phase_events
            if event.event_configuration.event_position.value
            == EventPositionEnum.END.value
        ),
        None,
    )
    start_event.anticipated_date = start_event.anticipated_date + timedelta(
        days=NUMBER_OF_DAYS_TO_BE_PUSHED
    )
    start_event_data = EventResponseSchema().dump(start_event)
    url_event_update = urljoin(
        API_BASE_URL,
        f"milestones/events/{start_event.id}?push_events={push_events}",
    )
    result_update_event = client.put(
        url_event_update, headers=headers, json=start_event_data
    )
    # Assert
    assert result_update_event.status_code == HTTPStatus.OK
    assert (
        work_phase.start_date.date() - work_phase_start_date.date()
    ).days == NUMBER_OF_DAYS_TO_BE_PUSHED

    # Assert if push_events is set to true
    if push_events:
        for event in phase_events:
            assert (
                event.anticipated_date.date() - event_date_dict[event.id].date()
            ).days == 7
        assert (
            work_phase.end_date.date() - work_phase_end_date.date()
        ).days == NUMBER_OF_DAYS_TO_BE_PUSHED
    # Assert if push_events is set to false
    if not push_events:
        exclude_event_ids = (
            [start_event.id] if not legislated else [start_event.id, end_event.id]
        )
        assert (
            start_event.anticipated_date.date() - event_date_dict[start_event.id].date()
        ).days == NUMBER_OF_DAYS_TO_BE_PUSHED
        for event in [
            event for event in phase_events if event.id not in exclude_event_ids
        ]:
            assert (
                event.anticipated_date.date() - event_date_dict[event.id].date()
            ).days == 0
        if legislated:
            assert (
                end_event.anticipated_date.date() - event_date_dict[end_event.id].date()
            ).days == NUMBER_OF_DAYS_TO_BE_PUSHED


def _set_up_work_object():
    """Set up a full fledged work object"""
    project = factory_project_model()
    staff = factory_staff_model()
    work_data = TestWorkInfo.assessment_work.value
    work_data["project_id"] = project.id
    work_data["responsible_epd_id"] = staff.id
    work_data["work_lead_id"] = staff.id
    work_data["decision_by_id"] = staff.id
    return work_data


def _set_admin_user(jwt):
    """Set up the admin level user token in the token info"""
    staff_user = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    g.token_info = staff_user
    return headers
