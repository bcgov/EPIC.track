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
"""Phase resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema


class PhaseBodyParameterSchema(RequestBodyParameterSchema):
    """Phase request body schema"""

    name = fields.Str(
        metadata={"description": "Name of phase"},
        validate=validate.Length(max=250),
        required=True,
    )

    work_type_id = fields.Int(
        metadata={"description": "Work type of the phase"},
        validate=validate.Range(min=1),
        required=True
    )

    ea_act_id = fields.Int(
        metadata={"description": "EA Act of the phase"},
        validate=validate.Range(min=1),
        required=True
    )

    number_of_days = fields.Int(
        metadata={"description": "Number of days of the phase"}
    )

    legislated = fields.Bool(
        metadata={"description": "Indicate if the phase is legislated or not"},
        required=True
    )

    sort_order = fields.Int(
        metadata={"description": "Order of the phase"}
    )

    color = fields.String(
        metadata={"dscription": "Color of the phase"},
        required=True
    )

    visibility = fields.String(
        metadata={"description": "Indicate if the phase is visible in the work plan"},
        required=True,
    )

    is_active = fields.Bool(
        metadata={"description": "Active state of the task"},
    )
