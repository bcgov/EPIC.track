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
"""Special field resource's input validations"""
from marshmallow import EXCLUDE, fields, validate

from api.models.special_field import EntityEnum, FieldTypeEnum

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class SpecialFieldQueryParamSchema(RequestQueryParameterSchema):
    """Special field query parameters"""

    entity = fields.Str(
        metadata={"description": "Entity name"},
        required=True,
        validate=validate.OneOf([x.value for x in EntityEnum]),
    )

    entity_id = fields.Int(
        metadata={"description": "The id of the entity"},
        validate=validate.Range(min=1),
        required=True,
    )

    field_name = fields.Str(
        metadata={"description": "Name of the special field"},
        validate=validate.Length(max=150),
        required=True,
    )


class SpecialFieldBodyParameterSchema(RequestBodyParameterSchema):
    """SpecialField request body schema"""

    entity = fields.Str(
        metadata={"description": "Entity name"},
        required=True,
        validate=validate.OneOf([x.value for x in EntityEnum]),
    )

    entity_id = fields.Int(
        metadata={"description": "The id of the entity"},
        validate=validate.Range(min=1),
        required=True,
    )

    field_name = fields.Str(
        metadata={"description": "Name of the special field"},
        validate=validate.Length(max=150),
        required=True,
    )

    field_value = fields.Str(
        metadata={"description": "Value of the special field"},
        validate=validate.Length(min=1),
        required=True,
    )

    active_from = fields.DateTime(
        metadata={"description": "Lower bound for time range"}, required=True
    )

    field_type = fields.Str(
        metadata={"description": "Type of the special field"},
        required=True,
        validate=validate.OneOf([x.value for x in FieldTypeEnum]),
    )

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta information"""

        unknown = EXCLUDE


class SpecialFieldIdPathParameterSchema(RequestPathParameterSchema):
    """Special field id path parameter schema"""

    special_field_id = fields.Int(
        metadata={"description": "The id of the special field entry"},
        validate=validate.Range(min=1),
        required=True,
    )
