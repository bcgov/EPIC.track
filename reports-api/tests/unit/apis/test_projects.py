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

from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = '/api/v1/'


def test_create_project(client):
    """Test create new project."""
    payload = {
        "name": "New Project",
        "description": "Testing the create project endpoint",
        "location": "Victoria, BC",
        "sub_sector_id": 1,
        "proponent_id": 1,
        "region_id_env": 1,
        "region_id_flnro": 1
    }
    url = urljoin(API_BASE_URL, 'projects')
    response = client.post(url, json=payload)
    assert response.status_code == HTTPStatus.CREATED
    assert 'id' in response.json


def test_get_projects(client):
    """Test get projects."""
    url = urljoin(API_BASE_URL, 'projects')
    response = client.get(url)
    assert response.status_code == HTTPStatus.OK
    assert 'projects' in response.json


def test_update_project(client):
    """Test update project."""
    payload = {
        "name": "New Project",
        "description": "Testing the create project endpoint",
        "location": "Victoria, BC",
        "sub_sector_id": 1,
        "proponent_id": 1,
        "region_id_env": 1,
        "region_id_flnro": 1
    }
    # Create a project
    url = urljoin(API_BASE_URL, 'projects')
    response = client.post(url, json=payload)
    # Update the project
    payload['name'] = 'New Project Updated'
    url = urljoin(API_BASE_URL, f'projects/{response.json["id"]}')
    response = client.put(url, json=payload)

    assert response.status_code == HTTPStatus.OK
    assert response.json['name'] == 'New Project Updated'


def test_delete_project(client):
    """Test delete project."""
    payload = {
        "name": "New Project",
        "description": "Testing the create project endpoint",
        "location": "Victoria, BC",
        "sub_sector_id": 1,
        "proponent_id": 1,
        "region_id_env": 1,
        "region_id_flnro": 1
    }
    # Create a project
    projects_url = urljoin(API_BASE_URL, 'projects')
    project = client.post(projects_url, json=payload)
    response = client.get(projects_url)
    assert len(response.json['projects']) == 1

    url = urljoin(API_BASE_URL, f'projects/{project.json["id"]}')
    client.delete(url)
    response = client.get(projects_url)
    assert len(response.json['projects']) == 0


def test_project_detail(client):
    """Test project details."""
    payload = {
        "name": "New Project",
        "description": "Testing the create project endpoint",
        "location": "Victoria, BC",
        "sub_sector_id": 1,
        "proponent_id": 1,
        "region_id_env": 1,
        "region_id_flnro": 1
    }
    # Create a project
    projects_url = urljoin(API_BASE_URL, 'projects')
    project = client.post(projects_url, json=payload)
    url = urljoin(API_BASE_URL, f'projects/{project.json["id"]}')
    response = client.get(url)
    assert response.status_code == HTTPStatus.OK
    assert 'id' in response.json
    for key, value in payload.items():
        assert value == response.json[key]
