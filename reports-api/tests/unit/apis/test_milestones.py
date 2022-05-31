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
"""Test suite for phases."""

from http import HTTPStatus
from urllib.parse import urljoin


API_BASE_URL = '/api/v1/'


def test_get_phases(client):
    """Test get phases."""
    url = urljoin(API_BASE_URL, 'milestones/phases/11')
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK
    decision_events = list(filter(lambda x: x['is_end_event'] or x['is_start_event'], result.json))
    assert len(decision_events) == 0
