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

"""Test suite for Works."""
from copy import copy
from datetime import datetime, timedelta
from enum import Enum
from http import HTTPStatus
from urllib.parse import urljoin

from api.services.event import EventService
from api.services.event_configuration import EventConfigurationService
from api.services.phaseservice import PhaseService
from api.services.role import RoleService
from tests.utilities.factory_scenarios import TestWorkInfo
from tests.utilities.factory_utils import factory_project_model, factory_staff_model, factory_work_model


API_BASE_URL = "/api/v1/"


def test_get_works(client, auth_header):
    """Test get works."""
    url = urljoin(API_BASE_URL, "works")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_work(client, auth_header):
    """Test create new work."""
    url = urljoin(API_BASE_URL, "works")
    payload = copy(TestWorkInfo.work1.value)
    project = factory_project_model()
    epd = factory_staff_model()
    work_lead = factory_staff_model()
    decision_maker = factory_staff_model()
    payload["project_id"] = project.id
    payload["responsible_epd_id"] = epd.id
    payload["work_lead_id"] = work_lead.id
    payload["decision_by_id"] = decision_maker.id

    # Scenario 1: Valid payload
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response_json
    for key, value in payload.items():
        if key == "start_date":
            start_date = datetime.fromisoformat(response_json[key])
            value = datetime.fromisoformat(value)
            assert value.date() == start_date.date()
        else:
            assert value == response_json[key]
    # TODO:: VALIDATE WORK PHASES AND EVENT CONFIGS/EVENTS

    # Scenario 2: Missing required fields
    del payload["title"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_validate_work(client, auth_header):
    """Test validate work"""
    url = urljoin(API_BASE_URL, "works/exists")
    # Scenario 1: Updating an existing work
    work = factory_work_model()
    payload = {"title": work.title, "work_id": work.id}
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]

    # Scenario 2: Creating new work with existing name
    del payload["work_id"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.json["exists"]

    # Scenario 3: Creating new work with new name
    payload = TestWorkInfo.validation_work.value
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]


def test_get_work_details(client, auth_header):
    """Test get work"""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f"works/{work.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    for key, value in response_json.items():
        if isinstance(value, dict):
            # Ignore nested objects
            continue
        obj_value = getattr(work, key)
        if isinstance(obj_value, datetime):
            obj_value = obj_value.isoformat()
        if isinstance(obj_value, Enum):
            obj_value = obj_value.value
        assert value == obj_value


def test_work_plan(client, auth_header):
    """Test work plan"""
    payload = copy(TestWorkInfo.work1.value)
    project = factory_project_model()
    epd = factory_staff_model()
    work_lead = factory_staff_model()
    decision_maker = factory_staff_model()
    payload["project_id"] = project.id
    payload["responsible_epd_id"] = epd.id
    payload["work_lead_id"] = work_lead.id
    payload["decision_by_id"] = decision_maker.id

    # Create the work
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=payload, headers=auth_header)
    work_response_json = work_response.json
    assert work_response.status_code == HTTPStatus.CREATED

    # Verify team lead
    roles = RoleService.find_all()
    team_lead_role = next((x for x in roles if x.name == "Team Lead"))
    url = urljoin(API_BASE_URL, f"works/{work_response_json['id']}/staff-roles")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert any(
        (
            x["role_id"] == team_lead_role.id and x["staff_id"] == work_lead.id
            for x in response_json
        )
    )

    # Verify phases
    phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(
        payload["ea_act_id"], payload["work_type_id"]
    )
    phase_ids = [x.id for x in phases]
    url = urljoin(API_BASE_URL, f"works/{work_response_json['id']}/phases")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    work_phase_json = response.json
    print("-" * 100)
    print(work_phase_json)
    print("-" * 100)
    work_phase_ids = [x["work_phase"]["phase_id"] for x in work_phase_json]
    assert all([phase_id in work_phase_ids for phase_id in phase_ids])

    for index, work_phase in enumerate(work_phase_json):
        # Verify mandatory milestones
        mandatory_event_configurations = EventConfigurationService.find_configurations(
            work_phase_id=work_phase["work_phase"]["id"], mandatory=True
        )
        work_milestone_events = EventService.find_milestone_events_by_work_phase(
            work_phase["work_phase"]["id"]
        )
        work_milestone_event_configurations = [
            x.event_configuration_id for x in work_milestone_events
        ]
        assert all(
            [
                mandatory_event_configuration.id in work_milestone_event_configurations
                for mandatory_event_configuration in mandatory_event_configurations
            ]
        )

        # verify start date
        if index == 0:
            assert (
                work_response_json["start_date"]
                == work_phase["work_phase"]["start_date"]
            )
        else:
            prev_work_phase = work_phase_json[index - 1]
            prev_start_date = prev_work_phase["work_phase"]["start_date"]
            prev_start_date = datetime.fromisoformat(prev_start_date)
            assert (
                work_phase["work_phase"]["start_date"]
                == (
                    prev_start_date
                    + timedelta(days=prev_work_phase["total_number_of_days"] + 1)
                ).isoformat()
            )


def test_update_work(client, auth_header):
    """Test update work"""
    work = factory_work_model()
    updated_data = copy(TestWorkInfo.work1.value)
    updated_data["project_id"] = work.project_id
    updated_data["title"] = "Work title updated"
    url = urljoin(API_BASE_URL, f"works/{work.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json
    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == work.id
    assert response_json["title"] == updated_data["title"]


def test_delete_work(client, auth_header):
    """Test delete work"""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f"works/{work.id}")
    response = client.delete(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Work successfully deleted"

    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND
