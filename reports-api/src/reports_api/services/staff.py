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
from sqlalchemy import func

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
    def find_by_position_ids(cls, position_ids):
        """Find staffs by position ids."""
        current_app.logger.debug(f'Find staff by positions : {position_ids}')

        response = {'staffs': []}
        for row in Staff.find_active_staff_by_positions(position_ids):
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
    def find_all_non_deleted_staff(cls):
        """Find all non-deleted staff"""
        response = {'staffs': []}
        for row in Staff.find_all_non_deleted_staff():
            response['staffs'].append(row.as_dict())
        return response

    @classmethod
    def create_staff(cls, payload: dict):
        """Create a new staff."""
        staff = Staff(**payload)
        current_app.logger.info(f'Staff obj {dir(staff)}')
        staff.save()
        return staff

    @classmethod
    def update_staff(cls, staff_id: int, payload: dict):
        """Update existing staff."""
        staff = Staff.find_by_id(staff_id)
        staff.first_name = payload['first_name']
        staff.last_name = payload['last_name']
        staff.email = payload['email']
        staff.position_id = payload['position_id']
        staff.phone = payload['phone']
        staff.is_active = payload['is_active']
        Staff.commit()
        return staff

    @classmethod
    def delete_staff(cls, staff_id: int):
        """Delete staff by id."""
        staff = Staff.find_by_id(staff_id)
        staff.is_deleted = True
        Staff.commit()
        return True

    @classmethod
    def find_by_id(cls, _id):
        """Find staff by id."""
        response = {'staff': None}
        staff = Staff.find_by_id(_id)
        if staff:
            response['staff'] = staff.as_dict()
        return response

    @classmethod
    def check_existence(cls, first_name, last_name, instance_id):
        """Checks if a staff exists with given first name and last name"""
        query = Staff.query.filter(
                    func.lower(Staff.last_name) == func.lower(last_name), func.lower(
                        Staff.first_name) == func.lower(first_name), Staff.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(Staff.id != instance_id)
        if query.count() > 0:
            return {"exists": True}
        return {"exists": False}
