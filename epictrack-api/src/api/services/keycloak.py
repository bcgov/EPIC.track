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
from api.utils.enums import HttpMethod


class KeycloakService:
    """Keycloak services"""

    @staticmethod
    def get_groups(brief_representation: bool = False):
        """Get all the groups"""
        response = KeycloakService._request_keycloak(f'groups?briefRepresentation={brief_representation}')
        return response.json()

    @staticmethod
    def get_sub_groups(group_id):
        """
        Return the subgroups of a given group.

        Args:
          group_id (str): The ID of the group for which to retrieve subgroups.

        Returns:
          list: A list of subgroups for the given group.
        """
        response = KeycloakService._request_keycloak(f"groups/{group_id}/children")
        return response.json()

    @staticmethod
    def get_users():
        """Get users"""
        response = KeycloakService._request_keycloak('users?max=2000')
        return response.json()

    @staticmethod
    def get_user_by_email(email: str):
        """Get a user by their email address. If the user does not exist, throw an error."""
        encoded_email = requests.utils.quote(email)  # URL encode the email to handle special characters
        response = KeycloakService._request_keycloak(f'users?email={encoded_email}')
        users = response.json()
        if not users:
            raise ValueError(f"No user found with email: {email}")
        print(users)
        return users

    @staticmethod
    def get_group_members(group_id):
        """Get the members of a group"""
        response = KeycloakService._request_keycloak(f'groups/{group_id}/members')
        return response.json()

    @staticmethod
    def update_user_group(user_id, group_id):
        """Update the group of user"""
        return KeycloakService._request_keycloak(f'users/{user_id}/groups/{group_id}', HttpMethod.PUT)

    @staticmethod
    def delete_user_group(user_id, group_id):
        """Delete user-group mapping"""
        return KeycloakService._request_keycloak(f'users/{user_id}/groups/{group_id}', HttpMethod.DELETE)

    @staticmethod
    def get_user_groups(user_id):
        """Get groups of a user by user ID"""
        response = KeycloakService._request_keycloak(f'users/{user_id}/groups')
        return response.json()

    @staticmethod
    def _request_keycloak(relative_url, http_method: HttpMethod = HttpMethod.GET, data=None):
        """Common method to request keycloak"""
        base_url = current_app.config.get('KEYCLOAK_BASE_URL')
        realm = current_app.config.get('KEYCLOAK_REALM_NAME')
        timeout = int(current_app.config.get('CONNECT_TIMEOUT', 60))
        admin_token = KeycloakService._get_admin_token()
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {admin_token}'
        }

        url = f'{base_url}/auth/admin/realms/{realm}/{relative_url}'

        if http_method == HttpMethod.GET:
            response = requests.get(url, headers=headers, timeout=timeout)
        elif http_method == HttpMethod.PUT:
            response = requests.put(url, headers=headers, data=data, timeout=timeout)
        elif http_method == HttpMethod.DELETE:
            response = requests.delete(url, headers=headers, timeout=timeout)
        else:
            raise ValueError('Invalid HTTP method')
        response.raise_for_status()
        return response

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
