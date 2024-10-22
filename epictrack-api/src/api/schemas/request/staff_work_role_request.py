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
"""Input validation for staff work role"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema, RequestPathParameterSchema, RequestQueryParameterSchema


class StaffWorkExistenceCheckQueryParamSchema(RequestQueryParameterSchema):
    """StaffWork Existence check query parameter"""

    staff_id = fields.Int(
        metadata={"description": "Staff ID"},
        required=True,
        validate=validate.Range(min=1)
    )

    role_id = fields.Int(
        metadata={"description": "Role ID"},
        required=True,
        validate=validate.Range(min=1)
    )

    work_staff_id = fields.Int(
        metadata={"description": "Id"},
        load_default=None
    )


class StaffWorkPathParamSchema(RequestPathParameterSchema):
    """StaffWork path parameter schema"""

    work_staff_id = fields.Int(
        metadata={"description": "Staff Work Id"},
        validate=validate.Range(min=1),
        required=True
    )


class StaffWorkBodyParamSchema(RequestBodyParameterSchema):
    """StaffWork body parameter schema"""

    staff_id = fields.Int(
        metadata={"description": "Staff ID"},
        required=True,
        validate=validate.Range(min=1)
    )

    role_id = fields.Int(
        metadata={"description": "Role ID"},
        required=True,
        validate=validate.Range(min=1)
    )

    is_active = fields.Bool(
        metadata={"description": "Staff Work assocation is active or not"},
        required=True
    )
