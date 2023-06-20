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
"""Keycloak admin functions"""
import requests
from flask import current_app

class KeycloakService:
    """Keycloak services"""

    @staticmethod
    def get_groups(briefRepresentation:bool=True):
        """Get all the groups"""
        """Get user group from Keycloak by userid."""
        base_url = current_app.config.get('KEYCLOAK_BASE_URL')
        realm = current_app.config.get('KEYCLOAK_REALM_NAME')
        timeout = int(current_app.config.get('CONNECT_TIMEOUT', 60))
        admin_token = KeycloakService._get_admin_token()
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {admin_token}'
        }

        # Get the user and return
        query_user_url = f'{base_url}/auth/admin/realms/{realm}/groups?briefRepresentation={briefRepresentation}'
        response = requests.get(query_user_url, headers=headers, timeout=timeout)
        response.raise_for_status()
        return response.json()
    

    @staticmethod
    def _get_admin_token():
        """Create an admin token."""
        config = current_app.config
        base_url = config.get('KEYCLOAK_BASE_URL')
        realm = config.get('KEYCLOAK_REALM_NAME')
        admin_client_id = config.get(
            'KEYCLOAK_ADMIN_CLIENT')
        admin_secret = config.get('KEYCLOAK_ADMIN_SECRET')
        timeout = int(config.get('CONNECT_TIMEOUT', 60))
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        token_url = f'{base_url}/auth/realms/{realm}/protocol/openid-connect/token'

        response = requests.post(token_url,
                                 data=f'client_id={admin_client_id}&grant_type=client_credentials'
                                      f'&client_secret={admin_secret}', headers=headers,
                                 timeout=timeout)
        return response.json().get('access_token')