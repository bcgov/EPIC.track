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

"""Test suite for SpecialFields."""
from datetime import datetime
from copy import copy
from http import HTTPStatus
from urllib.parse import urljoin

from api.models.special_field import EntityEnum
from api.utils.constants import CANADA_TIMEZONE
from tests.utilities.factory_scenarios import TestSpecialField
from tests.utilities.factory_utils import (
    factory_proponent_model,
    factory_special_field_model,
    factory_staff_model, factory_work_model,
)


API_BASE_URL = "/api/v1/"


def test_get_special_fields(client, auth_header):
    """Test get special fields."""
    url = urljoin(API_BASE_URL, "special-fields")
    entity_obj = factory_proponent_model()
    payload = {
        "entity": EntityEnum.PROPONENT.value,
        "entity_id": entity_obj.id,
        "field_name": "name",
    }
    result = client.get(url, query_string=payload, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_special_field(client, auth_header):
    """Test create new special field."""
    url = urljoin(API_BASE_URL, "special-fields")
    payload = copy(TestSpecialField.proponent_entity.value)
    entity_obj = factory_proponent_model()
    payload["entity_id"] = entity_obj.id

    # Scenario 1: Valid payload
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response_json
    assert payload["entity_id"] == response_json["entity_id"]
    assert payload["entity"] == response_json["entity"]
    assert payload["field_name"] == response_json["field_name"]
    assert payload["field_value"] == response_json["field_value"]
    active_from = datetime.fromisoformat(response_json["active_from"])
    assert payload["active_from"] == active_from.astimezone(CANADA_TIMEZONE).isoformat()

    # Scenario 2: Missing required fields
    del payload["entity_id"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["entity"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["field_name"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST
    del payload["field_value"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_get_special_field_details(client, auth_header):
    """Test get special field"""
    special_field = factory_special_field_model()
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json

    assert special_field.entity_id == response_json["entity_id"]
    assert special_field.entity.value == response_json["entity"]
    assert special_field.field_name == response_json["field_name"]
    assert special_field.field_value == response_json["field_value"]
    assert special_field.time_range.lower.isoformat() == response_json["active_from"]


def test_update_special_field(client, auth_header):
    """Test update special field"""
    special_field = factory_special_field_model()

    updated_data = copy(TestSpecialField.proponent_entity.value)
    updated_data["field_value"] = "Updated special value"
    updated_data["entity_id"] = special_field.entity_id
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json
    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == special_field.id
    assert response_json["field_value"] == updated_data["field_value"]


def test_add_special_field_with_upper_limit(client, auth_header):
    """Test update special field"""
    work = factory_work_model()
    staff1 = factory_staff_model()
    staff2 = factory_staff_model()
    first_special_field = TestSpecialField.work_entity.value
    first_special_field["entity_id"] = work.id
    first_special_field["field_value"] = str(staff1.id)
    first_special_field["active_from"] = datetime.fromisoformat(
        "2024-01-05T00:00:00-08:00"
    ).strftime("%Y-%m-%dT%H:%M:%S%z")
    special_field = factory_special_field_model(first_special_field)

    second_special_field = copy(TestSpecialField.work_entity.value)
    second_special_field["entity_id"] = work.id
    second_special_field["field_value"] = str(staff2.id)
    second_special_field["active_from"] = datetime.fromisoformat(
        "2024-02-05T00:00:00-08:00"
    ).strftime("%Y-%m-%dT%H:%M:%S%z")
    url = urljoin(API_BASE_URL, "special-fields")
    response = client.post(url, headers=auth_header, json=second_special_field)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    url = urljoin(API_BASE_URL, f"special-fields/{special_field.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json
    assert (
        datetime.strptime(response_json["active_from"], "%Y-%m-%dT%H:%M:%S%z").date()
        - datetime.strptime(
            first_special_field["active_from"], "%Y-%m-%dT%H:%M:%S%z"
        ).date()
    ).days == 0
    assert (
        datetime.strptime(
            second_special_field["active_from"], "%Y-%m-%dT%H:%M:%S%z"
        ).date()
        - datetime.strptime(response_json["active_to"], "%Y-%m-%dT%H:%M:%S%z").date()
    ).days == 1
