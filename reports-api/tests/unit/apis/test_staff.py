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
"""Test suite for staff."""

from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = '/api/v1/'


def test_get_staff_by_position(client):
    """Test get staff by position."""
    url = urljoin(API_BASE_URL, 'staffs/positions/3')
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK


def test_get_all_active_staff(client):
    """Test get all active staff."""
    url = urljoin(API_BASE_URL, 'staffs')
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK


def test_get_staff_details(client):
    """Test get staff details."""
    url = urljoin(API_BASE_URL, 'staffs/1')
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK
