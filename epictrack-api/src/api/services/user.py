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
from flask import current_app
import sys

from api.services import authorisation
from api.utils.roles import Role as KeycloakRole
from .keycloak import KeycloakService


class UserService:
    """User Service"""

    @classmethod
    def get_all_users(cls):
        """Get all users"""
        cls._check_auth()
        users = KeycloakService.get_users()
        for user in users:
            user["group"] = None
        groups = cls.get_groups()
        groups = sorted(groups, key=cls._get_level)
        for group in groups:
            members = KeycloakService.get_group_members(group["id"])
            member_ids = [member["id"] for member in members]
            for user in users:
                if user["id"] in member_ids:
                    # assign group only if user has no group yet or this group has higher level
                    if (user["group"] is None) or (cls._get_level(group) > cls._get_level(user["group"])):
                        user["group"] = group
        return users

    @classmethod
    def get_groups(cls):
        """
        Retrieve groups that have the "level" attribute set up.

        This method fetches all groups from the Keycloak service and filters them
        to include only those groups that have sub-groups. It logs the groups and
        sub-groups at various stages for debugging purposes.

        Returns:
          list: A list of filtered groups that have sub-groups.
        """
        cls._check_auth()
        # Fetch all groups from the Keycloak service
        groups = KeycloakService.get_groups()
        current_app.logger.debug(f"Groups: {groups}")
        filtered_groups = []

        for group in groups:
            # For some reason we get all the groups from keycloak instead of just requesting the
            # TRACK group. So we need to filter out the groups that are not TRACK based, otherwise
            # we will get all the groups in the system.
            if group.get("name", "") != "TRACK":
                continue

            # Check if the group has sub-groups by looking at the "subGroupCount" attribute
            if group.get("subGroupCount", 0) > 0:

                # Fetch the sub-groups for the current group
                sub_groups = KeycloakService.get_sub_groups(group["id"])
                current_app.logger.debug(f"sub_groups: {sub_groups}")
                filtered_groups.extend(sub_groups)

        current_app.logger.debug(f"filtered_groups: {filtered_groups}")
        return filtered_groups

    @classmethod
    def _get_level(cls, group):
        """
        Retrieves the level from the given group.

        Args:
          group (dict): A dictionary representing the group, which should contain
                  an "attributes" key with a nested "level" key.

        Returns:
          int: The level extracted from the group. If the level is not found or
             cannot be converted to an integer, returns -sys.maxsize.
        """
        level_str = group["attributes"].get("level", [-sys.maxsize])[0]
        try:
            return int(level_str)
        except (KeyError, IndexError, TypeError) as e:
            current_app.logger.error(f"Error getting level from group: {e}. Returning lowest int.")
            return -sys.maxsize

    @classmethod
    def _check_auth(cls):
        """Check if user has manage users role"""
        one_of_roles = (
            KeycloakRole.MANAGE_USERS.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)
