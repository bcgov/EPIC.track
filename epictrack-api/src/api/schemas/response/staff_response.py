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
"""Staff response schema"""
from marshmallow import EXCLUDE, fields
from api.schemas.base import AutoSchemaBase
from api.schemas import PositionSchema
from api.models import Staff


class StaffResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staff response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Staff
        include_fk = True
        unknown = EXCLUDE

    full_name = fields.Method("get_full_name", dump_only=True)
    position = fields.Nested(PositionSchema(), dump_only=True)
    last_active_at = fields.Method("get_last_active_at", dump_only=True)

    def get_full_name(self, instance):
        """Get the full name"""
        return f"{instance.last_name}, {instance.first_name}"

    def get_last_active_at(self, instance):
        """Get the last active at"""
        if instance.last_active_at is None:
            return None
        return instance.last_active_at
