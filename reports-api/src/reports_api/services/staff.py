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
"""Service to manage Staffs."""

from flask import current_app

from reports_api.models import Staff


class StaffService:
    """Service to manage Fee related operations."""

    @classmethod
    def find_by_position_id(cls, position_id):
        """Find staff by position."""
        current_app.logger.debug(f'Find staff by position : {position_id}')

        response = {'staffs': []}
        for row in Staff.find_active_staff_by_position(position_id):
            response['staffs'].append(row.as_dict())

        current_app.logger.debug('>find_code_values_by_type')
        return response

    @classmethod
    def find_all_active_staff(cls):
        """Find all staffs."""
        response = {'staffs': []}
        for row in Staff.find_all_active_staff():
            response['staffs'].append(row.as_dict())
        return response

    @classmethod
    def find_by_id(cls, _id):
        """Find staff by id."""
        response = {'staff': None}
        staff = Staff.find_by_id(_id)
        if staff:
            response['staff'] = staff.as_dict()
        return response
