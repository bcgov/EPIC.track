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
"""Event Response response schema"""
from marshmallow import EXCLUDE, Schema, fields

from api.models import Event
from api.schemas.base import AutoSchemaBase

from .event_configuration_response import EventConfigurationResponseSchema
from .work_response import WorkPhaseResponseSchema


class EventResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Event model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Event
        include_fk = True
        unknown = EXCLUDE
    event_configuration = fields.Nested(EventConfigurationResponseSchema(), dump_only=True)


class EventDateChangePosibilityCheckResponseSchema(Schema):
    """Schema to response the date check posibilty with the given event details"""

    work_phase_to_be_exceeded = fields.Nested(WorkPhaseResponseSchema)
    event = fields.Nested(EventResponseSchema)

    phase_end_push_required = fields.Boolean(
        metadata={"description": "Indicate if the end date of the phase will be pushed or not"}
    )

    subsequent_event_push_required = fields.Boolean(
        metadata={"description": "Indicate if the subsequent events needs to be pushed"}
    )

    days_pushed = fields.Number(
        metadata={"description": "Number of days to be pushed/pulled"}
    )
