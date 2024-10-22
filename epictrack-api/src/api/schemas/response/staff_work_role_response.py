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
"""Staff Work Role response"""
from marshmallow import EXCLUDE, fields
from api.schemas.base import AutoSchemaBase
from api.schemas.response.staff_response import StaffResponseSchema
from api.schemas.response.role_response import RoleResponseSchema
from api.models import StaffWorkRole


class StaffWorkRoleResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staff response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = StaffWorkRole
        include_fk = True
        unknown = EXCLUDE
    staff = fields.Nested(StaffResponseSchema(), dump_only=True)
    role = fields.Nested(RoleResponseSchema(), dump_only=True)
