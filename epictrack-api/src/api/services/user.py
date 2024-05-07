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

    @classmethod
    def get_all_users(cls):
        """Get all users"""
        users = KeycloakService.get_users()
        for user in users:
            user["group"] = None
        groups = UserService.get_groups()
        groups = sorted(groups, key=UserService._get_level)
        for group in groups:
            members = KeycloakService.get_group_members(group["id"])
            member_ids = [member["id"] for member in members]
            filtered_users = [user for user in users if user["id"] in member_ids]
            for user in filtered_users:
                user["group"] = group
        return users

    @classmethod
    def get_groups(cls):
        """Get groups that has "level" attribute set up"""
        groups = KeycloakService.get_groups()
        filtered_groups = []
        for group in groups:
            if group.get("subGroups"):
                filtered_groups = filtered_groups + [
                    sub_group
                    for sub_group in group.get("subGroups")
                    if "level" in sub_group["attributes"]
                ]
            elif "level" in group["attributes"]:
                filtered_groups.append(group)
        return filtered_groups

    @classmethod
    def update_user_group(cls, user_id, user_group_request):
        """Update the group of a user"""
        token_groups = TokenInfo.get_user_data()["groups"]
        groups = cls.get_groups()
        requesters_group = next(
            (group for group in groups if group["name"] in token_groups), None
        )
        updating_group = next(
            (
                group
                for group in groups
                if group["id"] == user_group_request.get("group_id_to_update")
            ),
            None,
        )
        if (
            not requesters_group
            and not updating_group
            and int(UserService._get_level(requesters_group))
            < int(UserService._get_level(updating_group))
        ):
            raise PermissionDeniedError("Permission denied")

        # if a group has exclusive flag , user can only be present exclusively in that group
        # All other group access has to be removed before assigning to exclusive group
        requires_all_group_removal = updating_group.get("attributes", {}).get("exclusive", ['false'])[
                                          0].lower() == 'true'

        if requires_all_group_removal:
            UserService._delete_from_all_epictrack_subgroups(user_id)
        else:
            UserService._delete_from_current_group(user_group_request, user_id)

        result = KeycloakService.update_user_group(
            user_id, user_group_request["group_id_to_update"]
        )
        return result

    @classmethod
    def _delete_from_current_group(cls, user_group_request, user_id):
        existing_group_id = user_group_request.get("existing_group_id")
        if existing_group_id:
            result = KeycloakService.delete_user_group(
                user_id, user_group_request.get("existing_group_id")
            )
            if result.status_code != 204:
                raise BusinessError("Error removing group", 500)

    @staticmethod
    def _delete_from_all_epictrack_subgroups(user_id):
        """Delete all subgroups of 'epictrack' for a user"""
        groups = KeycloakService.get_user_groups(user_id)

        # Find the main group 'epictrack' and get its subgroups
        track_subgroups = [group for group in groups if 'track' in group['path'].lower()]

        for subgroup in track_subgroups:
            result = KeycloakService.delete_user_group(user_id, subgroup['id'])

            if result.status_code != 204:
                raise BusinessError("Error removing group", 500)

    @classmethod
    def _get_level(cls, group):
        """Gets the level from the group"""
        return group["attributes"]["level"][0]
