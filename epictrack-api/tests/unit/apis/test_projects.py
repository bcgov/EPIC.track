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

from contextlib import contextmanager
from decimal import Decimal
from http import HTTPStatus
from pathlib import Path
from urllib.parse import urljoin

from sqlalchemy import event
from sqlalchemy.engine import Engine
from werkzeug.datastructures import FileStorage

from api.models.work import WorkStateEnum

from tests.utilities.factory_scenarios import TestProjectInfo
from tests.utilities.factory_utils import (
    factory_project_model,
    factory_staff_model,
    factory_staff_work_role_model,
    factory_work_model,
)


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


def _get_team_members(client, auth_header, query=None):
    """Call the team members endpoint and return the raw response."""
    url = urljoin(API_BASE_URL, "projects/team-members")
    return client.get(url, query_string=query, headers=auth_header)


@contextmanager
def _count_statements():
    """Count the SQL statements issued inside the block."""
    statements = []

    def record(conn, cursor, statement, parameters, context, executemany):  # pylint: disable=too-many-arguments,unused-argument
        statements.append(statement)

    event.listen(Engine, "before_cursor_execute", record)
    try:
        yield statements
    finally:
        event.remove(Engine, "before_cursor_execute", record)


def _staff_by_id(teams, project_id):
    """Return the staff of one project keyed by staff id."""
    team = next(entry for entry in teams if entry["project_id"] == project_id)
    return {member["staff_id"]: member for member in team["staff"]}


def test_project_team_members_unions_works(client, auth_header):
    """A staff member on two works of one project is listed once with both work ids."""
    work_a = factory_work_model()
    work_b = factory_work_model()
    assert work_a.project_id == work_b.project_id
    shared_staff = factory_staff_model()
    factory_staff_work_role_model(work_id=work_a.id, staff_id=shared_staff.id)
    factory_staff_work_role_model(work_id=work_b.id, staff_id=shared_staff.id)

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    staff = _staff_by_id(response.json, work_a.project_id)
    assert set(staff) == {
        shared_staff.id,
        work_a.work_lead_id,
        work_a.responsible_epd_id,
        work_b.work_lead_id,
        work_b.responsible_epd_id,
    }
    assert staff[shared_staff.id]["work_ids"] == [work_a.id, work_b.id]
    assert staff[shared_staff.id]["roles"] == ["Officer / Analyst"]
    assert staff[shared_staff.id]["email"] == shared_staff.email
    assert staff[work_a.work_lead_id]["roles"] == ["Work Lead"]
    assert staff[work_a.work_lead_id]["work_ids"] == [work_a.id]
    assert staff[work_a.responsible_epd_id]["roles"] == ["Responsible EPD"]


def test_project_team_members_excludes_departed_staff(client, auth_header):
    """Departed staff drop out whether assigned a role or named as work lead."""
    work = factory_work_model()
    departed_member = factory_staff_model()
    factory_staff_work_role_model(work_id=work.id, staff_id=departed_member.id)
    departed_member.is_active = False
    departed_member.save()
    work.work_lead.is_active = False
    work.work_lead.save()

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    staff = _staff_by_id(response.json, work.project_id)
    assert set(staff) == {work.responsible_epd_id}


def test_project_team_members_includes_closed_work(client, auth_header):
    """A closed work still contributes its team members."""
    work = factory_work_model()
    work.work_state = WorkStateEnum.CLOSED
    work.save()
    staff_member = factory_staff_model()
    factory_staff_work_role_model(work_id=work.id, staff_id=staff_member.id)

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    staff = _staff_by_id(response.json, work.project_id)
    assert set(staff) == {
        staff_member.id,
        work.work_lead_id,
        work.responsible_epd_id,
    }
    assert staff[staff_member.id]["work_ids"] == [work.id]


def test_project_team_members_excludes_deleted_work(client, auth_header):
    """A deleted work contributes nobody, not even its work lead."""
    work_kept = factory_work_model()
    work_deleted = factory_work_model()
    kept_staff = factory_staff_model()
    dropped_staff = factory_staff_model()
    factory_staff_work_role_model(work_id=work_kept.id, staff_id=kept_staff.id)
    factory_staff_work_role_model(work_id=work_deleted.id, staff_id=dropped_staff.id)
    work_deleted.is_deleted = True
    work_deleted.save()

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    staff = _staff_by_id(response.json, work_kept.project_id)
    assert set(staff) == {
        kept_staff.id,
        work_kept.work_lead_id,
        work_kept.responsible_epd_id,
    }


def test_project_team_members_filtered_by_project(client, auth_header):
    """project_id narrows the response to that one project."""
    work_first = factory_work_model()
    second_project = factory_project_model(
        {
            **TestProjectInfo.project1.value,
            "name": "Second team members project",
            "abbreviation": "SECOND",
        }
    )
    work_second = factory_work_model()
    work_second.project_id = second_project.id
    work_second.save()

    all_teams = _get_team_members(client, auth_header)
    filtered = _get_team_members(
        client, auth_header, {"project_id": second_project.id}
    )

    assert all_teams.status_code == HTTPStatus.OK
    assert {entry["project_id"] for entry in all_teams.json} == {
        work_first.project_id,
        second_project.id,
    }
    assert filtered.status_code == HTTPStatus.OK
    assert len(filtered.json) == 1
    assert filtered.json[0]["project_id"] == second_project.id
    assert {member["staff_id"] for member in filtered.json[0]["staff"]} == {
        work_second.work_lead_id,
        work_second.responsible_epd_id,
    }


def test_project_team_members_excludes_deleted_project(client, auth_header):
    """A soft deleted project drops out even though its work is live."""
    work = factory_work_model()
    project = work.project
    project.is_deleted = True
    project.save()

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    assert project.id not in {entry["project_id"] for entry in response.json}


def test_project_team_members_excludes_deleted_staff(client, auth_header):
    """A soft deleted staff member drops out even while still marked active."""
    work = factory_work_model()
    work.work_lead.is_deleted = True
    work.work_lead.save()
    assert work.work_lead.is_active is True

    response = _get_team_members(client, auth_header)

    assert response.status_code == HTTPStatus.OK
    staff = _staff_by_id(response.json, work.project_id)
    assert set(staff) == {work.responsible_epd_id}


def test_project_team_members_rejects_bad_project_id(client, auth_header):
    """A project_id that is not a positive integer is rejected."""
    assert (
        _get_team_members(client, auth_header, {"project_id": "abc"}).status_code
        == HTTPStatus.BAD_REQUEST
    )
    assert (
        _get_team_members(client, auth_header, {"project_id": "0"}).status_code
        == HTTPStatus.BAD_REQUEST
    )


def test_project_team_members_query_count_does_not_grow_with_works(client, auth_header):
    """The endpoint issues the same number of statements for one work as for three."""
    work = factory_work_model()
    factory_staff_work_role_model(work_id=work.id)
    query = {"project_id": work.project_id}

    with _count_statements() as one_work_statements:
        one_work = _get_team_members(client, auth_header, query)

    for _ in range(2):
        extra_work = factory_work_model()
        factory_staff_work_role_model(work_id=extra_work.id)

    with _count_statements() as three_work_statements:
        three_works = _get_team_members(client, auth_header, query)

    assert one_work.status_code == HTTPStatus.OK
    assert three_works.status_code == HTTPStatus.OK
    assert len(_staff_by_id(three_works.json, work.project_id)) > len(
        _staff_by_id(one_work.json, work.project_id)
    )
    assert len(three_work_statements) == len(one_work_statements)
    assert len(three_work_statements) <= 2  # the works query and the staff query


def test_project_team_members_requires_token(client):
    """The endpoint rejects an unauthenticated caller."""
    response = client.get(urljoin(API_BASE_URL, "projects/team-members"))
    assert response.status_code == HTTPStatus.UNAUTHORIZED
