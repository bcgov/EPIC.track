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
"""User group request schema"""
from marshmallow import fields
from .base import RequestBodyParameterSchema, RequestPathParameterSchema


class UserGroupBodyParamSchema(RequestBodyParameterSchema):
    """User group body parameter schema"""

    group_id_to_update = fields.Str(
        metadata={"description": "Group id to be updated"},
        required=True
    )

    existing_group_id = fields.Str(
        metadata={"description": "Existing group id of the user"},
    )


class UserGroupPathParamSchema(RequestPathParameterSchema):
    """User group path parameter schema"""

    user_id = fields.UUID(
        metadata={"description": "Id of the user"},
        required=True
    )
