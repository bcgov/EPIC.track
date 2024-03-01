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

# from tests.utilities.factory_scenarios import TestWorkInfo
from tests.utilities.factory_utils import factory_work_first_nation_model, factory_work_model
from tests.utilities.helpers import prepare_work_payload


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
    work = factory_work_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=lead")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    lead_insight = result.json[0]
    assert lead_insight["work_lead_id"] == work.work_lead_id
    assert lead_insight["count"] == 1


def test_get_works_by_staff(client, auth_header):
    """Test get works grouped by staff."""
    # Create work
    payload = prepare_work_payload()

    # Create the work
    url = urljoin(API_BASE_URL, "works")
    work_response = client.post(url, json=payload, headers=auth_header)
    work_response_json = work_response.json

    url = urljoin(API_BASE_URL, "insights/works?group_by=staff")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    staff_insight = result.json[0]
    assert staff_insight["staff_id"] == work_response_json["work_lead_id"]
    assert staff_insight["count"] == 1


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
    assert federal_involvement_insight["federal_involvement_id"] == work.federal_involvement_id
    assert federal_involvement_insight["count"] == 1


def test_get_works_by_first_nation(client, auth_header):
    """Test get works grouped by federal involvement."""
    work_first_nation = factory_work_first_nation_model()
    url = urljoin(API_BASE_URL, "insights/works?group_by=first_nation")
    result = client.get(url, headers=auth_header)
    assert result.status_code == HTTPStatus.OK
    assert len(result.json) == 1
    first_nation_insight = result.json[0]
    assert first_nation_insight["first_nation_id"] == work_first_nation.indigenous_nation_id
    assert first_nation_insight["count"] == 1


# def test_get_works_by_type(client, auth_header):
#     """Test get works grouped by work type."""
#     work = factory_work_model()
#     url = urljoin(API_BASE_URL, "insights/works?group_by=type")
#     result = client.get(url, headers=auth_header)
#     assert result.status_code == HTTPStatus.OK
#     assert len(result.json) == 1
#     type_insight = result.json[0]
#     assert type_insight["work_type_id"] == work.work_type_id
#     assert type_insight["count"] == 1


# def test_get_assessment_works_by_phase(client, auth_header):
#     """Test get assessment works grouped by phase."""
#     # Create work
#     payload = prepare_work_payload(TestWorkInfo.assessment_work.value)

#     # Create the work
#     url = urljoin(API_BASE_URL, "works")
#     work_response = client.post(url, json=payload, headers=auth_header)
#     work_response_json = work_response.json

#     url = urljoin(API_BASE_URL, "insights/works/assessment?group_by=phase")
#     result = client.get(url, headers=auth_header)
#     assert result.status_code == HTTPStatus.OK
#     assert len(result.json) == 1
#     assessment_insight = result.json[0]
#     assert assessment_insight["count"] == 1
#     assert work_response_json["current_work_phase"]["phase_id"] == assessment_insight["phase_id"]
