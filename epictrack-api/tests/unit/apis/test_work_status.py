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
"""Test suite for Work Status."""

from http import HTTPStatus
from urllib.parse import urljoin

from faker import Faker
from flask import g

from tests.utilities.factory_scenarios import TestJwtClaims, TestStatus
from tests.utilities.factory_utils import factory_auth_header, factory_work_model, factory_work_status_model


API_BASE_URL = "/api/v1/"

fake = Faker()


def test_get_empty_work(client, auth_header):
    """Test get empty project."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f'work/{work.id}/statuses')
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_and_fetch_work_status(client, jwt):
    """Test create and fetch WorkStatus."""
    work = factory_work_model()
    url_create_status = urljoin(API_BASE_URL, f'work/{work.id}/statuses')
    status_data = TestStatus.status1.value

    staff_user = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    g.token_info = staff_user
    result_create_status = client.post(url_create_status, headers=headers, json=status_data)
    assert result_create_status.status_code == HTTPStatus.CREATED
    result_json = result_create_status.json
    assert "id" in result_json
    assert result_json.get('work_id') == work.id

    # Fetch WorkStatus
    url_fetch_status = urljoin(API_BASE_URL, f'work/{work.id}/statuses')
    result_fetch_status = client.get(url_fetch_status, headers=headers)
    assert result_fetch_status.status_code == HTTPStatus.OK
    assert len(result_fetch_status.json) == 1, 'only one status got created'

    retrieved_status_json = result_fetch_status.json[0]

    assert "id" in retrieved_status_json
    assert retrieved_status_json["work_id"] == work.id
    assert status_data['description'] == retrieved_status_json["description"]
    assert staff_user['preferred_username'] == retrieved_status_json["posted_by"]

    assert not retrieved_status_json["is_approved"]
    assert retrieved_status_json["approved_by"] is None
    assert retrieved_status_json["approved_date"] is None


def test_approve_work_status(client, jwt):
    """Test approve work status."""
    work = factory_work_model()
    status_data = TestStatus.status1.value
    work_status = factory_work_status_model(work.id, status_data)

    # Assert that the initial state is not approved
    assert not work_status.is_approved

    # Approve the work status
    staff_user = TestJwtClaims.staff_admin_role
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    g.token_info = staff_user
    url_approve = urljoin(API_BASE_URL, f'work/{work.id}/statuses/{work_status.id}/approve')
    result_approve = client.patch(url_approve, headers=headers)

    assert result_approve.status_code == HTTPStatus.OK

    # Fetch the updated work status
    url_get = urljoin(API_BASE_URL, f'work/{work.id}/statuses')
    result_get = client.get(url_get, headers=headers)
    approved_work_status = result_get.json[0]
    # Assert that the WorkStatus is now approved and approved_by and approved_date are set
    assert approved_work_status["is_approved"]
    assert approved_work_status["approved_by"] == staff_user["preferred_username"]
    assert "approved_date" in approved_work_status


def test_update_work_status(client, auth_header):
    """Test update work status"""
    work = work = factory_work_model()
    status = factory_work_status_model(work_id=work.id)

    updated_data = {
        "description": "New status update description",
    }
    url = urljoin(API_BASE_URL, f'work/{work.id}/statuses/{status.id}')
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == status.id
    assert response_json["description"] == updated_data["description"]
    assert response_json["work_id"] == work.id
    assert not response_json["is_approved"]
    assert response_json["approved_by"] is None
    assert response_json["approved_date"] is None
