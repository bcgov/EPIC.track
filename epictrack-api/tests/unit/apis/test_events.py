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
import enum
from datetime import timedelta
from http import HTTPStatus
from urllib.parse import urljoin

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
from api.services.work_phase import WorkPhase
from api.models import db as _db
from api.models.event_category import PRIMARY_CATEGORIES
from api.models.event_configuration import EventPositionEnum
from api.schemas.response import EventResponseSchema

API_BASE_URL = "/api/v1/"

fake = Faker()
NUMBER_OF_DAYS_TO_BE_PUSHED = 7


class TestTypeEnum(enum.Enum):
    """Type of test"""

    START_EVENT = 0
    INTERMEDIATE_EVENT = 1


def test_change_date_start_event_non_legislated_phase_push(client, jwt):
    """Change the date of start event in a non-legislated phase by 7 days and choose to push subsequent events"""
    # If you change the anticipated date of the start event in a non-legislated phase, the number of days will
    # be added
    # to all the events in the current phase as well as all the subsequent phase
    _change_event_anticipated_date(jwt, client, push_events=True)


def test_change_date_start_event_non_legislated_phase_not_push(client, jwt):
    """Change the date of start event in a non-legislated phase by 7 days and choose not to push subsequent events"""
    # Change the anticipated date of the start event in a non-legislated phase, then choose not to
    # push the subsequent event Only the currrent event will be changed
    _change_event_anticipated_date(jwt, client, push_events=False)


def test_change_date_start_event_legislated_phase_push(client, jwt):
    """Change the date of start event in a legislated phase by 7 days and choose to push subsequent events"""
    # Change the aniticipated date of the start event in a legislated phase, then choose to push the subsequent
    # events
    # all the events will be pushed till the end event in the last phase
    _change_event_anticipated_date(jwt, client, push_events=True, legislated=True)


def test_change_date_start_event_legislated_phase_not_push(client, jwt):
    """Change the date of start event in a legislated phase by 7 days and choose not to push subsequent events"""
    # Change the aniticipated date of the start event in a legislated phaes, then choose not to push the subsequent
    # events
    # Only the current event and the end event will be changed
    _change_event_anticipated_date(
        jwt, client, push_events=False, legislated=True
    )


def test_change_intermediate_event_non_legislated_phase_push(client, jwt):
    """Change the date of the intermediate event in a non-legislated phase by 7 days and chosee to push subsequent events"""
    # All the subsequent events plus the current event date should be pushed by the number of days to be pushed
    # since it is a non-legislated phase, the date push will continue all the way over to the end phase end event
    _change_event_anticipated_date(
        jwt,
        client,
        push_events=True,
        legislated=False,
        test_type=TestTypeEnum.INTERMEDIATE_EVENT,
    )


def test_change_intermediate_event_non_legislated_phase_not_push(client, jwt):
    """Change the anticipated date of the intermediate event in a non-legislated phase by 7 days ,not to push events"""
    # Only the current event will change no other events will change
    _change_event_anticipated_date(
        jwt,
        client,
        push_events=False,
        legislated=False,
        test_type=TestTypeEnum.INTERMEDIATE_EVENT,
    )


def _change_event_anticipated_date(
    jwt,
    client,
    push_events: bool = False,
    legislated: bool = False,
    test_type: TestTypeEnum = TestTypeEnum.START_EVENT,
):
    """Change the anticipated date of an event and verify cascading changes in phases."""
    # Arrange
    headers = _set_admin_user(jwt=jwt)
    work_data = _set_up_work_object()
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=work_data, headers=headers)
    work_response_json = work_response.json
    work_id = work_response_json["id"]
    assert work_id is not None

    # Get all phases
    all_phases = WorkPhase.find_by_params({"work_id": work_id})
    work_phase_to_test = all_phases[0] if not legislated else all_phases[1]
    # Save original phase dates
    work_phase_start_date = work_phase_to_test.start_date
    work_phase_end_date = work_phase_to_test.end_date
    # Load events fresh from DB (scoped=False ensures we get real tracked objects)
    work_events = EventService.find_events(
        work_id=work_id, work_phase_id=None, event_categories=PRIMARY_CATEGORIES, scoped=False
    )
    work_phase_to_test_events = EventService.find_events(
        work_id=work_id, work_phase_id=work_phase_to_test.id, event_categories=PRIMARY_CATEGORIES, scoped=False
    )
    # Store original anticipated dates
    original_dates = {e.id: e.anticipated_date for e in work_events}

    # Find target event
    target_position = (
        EventPositionEnum.START.value
        if test_type == TestTypeEnum.START_EVENT
        else EventPositionEnum.INTERMEDIATE.value
    )
    category_ids = list(map(lambda x: x.value, PRIMARY_CATEGORIES))
    event_to_update = next(
        e for e in work_phase_to_test_events
        if e.event_configuration.event_position.value == target_position
        and e.event_configuration.event_category_id in category_ids
    )

    # Find end event for legislated phase checks
    end_event = next(
        (e for e in work_phase_to_test_events if e.event_configuration.event_position.value == EventPositionEnum.END.value),
        None,
    )

    # Update anticipated date
    new_anticipated_date = event_to_update.anticipated_date + timedelta(days=NUMBER_OF_DAYS_TO_BE_PUSHED)
    # Dump the object to dict, then overwrite the field
    event_data = EventResponseSchema().dump(event_to_update)
    event_data["anticipated_date"] = new_anticipated_date.isoformat()
    url_event_update = urljoin(
        API_BASE_URL, f"milestones/events/{event_to_update.id}?push_events={push_events}"
    )
    # Use a subtransaction to ensure the changes are visible
    result_update_event = client.put(url_event_update, headers=headers, json=event_data)
    assert result_update_event.status_code == HTTPStatus.OK, result_update_event.json

    # Refresh and load all events
    _db.session.expire_all()
    all_phases = WorkPhase.find_by_params({"work_id": work_id})
    all_events = []

    for phase in all_phases:
        all_events.extend(
            EventService.find_events(work_id=work_id, work_phase_id=phase.id, event_categories=PRIMARY_CATEGORIES, scoped=False)
        )

    new_dates = {e.id: e.anticipated_date for e in all_events}

    # Determine which events should have been pushed
    pushed_event_ids = set()

    if push_events:
        # Determine starting phase index
        start_phase_index = next(
            i for i, phase in enumerate(all_phases)
            if any(e.id == event_to_update.id for e in EventService.find_events(
                work_id=work_id, work_phase_id=phase.id, scoped=False
            ))
        )
        # Iterate only from the triggering phase onward
        for phase in all_phases[start_phase_index:]:
            phase_events = EventService.find_events(
                work_id=work_id,
                work_phase_id=phase.id,
                event_categories=PRIMARY_CATEGORIES,
                scoped=False
            )
            # Ensure triggering event is included in the starting phase
            if phase.id == work_phase_to_test.id and event_to_update.id not in [e.id for e in phase_events]:
                phase_events.insert(0, event_to_update)
            # Determine start index
            start_index = 0
            if phase.id == work_phase_to_test.id:
                start_index = next(i for i, e in enumerate(phase_events) if e.id == event_to_update.id)
            # Determine if this phase push is allowed (legislated rules)
            trigger_pos = event_to_update.event_configuration.event_position.value
            # For legislated phase: push everything from start_index onward
            if legislated and trigger_pos in [EventPositionEnum.START.value, EventPositionEnum.END.value]:
                for e in phase_events[start_index:]:
                    pushed_event_ids.add(e.id)
            elif not legislated:
                # Non-legislated
                for e in phase_events[start_index:]:
                    pushed_event_ids.add(e.id)
    else:
        # Only the target event is pushed, plus END if legislated
        pushed_event_ids.add(event_to_update.id)
        if legislated and event_to_update.event_configuration.event_position.value == EventPositionEnum.START.value:
            pushed_event_ids.add(end_event.id)
    # Assert event anticipated dates
    for e in all_events:
        old_date = original_dates.get(e.id, e.anticipated_date).date()
        new_date = new_dates[e.id].date()
        if e.id in pushed_event_ids:
            assert (new_date - old_date).days == NUMBER_OF_DAYS_TO_BE_PUSHED
        else:
            assert (new_date - old_date).days == 0
    # Assert work phase dates
    refreshed_phase = WorkPhase.find_by_id(work_phase_to_test.id)
    if test_type == TestTypeEnum.START_EVENT:
        assert (refreshed_phase.start_date.date() - work_phase_start_date.date()).days == NUMBER_OF_DAYS_TO_BE_PUSHED
        if legislated or push_events:
            assert (refreshed_phase.end_date.date() - work_phase_end_date.date()).days == NUMBER_OF_DAYS_TO_BE_PUSHED


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
