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

from api.models.event import Event
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.outcome_configuration import OutcomeConfiguration
from api.models.work import WorkStateEnum

from tests.utilities.factory_scenarios import TestProjectInfo
from tests.utilities.factory_utils import (
    factory_project_model,
    factory_staff_model,
    factory_staff_work_role_model,
    factory_work_model,
)
from tests.utilities.helpers import prepare_work_payload


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


PROJECT_SUMMARY_FIELDS = {
    "id", "name", "description", "latitude", "longitude", "ea_certificate", "epic_guid",
    "type", "proponent", "region_env", "has_works_in_progress",
}
WORK_SUMMARY_FIELDS = {
    "id", "title", "simple_title", "work_type", "work_state", "current_work_phase", "start_date",
    "decision_date", "work_decision_date", "report_description", "epic_description", "decision",
}


def _other_project(name):
    return factory_project_model(
        {**TestProjectInfo.project1.value, "name": name, "abbreviation": name.upper()[:10]}
    )


def _project_summaries(client, auth_header):
    response = client.get(urljoin(API_BASE_URL, "projects/summary"), headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    return {project["id"]: project for project in response.json}


def _work_summaries(client, auth_header, project_id):
    response = client.get(urljoin(API_BASE_URL, f"projects/{project_id}/works/summary"), headers=auth_header)
    assert response.status_code == HTTPStatus.OK
    return response.json


def test_project_summaries_carry_only_the_summary_fields(client, auth_header):
    """A summary names the project's type, proponent and region and leaves out the rest."""
    project = factory_project_model()

    summary = _project_summaries(client, auth_header)[project.id]

    assert set(summary) == PROJECT_SUMMARY_FIELDS
    assert summary["name"] == project.name
    assert summary["type"] == {"id": project.type_id, "name": project.type.name}
    assert summary["proponent"] == {"id": project.proponent_id, "name": project.proponent.name}
    assert summary["region_env"] == {"id": project.region_id_env, "name": project.region_env.name}
    assert summary["has_works_in_progress"] is False


def test_project_summaries_leave_out_inactive_and_deleted_projects(client, auth_header):
    """Only active projects are summarised."""
    active = factory_project_model()
    inactive = _other_project("Inactive summary")
    inactive.is_active = False
    inactive.save()
    deleted = _other_project("Deleted summary")
    deleted.is_deleted = True
    deleted.save()

    summaries = _project_summaries(client, auth_header)

    assert active.id in summaries
    assert inactive.id not in summaries
    assert deleted.id not in summaries


def test_an_inactive_work_in_progress_marks_its_project(client, auth_header):
    """is_active says whether Track still lists a work, not whether it is under way."""
    work = factory_work_model()
    work.is_active = False
    work.save()

    assert _project_summaries(client, auth_header)[work.project_id]["has_works_in_progress"] is True


def test_only_a_live_work_in_progress_marks_its_project(client, auth_header):
    """A completed work, or a deleted one in progress, leaves its project unmarked."""
    completed = factory_work_model()
    completed.work_state = WorkStateEnum.COMPLETED
    completed.save()
    deleted = factory_work_model()
    deleted.is_deleted = True
    deleted.save()

    assert _project_summaries(client, auth_header)[completed.project_id]["has_works_in_progress"] is False


def test_project_work_summaries_carry_only_the_summary_fields(client, auth_header):
    """A work summary leaves out the work's staff, team and ministry."""
    work = factory_work_model()

    [summary] = _work_summaries(client, auth_header, work.project_id)

    assert set(summary) == WORK_SUMMARY_FIELDS
    assert summary["id"] == work.id
    assert summary["title"] == work.title
    assert summary["work_state"] == WorkStateEnum.IN_PROGRESS.value
    assert summary["work_type"] == {"id": work.work_type_id, "name": work.work_type.name}
    assert summary["decision"] is None


def test_project_work_summaries_leave_out_deleted_works_and_other_projects(client, auth_header):
    """Only the project's own works that are not deleted are summarised."""
    kept = factory_work_model()
    deleted = factory_work_model()
    deleted.is_deleted = True
    deleted.save()
    elsewhere = factory_work_model()
    elsewhere.project_id = _other_project("Elsewhere summary").id
    elsewhere.save()

    summaries = _work_summaries(client, auth_header, kept.project_id)

    assert [summary["id"] for summary in summaries] == [kept.id]


def test_project_work_summaries_carry_the_latest_decision(client, auth_header, session):
    """A work's summary names the outcome of its completed decision milestone."""
    response = client.post(urljoin(API_BASE_URL, "works"), json=prepare_work_payload(), headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED
    work_id = response.json["id"]
    decision_event, outcome = (
        session.query(Event, OutcomeConfiguration)
        .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
        .join(OutcomeConfiguration, OutcomeConfiguration.event_configuration_id == EventConfiguration.id)
        .filter(Event.work_id == work_id, EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value)
        .first()
    )
    decision_event.actual_date = decision_event.anticipated_date
    decision_event.outcome_id = outcome.id
    session.commit()

    summaries = _work_summaries(client, auth_header, response.json["project_id"])

    assert {summary["id"]: summary["decision"] for summary in summaries}[work_id] == outcome.name


def test_project_work_summaries_of_a_project_without_works_are_empty(client, auth_header):
    """A project with no works is found, and has none."""
    project = factory_project_model()

    assert _work_summaries(client, auth_header, project.id) == []


def test_project_work_summaries_of_an_inactive_project_are_listed(client, auth_header):
    """An inactive project still exists, as it does for the project read by id."""
    work = factory_work_model()
    work.project.is_active = False
    work.project.save()

    assert [summary["id"] for summary in _work_summaries(client, auth_header, work.project_id)] == [work.id]


def test_project_work_summaries_of_an_unknown_project_are_not_found(client, auth_header):
    """An id with no project behind it is a 404, not an empty list."""
    response = client.get(urljoin(API_BASE_URL, "projects/999999/works/summary"), headers=auth_header)

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_project_work_summaries_of_a_deleted_project_are_not_found(client, auth_header):
    """A deleted project is not found, as it is for the project read by id."""
    work = factory_work_model()
    work.project.is_deleted = True
    work.project.save()

    response = client.get(urljoin(API_BASE_URL, f"projects/{work.project_id}/works/summary"), headers=auth_header)

    assert response.status_code == HTTPStatus.NOT_FOUND
