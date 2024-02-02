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

"""Test suite for Proponents."""
from copy import copy
from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from tests.utilities.factory_scenarios import TestProponent
from tests.utilities.factory_utils import factory_proponent_model, factory_staff_model


API_BASE_URL = "/api/v1/"


def test_get_proponents(client, auth_header):
    """Test get proponents."""
    url = urljoin(API_BASE_URL, "proponents")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_proponent(client, auth_header):
    """Test create new proponent."""
    url = urljoin(API_BASE_URL, "proponents")
    payload = copy(TestProponent.proponent1.value)
    relationship_holder = factory_staff_model()
    payload["relationship_holder_id"] = relationship_holder.id

    # Scenario 1: Valid payload
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response_json
    assert payload["relationship_holder_id"] == response_json["relationship_holder_id"]
    assert payload["name"] == response_json["name"]
    assert response_json["is_active"]

    # Scenario 2: Missing required fields
    del payload["name"]
    response = client.post(url, json=payload, headers=auth_header)
    response_json = response.json
    assert response.status_code == HTTPStatus.BAD_REQUEST


def test_validate_proponent(client, auth_header):
    """Test validate proponent"""
    url = urljoin(API_BASE_URL, "proponents/exists")

    # Scenario 1: Updating an existing proponent
    proponent = factory_proponent_model()
    payload = {"name": proponent.name, "proponent_id": proponent.id}
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]

    # Scenario 2: Creating new proponent with existing name
    del payload["proponent_id"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.json["exists"]

    # Scenario 3: Creating new proponent with new name
    payload = TestProponent.proponent2.value
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]


def test_get_proponent_details(client, auth_header):
    """Test get proponent"""
    proponent = factory_proponent_model()
    url = urljoin(API_BASE_URL, f"proponents/{proponent.id}")
    response = client.get(url, headers=auth_header)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == proponent.id
    assert response_json["name"] == proponent.name
    assert response_json["relationship_holder_id"] == proponent.relationship_holder_id


def test_update_proponent(client, auth_header):
    """Test update proponent"""
    proponent = factory_proponent_model()
    relationship_holder = factory_staff_model()

    updated_data = {
        "name": "New Proponent Name",
        "relationship_holder_id": relationship_holder.id,
    }
    url = urljoin(API_BASE_URL, f"proponents/{proponent.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == proponent.id
    assert response_json["name"] == updated_data["name"]
    assert (
        response_json["relationship_holder_id"]
        == updated_data["relationship_holder_id"]
    )


def test_delete_proponent(client, auth_header):
    """Test delete proponent"""
    proponent = factory_proponent_model()
    url = urljoin(API_BASE_URL, f"proponents/{proponent.id}")
    response = client.delete(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Proponent successfully deleted"

    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_import_proponent(client, auth_header):
    """Test import proponent"""
    url = urljoin(API_BASE_URL, "proponents/import")
    file_path = Path("./src/api/templates/master_templates/Proponents.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="Proponents.xlsx",
    )
    response = client.post(
        url,
        data={"file": file},
        content_type="multipart/form-data",
        headers=auth_header
    )
    assert response.status_code == HTTPStatus.CREATED
