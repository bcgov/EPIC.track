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
from datetime import date, datetime, time

from marshmallow import EXCLUDE, fields, validate, validates_schema, ValidationError

from api.models.special_field import EntityEnum, FieldTypeEnum
from api.utils.constants import CANADA_TIMEZONE

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class SpecialHistoryStart(fields.Field):
    """The start of a history entry: Pacific midnight of the day the client sent.

    The server decides the instant, so the browser's timezone and time of day are never
    stored. A plain YYYY-MM-DD is that day. A datetime with an offset, as older clients
    send, is read as the Pacific day it falls on.
    """

    default_error_messages = {"invalid": "Not a valid date. Use YYYY-MM-DD."}

    def _deserialize(self, value, attr, data, **kwargs) -> datetime:
        """Return Pacific midnight of the day the value stands for."""
        if not isinstance(value, str):
            raise self.make_error("invalid")
        try:
            if len(value) == 10:
                day = date.fromisoformat(value)
            else:
                instant = datetime.fromisoformat(value)
                if instant.tzinfo is None:
                    raise self.make_error("invalid")
                day = instant.astimezone(CANADA_TIMEZONE).date()
        except (ValueError, OverflowError) as error:
            raise self.make_error("invalid") from error
        return CANADA_TIMEZONE.localize(datetime.combine(day, time.min))


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
        required=False,
    )

    field_name = fields.Str(
        metadata={"description": "Name of the special field"},
        validate=validate.Length(max=150),
        required=True,
    )

    field_value = fields.Str(
        metadata={"description": "Value of the special field"},
        validate=validate.Length(min=1),
        required=False,
    )

    @validates_schema
    def validate_field_or_entity(self, data, **_kwargs):
        """Validated that either field_value or entity_id is provided"""
        if not data.get("field_value") and not data.get("entity_id"):
            raise ValidationError("Either 'field_value' or 'entity_id' must be provided.")


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

    active_from = SpecialHistoryStart(
        metadata={"description": "First day the entry applies, YYYY-MM-DD"}, required=True
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
