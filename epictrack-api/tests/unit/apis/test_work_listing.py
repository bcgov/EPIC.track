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

"""Test suite for the paginated insights work listing."""
from http import HTTPStatus
from urllib.parse import urljoin

from tests.utilities.factory_utils import factory_work_model


API_BASE_URL = "/api/v1/"
LISTING_URL = urljoin(API_BASE_URL, "works/listing")
FILTER_OPTIONS_URL = urljoin(API_BASE_URL, "works/listing/filter-options")


def _create_works(prefix: str, count: int):
    """Create works whose titles all share a prefix so a test can isolate its own rows."""
    works = []
    for index in range(count):
        work = factory_work_model()
        work.simple_title = f"{prefix} {index}"
        work.save()
        works.append(work)
    return works


def test_listing_returns_only_the_requested_page(client, auth_header):
    """Only the rows of the requested page are returned, along with the full match count."""
    _create_works("Paging", 3)
    body = {
        "is_active": True,
        "page": 1,
        "size": 2,
        "filters": [{"id": "title", "value": "Paging"}],
    }

    first_page = client.post(LISTING_URL, json=body, headers=auth_header)

    assert first_page.status_code == HTTPStatus.OK
    assert len(first_page.json["items"]) == 2
    assert first_page.json["total"] == 3

    second_page = client.post(
        LISTING_URL, json={**body, "page": 2}, headers=auth_header
    )

    assert len(second_page.json["items"]) == 1
    assert second_page.json["total"] == 3
    first_page_ids = {work["id"] for work in first_page.json["items"]}
    assert first_page_ids.isdisjoint({work["id"] for work in second_page.json["items"]})


def test_listing_filters_and_sorts_server_side(client, auth_header):
    """The requested page is filtered and sorted by the database, not by the browser."""
    _create_works("Sorting", 3)
    body = {
        "is_active": True,
        "page": 1,
        "size": 15,
        "filters": [{"id": "title", "value": "Sorting"}],
        "sort_key": "title",
        "sort_order": "desc",
    }

    result = client.post(LISTING_URL, json=body, headers=auth_header)

    assert result.status_code == HTTPStatus.OK
    titles = [work["title"] for work in result.json["items"]]
    assert len(titles) == 3
    assert all("Sorting" in title for title in titles)
    assert titles == sorted(titles, reverse=True)


def test_filter_options_cover_every_work_not_just_a_page(client, auth_header):
    """The dropdown values come from the whole data set, so they survive pagination."""
    _create_works("Options", 1)

    result = client.get(f"{FILTER_OPTIONS_URL}?is_active=true", headers=auth_header)

    assert result.status_code == HTTPStatus.OK
    assert set(result.json) == {
        "projects",
        "work_types",
        "phases",
        "ministries",
        "federal_involvements",
        "indigenous_nations",
        "rel_staff",
        "work_states",
        "started_years",
        "closed_years",
    }
    assert result.json["projects"]
    assert result.json["work_types"]
