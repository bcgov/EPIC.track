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
"""Test suite for task."""

from copy import copy
from datetime import datetime
from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from werkzeug.datastructures import FileStorage

from api.utils.constants import CANADA_TIMEZONE
from tests.utilities.factory_scenarios import TestTaskEnum, TestTaskTemplateEnum
from tests.utilities.factory_utils import (
    factory_staff_model, factory_staff_work_role_model, factory_task_model, factory_work_model,
    factory_work_phase_model)


API_BASE_URL = "/api/v1/"


def test_get_tasks(client, auth_header):
    """Test get tasks."""
    work_phase = factory_work_phase_model()

    # Get tasks for the work phase
    url = urljoin(API_BASE_URL, f"tasks/events?work_phase_id={work_phase.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK


def test_create_task(client, auth_header):
    """Test create task"""
    work_phase = factory_work_phase_model()
    task_data = TestTaskEnum.task1.value
    task_data["work_phase_id"] = work_phase.id

    url = urljoin(API_BASE_URL, "tasks/events")
    response = client.post(url, json=task_data, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED
    response_json = response.json
    responsibility_ids_response = [
        x["responsibility_id"] for x in response.json["responsibilities"]
    ]
    assert "id" in response_json
    assert task_data["name"] == response_json["name"]
    assert task_data["work_phase_id"] == response_json["work_phase_id"]
    assert task_data["status"] == response_json["status"]
    assert task_data["responsibility_ids"] == responsibility_ids_response
    start_date = datetime.fromisoformat(response_json["start_date"])
    start_date = start_date.astimezone(CANADA_TIMEZONE)
    value = datetime.fromisoformat(task_data["start_date"])
    assert value.date() == start_date.date()


def test_get_task_details(client, auth_header):
    """Test get tasks by id"""
    task = factory_task_model()
    # Get tasks
    url = urljoin(API_BASE_URL, f"tasks/events/{task.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    response_json = response.json
    assert task.name == response_json["name"]
    assert task.work_phase_id == response_json["work_phase_id"]
    assert task.status.value == response_json["status"]
    start_date = datetime.fromisoformat(response_json["start_date"])
    start_date = start_date.astimezone(CANADA_TIMEZONE)
    task_start_date = task.start_date.astimezone(CANADA_TIMEZONE)
    assert task_start_date.date() == start_date.date()


def test_bulk_update_tasks(client, auth_header):
    """Test bulk update tasks"""
    work = factory_work_model()
    task1 = factory_task_model(work_id=work.id)
    task2 = factory_task_model(work_id=work.id)
    responsibility_ids = TestTaskEnum.task1.value["responsibility_ids"]
    assignee = factory_staff_model()
    status = TestTaskEnum.task1.value["status"]
    payload = {
        "task_ids": [task1.id, task2.id],
        "responsibility_ids": responsibility_ids,
        "assignee_ids": [assignee.id],
        "status": status,
    }
    url = urljoin(API_BASE_URL, "tasks/events")
    response = client.patch(url, json=payload, headers=auth_header)
    assert response.status_code == HTTPStatus.OK


def test_bulk_delete_tasks(client, auth_header):
    """Test bulk delete tasks"""
    work = factory_work_model()
    task1 = factory_task_model(work_id=work.id)
    task2 = factory_task_model(work_id=work.id)
    url = urljoin(API_BASE_URL, "tasks/events")

    query = {"task_ids": f"{task1.id},{task2.id}", "work_id": work.id}
    response = client.delete(url, query_string=query, headers=auth_header)
    assert response.status_code == HTTPStatus.OK

    url = urljoin(API_BASE_URL, f"tasks/events/{task1.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND

    url = urljoin(API_BASE_URL, f"tasks/events/{task2.id}")
    response = client.get(url, headers=auth_header)
    assert response.status_code == HTTPStatus.NOT_FOUND


def test_update_task(client, auth_header):
    """Test update task"""
    work = factory_work_model()
    task = factory_task_model(work_id=work.id)
    work_staff = factory_staff_work_role_model(work_id=work.id)
    assignee = work_staff.staff

    updated_data = copy(TestTaskEnum.task1.value)
    updated_data.update(
        {
            "name": "New Task Name",
            "assignee_ids": [assignee.id],
        }
    )
    url = urljoin(API_BASE_URL, f"tasks/events/{task.id}")
    response = client.put(url, headers=auth_header, json=updated_data)
    response_json = response.json

    assert response.status_code == HTTPStatus.OK
    assert response_json["id"] == task.id
    assert response_json["name"] == updated_data["name"]
    assignee_ids_response = [x["assignee_id"] for x in response_json["assignees"]]
    assert assignee.id in assignee_ids_response


def test_import_template_tasks(client, auth_header):
    """Test import template task events"""
    # Create a valid template with tasks.
    task_template_data = TestTaskTemplateEnum.task_template1.value
    file_path = Path("./src/api/templates/task_template/task_template.xlsx")
    file_path = file_path.resolve()
    file = FileStorage(
        stream=open(file_path, "rb"),
        filename="task_template.xlsx",
    )
    task_template_data["template_file"] = file

    url = urljoin(API_BASE_URL, "task-templates")
    template_response = client.post(
        url,
        data=task_template_data,
        headers=auth_header,
        content_type="multipart/form-data",
    )
    assert template_response.status_code == HTTPStatus.CREATED

    # Mark the template as active
    data = {"is_active": True}
    url = urljoin(API_BASE_URL, f"task-templates/{template_response.json['id']}")
    response = client.patch(url, json=data, headers=auth_header)
    assert response.status_code == HTTPStatus.OK

    work_phase = factory_work_phase_model()
    data = {"work_phase_id": work_phase.id}
    url = urljoin(
        API_BASE_URL, f"tasks/templates/{template_response.json['id']}/events"
    )
    response = client.post(url, json=data, headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED
    assert len(response.json) > 0
