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
"""Test suite for health endpoints."""

from http import HTTPStatus


def test_get_healthz(client):
    """Test get health endpoint."""
    url = '/ops/healthz'
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK


def test_get_readyz(client):
    """Test readiness endpoint."""
    url = '/ops/readyz'
    result = client.get(url)
    assert result.status_code == HTTPStatus.OK
