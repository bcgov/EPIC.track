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
from reports_api.exceptions import ResourceExistsError, ResourceNotFoundError

from reports_api.models import Staff
from reports_api.schemas.response import StaffResponseSchema


class StaffService:
    """Service to manage Staff related operations."""

    @classmethod
    def find_by_position_id(cls, position_id):
        """Find staff by position."""
        current_app.logger.debug(f"Find staff by position : {position_id}")
        staffs_schema = StaffResponseSchema(many=True)
        staffs = Staff.find_active_staff_by_position(position_id)
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def find_by_position_ids(cls, position_ids):
        """Find staffs by position ids."""
        current_app.logger.debug(f"Find staff by positions : {position_ids}")
        staffs = Staff.find_active_staff_by_positions(position_ids)
        return staffs

    @classmethod
    def find_all_active_staff(cls):
        """Find all staffs."""
        staffs_schema = StaffResponseSchema(many=True)
        staffs = Staff.find_all_active_staff()
        response = {"staffs": staffs_schema.dump(staffs)}
        return response

    @classmethod
    def find_all_non_deleted_staff(cls):
        """Find all non-deleted staff"""
        staffs = Staff.find_all_non_deleted_staff()
        return staffs

    @classmethod
    def create_staff(cls, payload: dict):
        """Create a new staff."""
        exists = cls.check_existence(payload["email"])
        if exists:
            raise ResourceExistsError("Staff with same email already exists")
        staff = Staff(**payload)
        current_app.logger.info(f"Staff obj {dir(staff)}")
        staff.save()
        return staff

    @classmethod
    def update_staff(cls, staff_id: int, payload: dict):
        """Update existing staff."""
        exists = cls.check_existence(payload["email"], staff_id)
        if exists:
            raise ResourceExistsError("Staff with same email already exists")
        staff = Staff.find_by_id(staff_id)
        if not staff:
            raise ResourceNotFoundError(f"Staff with id '{staff_id}' not found")
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
        staff = Staff.find_by_id(_id)
        return staff

    @classmethod
    def check_existence(cls, email, staff_id=None):
        """Checks if a staff exists with given email address"""
        return Staff.check_existence(email, staff_id)
