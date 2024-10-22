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
"""Base schema for path parameter validation"""
import json

from marshmallow import EXCLUDE
from marshmallow import Schema as MarshmallowSchema
from marshmallow import fields, pre_load

from api.exceptions import BadRequestError


class Schema(MarshmallowSchema):
    """Base Schema"""

    def handle_error(self, error, data, **kwargs):
        """Log and raise our custom exception when validation fails."""
        raise BadRequestError(json.dumps(error.messages))


class RequestPathParameterSchema(Schema):
    """Request path parameter schema base class"""


class RequestBodyParameterSchema(Schema):  # pylint: disable=too-few-public-methods
    """Request body parameter schema base class"""

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta"""

        unknown = EXCLUDE

    @pre_load
    def parse_empty_string(self, data, **kwargs):  # pylint: disable=unused-argument
        """Parse the input and convert empty strings to None for integer fields"""
        for field in data:
            if (
                data[field] == "" and isinstance(self.load_fields.get(field, None), fields.Integer)
            ):
                data[field] = None
        return data


class RequestQueryParameterSchema(Schema):
    """Request query parameter schema base class"""


class BasicRequestQueryParameterSchema(RequestQueryParameterSchema):
    """Request query parameter schema for basic query"""

    is_active = fields.Bool(
        metadata={"description": "Active/Inactive"},
    )
