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
from marshmallow import EXCLUDE, fields

from epictrack_api.models import Event
from epictrack_api.schemas.base import AutoSchemaBase
from .event_configuration_response import EventConfigurationResponseSchema


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
