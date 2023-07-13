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
"""ReminderConfiguration resource's input validations"""
from marshmallow import fields, validate

from .base import RequestQueryParameterSchema


class ReminderConfigurationExistenceQueryParamSchema(RequestQueryParameterSchema):
    """ReminderConfiguration request body schema"""

    reminder_type = fields.Str(
        metadata={"description": "Type of reminder configuration"},
        validate=validate.Length(max=150),
        required=True,
    )

    position_id = fields.Int(
        metadata={"description": "Position id for the reminder configuration"},
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )
    reminder_configuration_id = fields.Int(
        metadata={"description": "ID of the reminder configuration"},
        validate=validate.Range(min=1),
        allow_none=True,
        missing=None
    )
