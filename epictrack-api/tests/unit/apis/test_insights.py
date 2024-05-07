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
"""Test suite for Insights."""

from http import HTTPStatus
from urllib.parse import urljoin

from tests.utilities.factory_scenarios import TestWorkInfo
from tests.utilities.factory_utils import (
    factory_project_model,
    factory_staff_model,
    factory_work_first_nation_model,
    factory_work_model,
)
from tests.utilities.helpers import prepare_work_payload
from api.models.role import RoleEnum


API_BASE_URL = "/api/v1/"


def test_get_works_by_team(client, auth_header):
    """Test get works grouped by team."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=team")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    team_insight = result.json[0]
    assert team_insight["eao_team_id"] == work.eao_team_id
    assert team_insight["count"] == 1


def test_get_works_by_lead(client, auth_header):
    """Test get works grouped by lead."""
    work_data = _set_up_work_object()
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=work_data, headers=auth_header)
    work_response_json = work_response.json
    url = urljoin(API_BASE_URL, "insights/works?group_by=lead")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    lead_insight = result.json[0]
    assert lead_insight["work_lead_id"] == work_response_json["work_lead_id"]
    assert lead_insight["count"] == 1


def test_get_works_by_staff(client, auth_header):
    """Test get works grouped by staff."""
    # Create work
    payload = prepare_work_payload()

    # Create the work
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=payload, headers=auth_header)
    work_response_json = work_response.json
    # Make staff office/analyst
    work_id = work_response_json["id"]
    url = urljoin(API_BASE_URL, f"works/{work_id}/staff-roles")
    staff_role_data = {
        "staff_id": work_response_json["work_lead_id"],
        "role_id": RoleEnum.OFFICER_ANALYST.value,
        "is_active": True,
    }
    client.post(url, json=staff_role_data, headers=auth_header)
    url = urljoin(API_BASE_URL, "insights/works?group_by=staff")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    initial_staff = [work_response_json["work_lead_id"]]
    assert set([staff_insight["staff_id"] for staff_insight in result.json]) == set(
        initial_staff
    )


def test_get_works_by_ministry(client, auth_header):
    """Test get works grouped by ministry."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=ministry")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    ministry_insight = result.json[0]
    assert ministry_insight["ministry_id"] == work.ministry_id
    assert ministry_insight["count"] == 1


def test_get_works_by_federal_involvement(client, auth_header):
    """Test get works grouped by federal involvement."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=federal_involvement")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    federal_involvement_insight = result.json[0]
    assert (
        federal_involvement_insight["federal_involvement_id"]
        == work.federal_involvement_id
    )
    assert federal_involvement_insight["count"] == 1


def test_get_works_by_first_nation(client, auth_header):
    """Test get works grouped by federal involvement."""
    work_first_nation = factory_work_first_nation_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=first_nation")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    first_nation_insight = result.json[0]
    assert (
        first_nation_insight["first_nation_id"]
        == work_first_nation.indigenous_nation_id
    )
    assert first_nation_insight["count"] == 1


def test_get_works_by_type(client, auth_header):
    """Test get works grouped by work type."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=type")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    type_insight = result.json[0]
    assert type_insight["work_type_id"] == work.work_type_id
    assert type_insight["count"] == 1


def test_get_assessment_works_by_phase(client, auth_header):
    """Test get assessment works grouped by phase."""
    # Create work
    payload = prepare_work_payload(TestWorkInfo.assessment_work.value)

    # Create the work
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=payload, headers=auth_header)
    work_response_json = work_response.json
    url = urljoin(API_BASE_URL, "insights/works/assessment?group_by=phase")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    assessment_insight = result.json[0]
    assert assessment_insight["count"] == 1
    assert (
        work_response_json["current_work_phase"]["phase_id"]
        == assessment_insight["phase_id"]
    )


def test_get_projects_by_region(client, auth_header):
    """Test get projects grouped by ENV regions."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, "insights/projects?group_by=region")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    project_insight = result.json[0]
    assert project_insight["region_id"] == project.region_id_env
    assert project_insight["count"] == 1


def test_get_projects_by_type(client, auth_header):
    """Test get projects grouped by type."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, "insights/projects?group_by=type")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    project_insight = result.json[0]
    assert project_insight["type_id"] == project.type_id
    assert project_insight["count"] == 1


def test_get_projects_by_subtype(client, auth_header):
    """Test get projects grouped by subtype."""
    project = factory_project_model()
    url = urljoin(
        API_BASE_URL, f"insights/projects?type_id={project.type_id}&group_by=subtype"
    )
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    project_insight = result.json[0]
    assert project_insight["sub_type_id"] == project.sub_type_id
    assert project_insight["count"] == 1


def _set_up_work_object():
    """Set up a full fledged work object"""
    project = factory_project_model()
    staff = factory_staff_model()
    work_data = TestWorkInfo.assessment_work.value
    work_data["project_id"] = project.id
    work_data["responsible_epd_id"] = staff.id
    work_data["work_lead_id"] = staff.id
    work_data["decision_by_id"] = staff.id
    return work_data
