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
"""Event Template Response response schema"""
from marshmallow import EXCLUDE, fields

from api.models import EventConfiguration
from api.schemas.base import AutoSchemaBase


class EventConfigurationResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Task model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = EventConfiguration
        include_fk = True
        unknown = EXCLUDE
    event_position = fields.Method("get_event_position")

    visibility = fields.Method("get_visibility")

    def get_visibility(self, obj: EventConfiguration) -> str:
        """Return value for the visibility"""
        return obj.visibility if isinstance(obj.visibility, str) else obj.visibility.value

    def get_event_position(self, obj: EventConfiguration) -> str:
        """Return the work state"""
        return obj.event_position if isinstance(obj.event_position, str) else obj.event_position.value
