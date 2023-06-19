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
"""Staff resource's input validations"""
from marshmallow import fields, validate
from reports_api.schemas.validators import Phone

from .base import (RequestBodyParameterSchema, RequestPathParameterSchema,
                   RequestQueryParameterSchema)
from .custom_fields import IntegerList


class StaffIdPathParameterSchema(RequestPathParameterSchema):
    """Staff id path parameter schema"""

    staff_id = fields.Int(
        description='The id of the staff',
        validate=validate.Range(min=1),
        required=True
    )


class StaffExistanceQueryParamSchema(RequestQueryParameterSchema):
    """Staff existance check query parameters"""

    email = fields.Str(
        description='Email address of the staff',
        validate=validate.Email(),
        required=True
    )

    staff_id = fields.Int(
        description='The id of the staff',
        validate=validate.Range(min=1),
        required=True
    )


class StaffByPositionsQueryParamSchema(RequestQueryParameterSchema):
    """Staff by positions query parameter"""

    positions = IntegerList(
        description='comma separated position ids'
    )


class StaffBodyParameterSchema(RequestBodyParameterSchema):
    """Staff request body schema"""

    first_name = fields.Str(
        description='First name of staff',
        validate=validate.Length(max=150),
        required=True
    )

    last_name = fields.Str(
        description='Last name of staff',
        validate=validate.Length(max=150),
        required=True
    )

    email = fields.Str(
        description='Email address of the staff',
        validate=validate.Email(),
        required=True
    )

    phone = fields.Str(
        description='Phone number of staff',
        validate=Phone(),
        required=True
    )

    position_id = fields.Int(
        description='Position id of the staff',
        validate=validate.Range(min=1),
        required=True
    )
