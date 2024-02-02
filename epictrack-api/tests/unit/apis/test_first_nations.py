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

"""Test suite for First nations."""
from copy import copy
from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from tests.utilities.factory_scenarios import TestFirstNation
from tests.utilities.factory_utils import factory_first_nation_model, factory_pip_org_type_model, factory_staff_model


API_BASE_URL = "/api/v1/"


def test_get_first_nations(client, auth_header):
    """Test get first nations."""
    url = urljoin(API_BASE_URL, "indigenous-nations")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_first_nation(client, auth_header):
    """Test create new first nation."""
    url = urljoin(API_BASE_URL, "indigenous-nations")
    payload = copy(TestFirstNation.first_nation1.value)
    relationship_holder = factory_staff_model()
    pip_org_type = factory_pip_org_type_model()
    payload["relationship_holder_id"] = relationship_holder.id
    payload["pip_org_type_id"] = pip_org_type.id

    # Scenario 1: Valid payload.
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response_json
    assert payload["relationship_holder_id"] == response_json["relationship_holder_id"]
    assert payload["name"] == response_json["name"]
    assert payload["is_active"] == response_json["is_active"]
    assert payload["pip_org_type_id"] == response_json["pip_org_type_id"]
    assert payload["pip_link"] == response_json["pip_link"]
    assert payload["notes"] == response_json["notes"]

    # Scenario 2: Missing required fields
    del payload["name"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_validate_first_nation(client, auth_header):
    """Test validate first nation"""
    url = urljoin(API_BASE_URL, "indigenous-nations/exists")

    # Scenario 1: Updating an existing first nation
    first_nation = factory_first_nation_model()
    payload = {"name": first_nation.name, "indigenous_nation_id": first_nation.id}
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]

    # Scenario 2: Creating new first nation with existing name
    del payload["indigenous_nation_id"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.json["exists"]

    # Scenario 3: Creating new first nation with new name
    payload = {}
    payload["name"] = TestFirstNation.first_nation2.value["name"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]


def test_get_first_nation_details(client, auth_header):
    """Test get first nation"""
    first_nation = factory_first_nation_model()
    url = urljoin(API_BASE_URL, f"indigenous-nations/{first_nation.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == first_nation.id
    assert first_nation.relationship_holder_id == response_json["relationship_holder_id"]
    assert first_nation.name == response_json["name"]
    assert first_nation.is_active == response_json["is_active"]
    assert first_nation.pip_org_type_id == response_json["pip_org_type_id"]
    assert first_nation.pip_link == response_json["pip_link"]
    assert first_nation.notes == response_json["notes"]


def test_update_first_nation(client, auth_header):
    """Test update first nation"""
    first_nation = factory_first_nation_model()
    relationship_holder = factory_staff_model()
    pip_org_type = factory_pip_org_type_model()

    updated_data = TestFirstNation.first_nation2.value
    updated_data["relationship_holder_id"] = relationship_holder.id
    updated_data["pip_org_type_id"] = pip_org_type.id

    url = urljoin(API_BASE_URL, f"indigenous-nations/{first_nation.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == first_nation.id
    assert updated_data["relationship_holder_id"] == response_json["relationship_holder_id"]
    assert updated_data["name"] == response_json["name"]
    assert updated_data["is_active"] == response_json["is_active"]
    assert updated_data["pip_org_type_id"] == response_json["pip_org_type_id"]
    assert updated_data["pip_link"] == response_json["pip_link"]
    assert updated_data["notes"] == response_json["notes"]


def test_delete_first_nation(client, auth_header):
    """Test delete first nation"""
    first_nation = factory_first_nation_model()
    url = urljoin(API_BASE_URL, f"indigenous-nations/{first_nation.id}")
    response = client.delete(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Indigenous nation successfully deleted"

    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_import_first_nation(client, auth_header):
    """Test import first nation"""
    url = urljoin(API_BASE_URL, "indigenous-nations/import")
    file_path = Path("./src/api/templates/master_templates/FirstNations.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="FirstNations.xlsx",
    )
    response = client.post(
        url,
        data={"file": file},
        content_type="multipart/form-data",
        headers=auth_header
    )
    assert response.status_code == HTTPStatus.CREATED
