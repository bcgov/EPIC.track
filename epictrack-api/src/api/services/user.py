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
"""User service"""
from api.exceptions import BusinessError, PermissionDeniedError
from api.utils import TokenInfo

from .keycloak import KeycloakService


class UserService:
    """User Service"""

    @staticmethod
    def get_all_users():
        """Get all users"""
        users = KeycloakService.get_users()
        for user in users:
            user['group'] = None
        groups = UserService.get_groups()
        for group in groups:
            members = KeycloakService.get_group_members(group['id'])
            member_ids = [member['id'] for member in members]
            filtered_users = list(filter(lambda x, _member_ids=member_ids: x['id'] in _member_ids, users))
            for user in filtered_users:
                user['group'] = group
        return users

    @staticmethod
    def get_groups():
        """Get groups that has level set up"""
        groups = KeycloakService.get_groups()
        filtered_groups = list(filter((lambda g: 'level' in g['attributes']), groups))
        return filtered_groups

    @staticmethod
    def update_user_group(user_id, user_group_request):
        """Update the group of a user"""
        token_groups = TokenInfo.get_user_data()['groups']
        groups = UserService.get_groups()
        requested_group = next((group for group in groups if group['name'] in token_groups), None)
        updating_group = next((group for group in groups
                               if group['id'] == user_group_request.get('group_id_to_update')), None)
        if (not requested_group and not updating_group and
           int(requested_group['attributes']['level'][0]) < int(updating_group['attributes']['level'][0])):
            raise PermissionDeniedError('Permission denied')

        existing_group_id = user_group_request.get('existing_group_id')
        if existing_group_id:
            result = KeycloakService.delete_user_group(user_id, user_group_request.get('existing_group_id'))
            if result.status_code != 204:
                raise BusinessError('Error removing group', 500)
        result = KeycloakService.update_user_group(user_id, user_group_request['group_id_to_update'])
        return result
