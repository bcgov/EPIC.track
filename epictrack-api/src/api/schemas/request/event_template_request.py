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
"""Event Template resource's input validations"""
from marshmallow import fields, validate

from .base import RequestBodyParameterSchema


class EventTemplateBodyParameterSchema(RequestBodyParameterSchema):
    """EventTemplate body schema"""

    name = fields.Str(
        metadata={"description": "Name of the event"},
        required=True
    )

    parent_id = fields.Int(
        metadata={"description": "parent event template id item"},
        allow_none=True
    )

    phase_id = fields.Int(
        metadata={"description": "Phase id of the event"},
        validate=validate.Range(min=1),
        required=True
    )

    event_type_id = fields.Int(
        metadata={"description": "Event type of the event template"},
        validate=validate.Range(min=1),
        required=True
    )

    event_category_id = fields.Int(
        metadata={"description": "Event category of the event template"},
        validate=validate.Range(min=1),
        required=True
    )

    start_at = fields.Str(
        metadata={"description": "Number of days after which the event to be started"}
    )

    number_of_days = fields.Int(
        metadata={"description": "Duration of the event"},
        allow_none=True
    )

    mandatory = fields.Bool(
        metadata={"description": "Indicate the event is a mandatory one or not"}
    )

    sort_order = fields.Int(
        metadata={"description": "Sort order of the event template item"}
    )

    event_position = fields.Str(
        metadata={"description": "position of the event in the phase"}
    )

    multiple_days = fields.Bool(
        metadata={"description": "Indicate if it is a multi day event"}
    )

    visibility = fields.Str(
        metadata={"description": "Indicate whether the event to be shown in the workplan or not"}
    )
