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
"""User response schema"""
from marshmallow import Schema, fields

from .user_group_response import UserGroupResponseSchema


class UserResponseSchema(Schema):
    """User response schema"""

    id = fields.Str(metadata={"description": "Id of the user"})

    first_name = fields.Str(
        metadata={"description": "First name of the user"}, attribute="firstName"
    )

    last_name = fields.Str(
        metadata={"description": "Last name of the user"}, attribute="lastName"
    )

    email = fields.Str(
        metadata={"description": "Email of the user"},
    )

    group = fields.Nested(UserGroupResponseSchema)
