# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Security tests for the POST /api/v1/tasks (event-template upload) endpoint."""
from http import HTTPStatus
from io import BytesIO

import pandas as pd

from tests.utilities.factory_scenarios import TestJwtClaims
from tests.utilities.factory_utils import factory_auth_header

API_BASE_URL = "/api/v1/event-templates"


def _minimal_template_file():
    """Build the smallest valid Excel template payload."""
    phases_data = {
        "No": [1], "Name": ["Phase 1"], "WorkType": ["Assessment"],
        "EAAct": ["EA Act 2018"], "NumberOfDays": [30], "Color": ["#FF0000"],
        "SortOrder": [1], "Legislated": [True], "Visibility": ["REGULAR"],
    }
    events_data = {
        "No": [1], "Parent": [""], "PhaseNo": [1], "EventName": ["Event 1"],
        "Phase": ["Phase 1"], "EventType": ["Milestone"],
        "EventCategory": ["Time/Calendar"], "EventPosition": ["START"],
        "MultipleDays": [False], "NumberOfDays": [0], "StartAt": ["0"],
        "Visibility": ["MANDATORY"], "SortOrder": [1],
    }
    outcomes_data = {
        "No": [1], "TemplateNo": [1], "TemplateName": ["Event 1"],
        "OutcomeName": ["Outcome 1"], "SortOrder": [1],
    }
    actions_data = {
        "No": [1], "OutcomeNo": [1], "OutcomeName": ["Outcome 1"],
        "ActionName": ["NONE"], "ActionDescription": [""],
        "AdditionalParams": ["{}"], "SortOrder": [1],
    }
    buf = BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:
        pd.DataFrame(phases_data).to_excel(writer, sheet_name="Phases", index=False)
        pd.DataFrame(events_data).to_excel(writer, sheet_name="Events", index=False)
        pd.DataFrame(outcomes_data).to_excel(writer, sheet_name="Outcomes", index=False)
        pd.DataFrame(actions_data).to_excel(writer, sheet_name="Actions", index=False)
    buf.seek(0)
    return buf


class TestEventTemplateUploadAuth:
    """Auth enforcement on POST /api/v1/tasks."""

    def test_upload_without_token_returns_401(self, client, app):
        """Unauthenticated request must be rejected."""
        with app.app_context():
            data = {"event_template": (BytesIO(b"fake"), "template.xlsx")}
            response = client.post(
                API_BASE_URL,
                data=data,
                content_type="multipart/form-data",
            )
            assert response.status_code == HTTPStatus.UNAUTHORIZED

    def test_upload_without_extended_edit_role_returns_403(self, client, jwt, app):
        """A valid token without extended_edit must receive 403."""
        with app.app_context():
            # manage_user_role has only 'manage_users' — no 'extended_edit'
            headers = factory_auth_header(
                jwt=jwt, claims=TestJwtClaims.manage_user_role
            )
            data = {"event_template": (_minimal_template_file(), "template.xlsx")}
            response = client.post(
                API_BASE_URL,
                data=data,
                content_type="multipart/form-data",
                headers=headers,
            )
            assert response.status_code == HTTPStatus.FORBIDDEN

    def test_upload_with_extended_edit_role_returns_201(self, client, jwt, app):
        """A token with extended_edit must be allowed (201 Created)."""
        with app.app_context():
            # staff_admin_role includes 'extended_edit'
            headers = factory_auth_header(
                jwt=jwt, claims=TestJwtClaims.staff_admin_role
            )
            data = {"event_template": (_minimal_template_file(), "template.xlsx")}
            response = client.post(
                API_BASE_URL,
                data=data,
                content_type="multipart/form-data",
                headers=headers,
            )
            assert response.status_code == HTTPStatus.CREATED
