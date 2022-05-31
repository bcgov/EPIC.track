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
"""Test suite for sync form data."""

from http import HTTPStatus


API_URL = '/api/v1/sync-form-data'


def test_sync_form_data_create(client, new_project, new_staff):
    """Test sync form data."""
    payload = {
        "works": {
            "title": "Test works",
            "short_description": "Testing sync form data api",
            "project_id": new_project.id,
            "ministry_id": 1,
            "ea_act_id": 3,
            "work_type_id": 6,
            "federal_involvement_id": 1,
            "work_lead_id": new_staff.id,
            "responsible_epd_id": new_staff.id,
            "eao_team_id": 1
        },
        "works-work_statuses": {
            "status": "Testing foreign key entry creation"
        }
    }
    result = client.post(API_URL, json=payload)
    assert result.status_code == HTTPStatus.OK


def test_sync_form_data_update(client, new_project, new_staff):
    """Test sync form data update."""
    new_payload = {
        "works": {
            "title": "Test works",
            "short_description": "Testing sync form data api",
            "project_id": new_project.id,
            "ministry_id": 1,
            "ea_act_id": 3,
            "work_type_id": 6,
            "federal_involvement_id": 1,
            "work_lead_id": new_staff.id,
            "responsible_epd_id": new_staff.id,
            "eao_team_id": 1
        },
        "works-work_statuses": {
            "status": "Testing foreign key entry creation"
        }
    }
    new = client.post(API_URL, json=new_payload).json

    update_payload = {
        "works": {
            "id": new['works']['id'],
            "title": "Test works edit",
            "short_description": "Testing sync form data api update",
            "project_id": new_project.id,
            "ministry_id": 1,
            "ea_act_id": 3,
            "work_type_id": 6,
            "federal_involvement_id": 1,
            "work_lead_id": new_staff.id,
            "responsible_epd_id": new_staff.id,
            "eao_team_id": 1
        },
        "works-work_statuses": {
            "status": "Testing foreign key entry and updated_at updation ",
            "id": new['works-work_statuses']['id']
        }
    }
    result = client.post(API_URL, json=update_payload)
    assert result.status_code == HTTPStatus.OK
