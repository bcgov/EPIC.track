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
"""Service to manage SubTypes."""
from flask import current_app, jsonify

from reports_api.models import SubType
from reports_api.schemas.types import SubTypeSchema


class SubTypeService:  # pylint:disable=too-few-public-methods
    """Service to manage sub type related operations"""

    @classmethod
    def find_by_type_id(cls, type_id: int):
        """Find sub types by type_id"""
        current_app.logger.debug(f"find sub types by type_id {type_id}")
        sub_types = SubType.find_by_type_id(type_id)
        sub_types_schema = SubTypeSchema(many=True)
        return jsonify(sub_types_schema.dump(sub_types))
