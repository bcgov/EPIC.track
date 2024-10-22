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
"""User group response schema"""
from marshmallow import Schema, fields


class UserGroupResponseSchema(Schema):
    """User group response schema"""

    id = fields.Str(metadata={"description": "Id of the group"})
    name = fields.Str(metadata={"description": "Name of the group"})
    path = fields.Method("get_path")

    level = fields.Method("get_level")
    display_name = fields.Method("get_display_name")

    def get_level(self, instance):
        """
        Retrieve the level attribute from the given instance.

        Args:
          instance (dict): A dictionary representing the instance, which is expected to have an "attributes" key.

        Returns:
          int: The level value extracted from the instance's attributes. Defaults to 0 if not found.
        """
        return int(instance.get("attributes", {}).get("level", [0])[0] or 0)

    def get_display_name(self, instance):
        """
        Retrieve the display name of the group from the given instance.

        Args:
          instance (dict): A dictionary representing the group instance,
                   which should contain an "attributes" key.

        Returns:
          str: The display name of the group. If the display name is not
             found, an empty string is returned.
        """
        return instance.get("attributes", {}).get("display_name", [""])[0] or ""

    def get_path(self, instance):
        """Format the path of the group from keycloak"""
        path = instance["path"]
        return path[1:len(path)]
