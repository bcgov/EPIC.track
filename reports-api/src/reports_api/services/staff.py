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
from reports_api.schemas import StaffSchema


class StaffService:
    """Service to manage Staff related operations."""

    @classmethod
    def find_by_position_id(cls, position_id):
        """Find staff by position."""
        current_app.logger.debug(f"Find staff by position : {position_id}")
        staffs_schema = StaffSchema(many=True)
        staffs = Staff.find_active_staff_by_position(position_id)
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def find_by_position_ids(cls, position_ids):
        """Find staffs by position ids."""
        current_app.logger.debug(f"Find staff by positions : {position_ids}")
        staffs_schema = StaffSchema(many=True)
        staffs = Staff.find_active_staff_by_positions(position_ids)
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def find_all_active_staff(cls):
        """Find all staffs."""
        staffs_schema = StaffSchema(many=True)
        staffs = Staff.find_all_active_staff()
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def find_all_non_deleted_staff(cls):
        """Find all non-deleted staff"""
        staffs_schema = StaffSchema(many=True)
        staffs = Staff.find_all_non_deleted_staff()
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def create_staff(cls, payload: dict):
        """Create a new staff."""
        staff = Staff(**payload)
        current_app.logger.info(f"Staff obj {dir(staff)}")
        staff.save()
        return staff

    @classmethod
    def update_staff(cls, staff_id: int, payload: dict):
        """Update existing staff."""
        staff = Staff.find_by_id(staff_id)
        staff = staff.update(payload)
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
        staff_schema = StaffSchema()
        staff = Staff.find_by_id(_id)
        response = None
        if staff:
            response = {"staff": staff_schema.dump(staff)}
        return response

    @classmethod
    def check_existence(cls, first_name, last_name, instance_id=None):
        """Checks if a staff exists with given first name and last name"""
        return Staff.check_existence(first_name, last_name, instance_id)
