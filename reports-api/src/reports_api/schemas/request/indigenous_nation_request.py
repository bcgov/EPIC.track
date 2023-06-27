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
"""Indigenous nation resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class IndigenousNationBodyParameterSchema(RequestBodyParameterSchema):
    """IndigenousNation request body schema"""

    name = fields.Str(
        description="Name of indigenous nation",
        validate=validate.Length(max=150),
        required=True,
    )

    relationship_holder_id = fields.Int(
        description="Relationship holder id of the indigenous nation",
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )

    is_active = fields.Bool(description="Active state of the indigenous nation")


class IndigenousNationExistenceQueryParamSchema(RequestQueryParameterSchema):
    """IndigenousNation existance check query parameters"""

    name = fields.Str(
        description='Name of the indigenous nation',
        validate=validate.Length(max=150),
        required=True
    )

    indigenous_nation_id = fields.Int(
        description='The id of the indigenous nation',
        validate=validate.Range(min=1),
        missing=None
    )


class IndigenousNationIdPathParameterSchema(RequestPathParameterSchema):
    """Indigenous nation id path parameter schema"""

    indigenous_nation_id = fields.Int(
        description='The id of the indigenous nation',
        validate=validate.Range(min=1),
        required=True
    )
