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
"""Responsibility response schema"""
from datetime import datetime

from marshmallow import EXCLUDE, fields

from api.models import SpecialField
from api.schemas.base import AutoSchemaBase
from api.utils.constants import CANADA_TIMEZONE


class SpecialFieldResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """SpecialField response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = SpecialField
        include_fk = True
        unknown = EXCLUDE
        exclude = ("time_range",)

    entity = fields.Method("get_entity")
    active_from = fields.Method("get_active_from")
    active_to = fields.Method("get_active_to")
    active_from_day = fields.Method("get_active_from_day")
    active_to_day = fields.Method("get_active_to_day")
    field_type = fields.Method("get_field_type")

    def get_entity(self, obj: SpecialField) -> str:
        """Get the entity name"""
        return obj.entity.value

    def get_active_from(self, obj: SpecialField) -> datetime:
        """Get the active from date"""
        return obj.time_range.lower.isoformat()

    def get_active_to(self, obj: SpecialField) -> datetime:
        """Get the active to date"""
        return obj.time_range.upper.isoformat() if obj.time_range.upper else None

    def get_active_from_day(self, obj: SpecialField) -> str:
        """Get the Pacific day the entry starts on, so clients need no timezone arithmetic"""
        return self._pacific_day(obj.time_range.lower)

    def get_active_to_day(self, obj: SpecialField) -> str:
        """Get the Pacific day of the entry's end"""
        return self._pacific_day(obj.time_range.upper)

    @staticmethod
    def _pacific_day(instant: datetime) -> str:
        """Return the Pacific calendar day of an instant as YYYY-MM-DD, or None"""
        return instant.astimezone(CANADA_TIMEZONE).date().isoformat() if instant else None

    def get_field_type(self, obj: SpecialField) -> str:
        """Get the field type"""
        return obj.field_type.value
