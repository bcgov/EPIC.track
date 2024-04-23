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
"""Service to manage Roles."""
from flask import current_app

from api.models.role import Role


class RoleService:  # pylint:disable=too-few-public-methods
    """Service to manage role related operations"""

    @classmethod
    def find_all(cls):
        """Find all roles"""
        current_app.logger.debug("find roles")
        roles = Role.find_all()
        return roles

    @classmethod
    def find_by_name(cls, name):
        """Find role by name"""
        current_app.logger.debug("find role by name")
        role = Role.find_by_name(name)
        return role

    @classmethod
    def find_all_by_names(cls, names):
        """Find role by name"""
        current_app.logger.debug("find roles by names")
        roles = Role.find_all_by_names(names)
        return roles
