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
"""Test suite for staff."""

from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from tests.utilities.factory_scenarios import TestStaffInfo
from tests.utilities.factory_utils import factory_staff_model


API_BASE_URL = "/api/v1/"


def test_get_staff_by_positions(client, auth_header):
    """Test get staff by position."""
    url = urljoin(API_BASE_URL, "staffs?positions=3")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_get_all_active_staff(client, auth_header):
    """Test get all active staff."""
    url = urljoin(API_BASE_URL, "staffs")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_get_staff_details(client, auth_header):
    """Test get staff details."""
    staff = factory_staff_model()
    url = urljoin(API_BASE_URL, f"staffs/{staff.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert staff.email == response_json["email"]
    assert staff.first_name == response_json["first_name"]
    assert staff.last_name == response_json["last_name"]
    assert staff.full_name == response_json["full_name"]
    assert staff.is_active == response_json["is_active"]
    assert staff.phone == response_json["phone"]
    assert staff.position_id == response_json["position_id"]


def test_create_staff(client, auth_header):
    """Test create staff"""
    staff_data = TestStaffInfo.staff1.value
    url = urljoin(API_BASE_URL, "staffs")
    response = client.post(url, json=staff_data, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED
    response_json = response.json
    assert "id" in response_json
    assert staff_data["email"] == response_json["email"]
    assert staff_data["first_name"] == response_json["first_name"]
    assert staff_data["last_name"] == response_json["last_name"]
    assert staff_data["is_active"] == response_json["is_active"]
    assert staff_data["phone"] == response_json["phone"]
    assert staff_data["position_id"] == response_json["position_id"]


def test_delete_staff(client, auth_header):
    """Test delete staff"""
    staff = factory_staff_model()
    url = urljoin(API_BASE_URL, f"staffs/{staff.id}")
    response = client.delete(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Staff successfully deleted"
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_staff(client, auth_header):
    """Test update staff"""
    staff = factory_staff_model()

    staff_data = TestStaffInfo.staff1.value
    updated_data = TestStaffInfo.update_staff.value
    staff_data.update(updated_data)
    url = urljoin(API_BASE_URL, f"staffs/{staff.id}")
    response = client.put(url, headers=auth_header, json=staff_data)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == staff.id
    assert staff_data["email"] == response_json["email"]
    assert staff_data["first_name"] == response_json["first_name"]
    assert staff_data["last_name"] == response_json["last_name"]
    assert staff_data["is_active"] == response_json["is_active"]
    assert staff_data["phone"] == response_json["phone"]
    assert staff_data["position_id"] == response_json["position_id"]


def test_validate_staff(client, auth_header):
    """Test validate staff"""
    url = urljoin(API_BASE_URL, "staffs/exists")

    # Scenario 1: Updating an existing staff
    staff = factory_staff_model()
    payload = {"email": staff.email, "staff_id": staff.id}
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]

    # Scenario 2: Creating new staff with existing name
    del payload["staff_id"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.json["exists"]

    # Scenario 3: Creating new staff with new name
    payload = TestStaffInfo.validate_staff.value
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]


def test_get_staff_by_email(client, auth_header):
    """Test get staff by email."""
    staff = factory_staff_model()
    url = urljoin(API_BASE_URL, f"staffs/{staff.email}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert staff.email == response_json["email"]
    assert staff.first_name == response_json["first_name"]
    assert staff.last_name == response_json["last_name"]
    assert staff.full_name == response_json["full_name"]
    assert staff.is_active == response_json["is_active"]
    assert staff.phone == response_json["phone"]
    assert staff.position_id == response_json["position_id"]


def test_import_staff(client, auth_header):
    """Test import staff"""
    url = urljoin(API_BASE_URL, "staffs/import")
    file_path = Path("./src/api/templates/master_templates/Staffs.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="Staffs.xlsx",
    )
    response = client.post(
        url,
        data={"file": file},
        content_type="multipart/form-data",
        headers=auth_header
    )
    assert response.status_code == HTTPStatus.CREATED
