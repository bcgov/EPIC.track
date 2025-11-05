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

from tests.utilities.factory_scenarios import TestWorkResourceInfo
from tests.utilities.factory_utils import factory_work_model


API_BASE_URL = "/api/v1/"
CREATE_URL = urljoin(API_BASE_URL, "work-resources")
GET_BY_WORK_ID_URL = urljoin(API_BASE_URL, "work-resources?work_id={work_id}")
UPDATE_AND_DELETE_URL = urljoin(API_BASE_URL, "work-resources/{work_resource_id}")


def test_create_work_resource(client, auth_header):
    """Test create new work resource."""
    # Arrange
    request_payload = TestWorkResourceInfo.work_resource1.value
    work = factory_work_model()
    request_payload['work_id'] = work.id
    # Act
    response = client.post(CREATE_URL, json=request_payload, headers=auth_header)
    # Assert
    assert response.status_code == HTTPStatus.CREATED
    assert response.json.get('work_id') == work.id


def test_get_work_resources_by_work_id(client, auth_header):
    """Test get work resources by work id."""
    # Arrange
    work = factory_work_model()
    request_payload1 = {**TestWorkResourceInfo.work_resource1.value, 'work_id': work.id}
    request_payload2 = {**TestWorkResourceInfo.work_resource2.value, 'work_id': work.id}
    client.post(CREATE_URL, json=request_payload1, headers=auth_header)
    client.post(CREATE_URL, json=request_payload2, headers=auth_header)
    # Act
    response = client.get(GET_BY_WORK_ID_URL.format(work_id=work.id), headers=auth_header)
    # Assert
    assert response.status_code == HTTPStatus.OK
    assert len(response.json) == 2
    assert response.json[0].get('work_id') == work.id


def test_update_work_resource(client, auth_header):
    """Test update work resource."""
    # Arrange
    updated_title = "Updated Title"
    updated_link = "Updated Link"
    work = factory_work_model()
    request_payload = {**TestWorkResourceInfo.work_resource1.value, 'work_id': work.id}
    create_response = client.post(CREATE_URL, json=request_payload, headers=auth_header)
    work_resource_id = create_response.json.get('id')
    update_payload = {'title': updated_title, 'link': updated_link}
    # Act
    response = client.put(UPDATE_AND_DELETE_URL.format(work_resource_id=work_resource_id), json=update_payload, headers=auth_header)
    # Assert
    assert response.status_code == HTTPStatus.OK
    assert response.json.get('title') == updated_title
    assert response.json.get('link') == updated_link
    # assert False


def test_delete_work_resource(client, auth_header):
    """Test delete work resource."""
    # Arrange
    work = factory_work_model()
    request_payload = {**TestWorkResourceInfo.work_resource1.value, 'work_id': work.id}
    create_response = client.post(CREATE_URL, json=request_payload, headers=auth_header)
    work_resource_id = create_response.json.get('id')
    # Act
    response = client.delete(UPDATE_AND_DELETE_URL.format(work_resource_id=work_resource_id), headers=auth_header)
    # Assert
    assert response.status_code == HTTPStatus.NO_CONTENT
    get_response = client.get(GET_BY_WORK_ID_URL.format(work_id=work.id), headers=auth_header)
    assert get_response.status_code == HTTPStatus.OK
    assert len(get_response.json) == 0


def test_only_get_work_resources_by_work_id(client, auth_header):
    """Test get work resources by work id."""
    # Arrange
    work1 = factory_work_model()
    work2 = factory_work_model()
    request_payload1 = {**TestWorkResourceInfo.work_resource1.value, 'work_id': work1.id}
    request_payload2 = {**TestWorkResourceInfo.work_resource2.value, 'work_id': work2.id}
    client.post(CREATE_URL, json=request_payload1, headers=auth_header)
    client.post(CREATE_URL, json=request_payload2, headers=auth_header)
    # Act
    response = client.get(GET_BY_WORK_ID_URL.format(work_id=work1.id), headers=auth_header)
    # Assert
    assert response.status_code == HTTPStatus.OK
    assert len(response.json) == 1
    assert response.json[0].get('work_id') == work1.id


def test_unauthorized_access(client):
    """Test unauthorized access."""
    # Arrange
    work = factory_work_model()
    request_payload = {**TestWorkResourceInfo.work_resource1.value, 'work_id': work.id}
    create_response = client.post(CREATE_URL, json=request_payload)
    work_resource_id = create_response.json.get('id')
    # Act
    get_response = client.get(GET_BY_WORK_ID_URL.format(work_id=work.id))
    update_response = client.put(UPDATE_AND_DELETE_URL.format(work_resource_id=work_resource_id), json={'title': 'New Title'})
    delete_response = client.delete(UPDATE_AND_DELETE_URL.format(work_resource_id=work_resource_id))
    # Assert
    assert get_response.status_code == HTTPStatus.UNAUTHORIZED
    assert update_response.status_code == HTTPStatus.UNAUTHORIZED
    assert delete_response.status_code == HTTPStatus.UNAUTHORIZED
