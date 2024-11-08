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
"""Utility to manage integration with BC gov. Common Document Generation Service."""

import os
from urllib.parse import urlencode

import requests


class CDOGClient:  # pylint: disable=too-few-public-methods
    """Client class for Common Document Generation Service"""

    access_token = None

    def __init__(self) -> None:
        """Constructor"""
        if not all([
            os.environ.get('CDOGS_API_ENDPOINT'),
            os.environ.get('CDOGS_TOKEN_END_POINT'),
            os.environ.get('CDOGS_CLIENT_ID'),
            os.environ.get('CDOGS_CLIENT_SECRET')
        ]):
            raise EnvironmentError("CDOGS environment variables are not set properly.")
        self.api_url = os.environ.get('CDOGS_API_ENDPOINT')

    def _authorize(self):
        """Method to get access token for CDOGS"""
        end_point = os.environ.get("CDOGS_TOKEN_END_POINT")
        client_id = os.environ.get("CDOGS_CLIENT_ID")
        client_secret = os.environ.get("CDOGS_CLIENT_SECRET")
        data = urlencode(
            {
                "grant_type": "client_credentials",
                "client_id": client_id,
                "client_secret": client_secret,
            }
        )
        res = requests.post(
            end_point, data=data, headers={"content-type": "application/x-www-form-urlencoded"}, timeout=300
        )

        access_token = res.json().get('access_token')

        if res.status_code == 200 and access_token:
            self.access_token = access_token

    def generate_document(self, report_title, data, template):
        """Calls the CDOGS service to generate the report document"""
        if self.access_token is None:
            self._authorize()

        payload = {
            "data": data,
            "template": {
                "encodingType": "base64",
                "fileType": "docx",
                "content": str(template),
            },
            "options": {
                "cacheReport": True,
                "convertTo": "pdf",
                "overwrite": True,
                "reportName": f"{report_title}.pdf",
            },
        }
        headers = {"content-type": "application/json", "Authorization": f"Bearer {self.access_token}"}

        report = requests.post(f'{self.api_url}/template/render', json=payload, headers=headers, timeout=300)
        return report.content
