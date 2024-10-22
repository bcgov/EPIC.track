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
"""Test suite for projects."""

from decimal import Decimal
from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from tests.utilities.factory_scenarios import TestProjectInfo
from tests.utilities.factory_utils import factory_project_model


API_BASE_URL = "/api/v1/"


def test_create_project(client, auth_header):
    """Test create new project."""
    url = urljoin(API_BASE_URL, "projects")
    response = client.post(url, json=TestProjectInfo.project1.value, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED
    assert "id" in response.json


def test_get_projects(client, auth_header):
    """Test get projects."""
    url = urljoin(API_BASE_URL, "projects")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK


def test_update_project(client, auth_header):
    """Test update project."""
    project = factory_project_model()
    # Update the project
    payload = TestProjectInfo.project1.value
    payload["name"] = "New Project Updated"
    url = urljoin(API_BASE_URL, f'projects/{project.id}')
    response = client.put(url, json=payload, headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    assert response.json["name"] == "New Project Updated"


def test_delete_project(client, auth_header):
    """Test delete project."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, f'projects/{project.id}')
    client.delete(url, headers=auth_header)
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_project_detail(client, auth_header):
    """Test project details."""
    project_payload = TestProjectInfo.project1.value
    project = factory_project_model()
    url = urljoin(API_BASE_URL, f'projects/{project.id}')
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert "id" in response.json
    for key, expected_value in project_payload.items():
        response_value = response.json.get(key)
        assert response_value is not None, f"Key {key} not found in response"
        if isinstance(expected_value, Decimal):  # some of the values are decimal
            response_value = Decimal(response_value)
        assert expected_value == response_value, \
            f"Value mismatch for key {key}: expected {expected_value}, got {response_value}"


def test_import_project(client, auth_header):
    """Test import project"""
    url = urljoin(API_BASE_URL, "projects/import")
    file_path = Path("./src/api/templates/master_templates/Projects.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="projects.xlsx",
    )
    response = client.post(
        url,
        data={"file": file},
        content_type="multipart/form-data",
        headers=auth_header
    )
    assert response.status_code == HTTPStatus.CREATED


def test_validate_project(client, auth_header):
    """Test validate project"""
    url = urljoin(API_BASE_URL, "projects/exists")

    # Scenario 1: Updating an existing project
    project = factory_project_model()
    payload = {"name": project.name, "project_id": project.id}
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]

    # Scenario 2: Creating new project with existing name
    del payload["project_id"]
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.json["exists"]

    # Scenario 3: Creating new project with new name
    payload = TestProjectInfo.project2.value
    response = client.get(url, query_string=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert not response.json["exists"]
