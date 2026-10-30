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

"""Test suite pinning what the limited_view role can and cannot reach.

EPIC.compliance calls a small number of EPIC.track endpoints with the end user's
own token, and EPIC.map calls a few more with its service account. The limited_view
role exists so neither needs track's general view role.
"""
from copy import copy
from datetime import date
from http import HTTPStatus
from urllib.parse import urljoin

from tests.utilities.factory_scenarios import (
    TestFirstNation,
    TestJwtClaims,
    TestProjectInfo,
)
from tests.utilities.factory_utils import (
    factory_auth_header,
    factory_first_nation_model,
    factory_pip_org_type_model,
    factory_project_model,
    factory_staff_model,
    factory_work_model,
)


API_BASE_URL = "/api/v1/"


def _limited_view_header(jwt):
    """Build an auth header carrying limited_view and nothing else."""
    return factory_auth_header(jwt=jwt, claims=TestJwtClaims.limited_view_role.value)


def test_limited_view_can_get_project_by_id(client, jwt):
    """limited_view reads a single project: EPIC.compliance's main call."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, f'projects/{project.id}')

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
    assert response.json["id"] == project.id


def test_limited_view_cannot_list_projects(client, jwt):
    """limited_view is scoped to fetch-by-id; the full project list stays closed."""
    url = urljoin(API_BASE_URL, "projects")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_create_project(client, jwt):
    """limited_view is read-only."""
    url = urljoin(API_BASE_URL, "projects")

    response = client.post(
        url, json=copy(TestProjectInfo.project1.value), headers=_limited_view_header(jwt)
    )

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_update_project(client, jwt):
    """limited_view is read-only."""
    project = factory_project_model()
    payload = copy(TestProjectInfo.project1.value)
    payload["name"] = "Renamed by an account that should not be able to"
    url = urljoin(API_BASE_URL, f'projects/{project.id}')

    response = client.put(url, json=payload, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_delete_project(client, jwt):
    """limited_view is read-only."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, f'projects/{project.id}')

    response = client.delete(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_can_list_first_nations(client, jwt):
    """limited_view reads the First Nations list: EPIC.compliance's second call."""
    factory_first_nation_model()
    url = urljoin(API_BASE_URL, "indigenous-nations")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK


def test_limited_view_can_get_first_nation_by_id(client, jwt):
    """limited_view reads a single First Nation by id."""
    first_nation = factory_first_nation_model()
    url = urljoin(API_BASE_URL, f'indigenous-nations/{first_nation.id}')

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
    assert response.json["id"] == first_nation.id


def test_limited_view_cannot_create_first_nation(client, jwt):
    """limited_view is read-only."""
    payload = copy(TestFirstNation.first_nation1.value)
    payload["relationship_holder_id"] = factory_staff_model().id
    payload["pip_org_type_id"] = factory_pip_org_type_model().id
    url = urljoin(API_BASE_URL, "indigenous-nations/details")

    response = client.post(url, json=payload, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_update_first_nation(client, jwt):
    """limited_view is read-only."""
    first_nation = factory_first_nation_model()
    payload = copy(TestFirstNation.first_nation2.value)
    payload["relationship_holder_id"] = factory_staff_model().id
    payload["pip_org_type_id"] = factory_pip_org_type_model().id
    url = urljoin(API_BASE_URL, f'indigenous-nations/{first_nation.id}')

    response = client.put(url, json=payload, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_delete_first_nation(client, jwt):
    """limited_view is read-only."""
    first_nation = factory_first_nation_model()
    url = urljoin(API_BASE_URL, f'indigenous-nations/{first_nation.id}')

    response = client.delete(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_can_get_project_states(client, jwt):
    """EPIC.compliance reads project states.

    ProjectStateService calls check_auth nowhere, so this endpoint is open to any
    authenticated token and limited_view inherits that. Deliberate — see
    docs/superpowers/specs/2026-09-16-limited-view-role-design.md. This test exists
    so that adding a guard there fails loudly instead of breaking compliance.
    """
    url = urljoin(API_BASE_URL, "project-states?components=compliance")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK


def test_limited_view_can_get_project_as_of_date(client, jwt):
    """EPIC.compliance fetches historical project detail via as_of_date.

    That branch resolves special fields, which are unguarded. Pinned here so a
    future guard on the special-field path surfaces as a failure rather than a
    403 in compliance.
    """
    project = factory_project_model()
    url = urljoin(
        API_BASE_URL, f'projects/{project.id}?as_of_date={date.today().isoformat()}'
    )

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
    assert response.json["id"] == project.id


def test_limited_view_can_get_first_nation_details(client, jwt):
    """The /details route shares _check_can_view with the plain list route.

    EPIC.compliance does not call it, but it is granted as a consequence of the
    Task 2 change. Recorded rather than left implicit.
    """
    factory_first_nation_model()
    url = urljoin(API_BASE_URL, "indigenous-nations/details")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK


def _no_role_header(jwt):
    """Build an auth header for a valid token that carries no role at all."""
    claims = {**TestJwtClaims.limited_view_role.value, "realm_access": {"roles": []}}
    return factory_auth_header(jwt=jwt, claims=claims)


def test_limited_view_can_list_project_summaries(client, jwt):
    """limited_view lists active projects without their internal fields: EPIC.map's project dots."""
    project = factory_project_model()
    url = urljoin(API_BASE_URL, "projects/summary")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
    assert project.id in [summary["id"] for summary in response.json]


def test_limited_view_can_list_project_work_summaries(client, jwt):
    """limited_view lists a project's works without their internal fields: EPIC.map's project card."""
    work = factory_work_model()
    url = urljoin(API_BASE_URL, f'projects/{work.project_id}/works/summary')

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
    assert [summary["id"] for summary in response.json] == [work.id]


def test_a_token_without_a_view_role_cannot_list_summaries(client, jwt):
    """The summaries are opened to limited_view, not to every token the realm issues."""
    work = factory_work_model()

    projects = client.get(urljoin(API_BASE_URL, "projects/summary"), headers=_no_role_header(jwt))
    works = client.get(
        urljoin(API_BASE_URL, f'projects/{work.project_id}/works/summary'), headers=_no_role_header(jwt)
    )

    assert projects.status_code == HTTPStatus.FORBIDDEN
    assert works.status_code == HTTPStatus.FORBIDDEN


def test_a_token_without_a_view_role_cannot_tell_which_projects_exist(client, jwt):
    """The role check runs before the project lookup, so an unknown id is a 403, not a 404."""
    url = urljoin(API_BASE_URL, "projects/999999/works/summary")

    response = client.get(url, headers=_no_role_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_list_works(client, jwt):
    """limited_view reads works through the summary; the full work list stays closed."""
    url = urljoin(API_BASE_URL, "works")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_cannot_read_the_work_listing(client, jwt):
    """limited_view reads works through the summary; the insights listing stays closed."""
    url = urljoin(API_BASE_URL, "works/listing")

    response = client.post(url, json={}, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_limited_view_can_get_project_types(client, jwt):
    """EPIC.map reads the project types for its Type menu.

    The endpoint calls check_auth nowhere, so limited_view inherits it the way it
    inherits project states. Pinned so that adding a guard there fails loudly
    instead of emptying the map's menu.
    """
    url = urljoin(API_BASE_URL, "project-types")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK


def test_limited_view_can_get_regions(client, jwt):
    """EPIC.map reads the ENV regions for its Region menu. Unguarded, as project types are."""
    url = urljoin(API_BASE_URL, "regions?type=ENV")

    response = client.get(url, headers=_limited_view_header(jwt))

    assert response.status_code == HTTPStatus.OK
