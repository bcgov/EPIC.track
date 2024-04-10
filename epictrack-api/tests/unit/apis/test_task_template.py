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
"""Test suite for task template."""

from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from tests.utilities.factory_scenarios import TestTaskTemplateEnum
from tests.utilities.factory_utils import factory_task_template_model


API_BASE_URL = "/api/v1/"


def test_get_task_templates(client, auth_header):
    """Test get task templates."""
    url = urljoin(API_BASE_URL, "task-templates")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK


def test_create_task_template(client, auth_header):
    """Test create task template"""
    task_template_data = TestTaskTemplateEnum.task_template1.value
    file_path = Path("./src/api/templates/task_template/task_template.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="task_template.xlsx",
    )
    task_template_data["template_file"] = file

    url = urljoin(API_BASE_URL, "task-templates")
    response = client.post(url, data=task_template_data, headers=auth_header, content_type="multipart/form-data")
    assert response.status_code == HTTPStatus.CREATED
    response_json = response.json
    assert "id" in response_json
    assert task_template_data["name"] == response_json["name"]
    assert task_template_data["ea_act_id"] == response_json["ea_act_id"]
    assert task_template_data["work_type_id"] == response_json["work_type_id"]
    assert task_template_data["phase_id"] == response_json["phase_id"]


def test_get_template_tasks(client, auth_header):
    """Test get tasks by template id"""
    # Create task template
    task_template_data = TestTaskTemplateEnum.task_template1.value
    file_path = Path("./src/api/templates/task_template/task_template.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="task_template.xlsx",
    )
    task_template_data["template_file"] = file

    url = urljoin(API_BASE_URL, "task-templates")
    response = client.post(url, data=task_template_data, headers=auth_header, content_type="multipart/form-data")
    assert response.status_code == HTTPStatus.CREATED

    # Get tasks
    url = urljoin(API_BASE_URL, f"task-templates/{response.json['id']}/tasks")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) > 0


def test_get_task_template_details(client, auth_header):
    """Test get task template details"""
    task_template = factory_task_template_model()
    url = urljoin(API_BASE_URL, f"task-templates/{task_template.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert task_template.id == response_json["id"]
    assert task_template.name == response_json["name"]
    assert task_template.ea_act_id == response_json["ea_act_id"]
    assert task_template.work_type_id == response_json["work_type_id"]
    assert task_template.is_active == response_json["is_active"]
    assert task_template.phase_id == response_json["phase_id"]


def test_patch_task_template_details(client, auth_header):
    """Test patch task template details"""
    task_template = factory_task_template_model()
    data = {"is_active": True}
    url = urljoin(API_BASE_URL, f"task-templates/{task_template.id}")
    response = client.patch(url, json=data, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert task_template.id == response_json["id"]
    assert task_template.name == response_json["name"]
    assert task_template.ea_act_id == response_json["ea_act_id"]
    assert task_template.work_type_id == response_json["work_type_id"]
    assert response_json["is_active"]
    assert task_template.phase_id == response_json["phase_id"]


def test_delete_task_template(client, auth_header):
    """Test delete task template"""
    task_template = factory_task_template_model()
    url = urljoin(API_BASE_URL, f"task-templates/{task_template.id}")
    response = client.delete(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    assert response.text == "Task template successfully deleted"

    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND
