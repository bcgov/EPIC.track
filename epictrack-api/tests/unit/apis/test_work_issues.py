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

from faker import Faker

from tests.utilities.factory_scenarios import (TestIssues, TestWorkIssuesInfo,
                                               TestWorkIssueUpdatesInfo, TestJwtClaims)
from tests.utilities.factory_utils import factory_work_model, factory_work_issues_model, \
    factory_work_issue_updates_model, factory_auth_header

API_BASE_URL = "/api/v1/"

fake = Faker()


def test_get_empty_work(client, auth_header):
    """Test get empty project."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_work(client, auth_header):
    """Test create new project."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    issue_data = TestIssues.issue2.value
    result = client.post(url, json=issue_data, headers=auth_header)

    assert result.status_code == HTTPStatus.CREATED
    result_json = result.json
    assert "id" in result.json
    assert result_json.get('work_id') == work.id

    result_get = client.get(url, headers=auth_header)
    assert result_get.status_code == HTTPStatus.OK
    assert len(result_get.json) == 1, 'only one issue got created'
    retrieved_issue_json = result_get.json[0]

    assert "id" in result_json
    assert retrieved_issue_json["work_id"] == work.id
    assert issue_data['title'] == retrieved_issue_json["title"]

    created_updates = result_json.get('updates')[0]
    assert created_updates["description"] == issue_data.get("updates")[0]
    assert created_updates["work_issue_id"] == result_json["id"]


def test_create_and_fetch_work_issues(client, auth_header):
    """Test create and fetch WorkIssues with updates."""
    work = factory_work_model()
    issue_data = TestWorkIssuesInfo.issue1.value
    update_data = TestWorkIssueUpdatesInfo.update1.value

    work_issue = factory_work_issues_model(work.id, issue_data)
    factory_work_issue_updates_model(work_issue.id, update_data)

    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    result_get = client.get(url, headers=auth_header)
    retrieved_issue_json = result_get.json[0]
    assert "id" in retrieved_issue_json
    assert retrieved_issue_json["work_id"] == work.id
    assert retrieved_issue_json["title"] == work_issue.title


def test_create_and_update_work_issues(client, auth_header):
    """Test create and update WorkIssues with updates."""
    work = factory_work_model()
    issue_data = {
        **TestWorkIssuesInfo.issue1.value,
        'start_date': fake.date_time().isoformat()
    }
    update_data = {
        **TestWorkIssueUpdatesInfo.update1.value,
        'posted_date': issue_data.get('start_date'),
    }
    work_issue = factory_work_issues_model(work.id, issue_data)

    work_issue_update = factory_work_issue_updates_model(work_issue.id, update_data)
    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    result_get = client.get(url, headers=auth_header)
    assert work_issue_update.description == result_get.json[0].get('updates')[0]['description']

    updates_id = result_get.json[0].get('updates')[0]['id']
    new_description = fake.sentence()
    updated_update_data = {
        "id": work_issue_update.id,
        "description": new_description,
        "posted_date": update_data.get('posted_date')
    }

    url_update = urljoin(API_BASE_URL, f'work/{work.id}/issues/{work_issue.id}/update/{updates_id}')
    result_update = client.patch(url_update, headers=auth_header, json=updated_update_data)
    assert result_update.status_code == HTTPStatus.OK

    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    result_get = client.get(url, headers=auth_header)
    assert new_description == result_get.json[0].get('updates')[0]['description']


def test_approve_work_issue_update(client, jwt):
    """Test approve work issue description update."""
    work = factory_work_model()
    issue_data = TestWorkIssuesInfo.issue1.value
    update_data = TestWorkIssueUpdatesInfo.update1.value

    work_issue = factory_work_issues_model(work.id, issue_data)
    work_issue_update = factory_work_issue_updates_model(work_issue.id, update_data)

    # Assert that the initial state is not approved and approved_by is null
    assert not work_issue_update.is_approved
    assert work_issue_update.approved_by is None

    staff_user = TestJwtClaims.staff_admin_role
    user_name = staff_user['preferred_username']
    headers = factory_auth_header(jwt=jwt, claims=staff_user)
    url_approve = urljoin(API_BASE_URL, f'work/{work.id}/issues/{work_issue.id}/update/{work_issue_update.id}/approve')

    result_approve = client.patch(url_approve, headers=headers)

    assert result_approve.status_code == HTTPStatus.OK

    url = urljoin(API_BASE_URL, f'work/{work.id}/issues')
    result_get = client.get(url, headers=headers)

    # Assert that the WorkIssueUpdate is now approved and approved_by is set
    updated_update = result_get.json[0].get('updates')[0]
    assert updated_update["is_approved"]
    assert updated_update["approved_by"] == user_name
