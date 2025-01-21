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
"""Service to manage Work status."""
from datetime import datetime
from typing import Dict

from api.exceptions import BadRequestError, ResourceNotFoundError
from api.models import WorkStatus as WorkStatusModel
from api.utils import TokenInfo
from api.utils.roles import Membership
from api.services import authorisation
from api.utils.roles import Role as KeycloakRole


class WorkStatusService:  # pylint: disable=too-many-public-methods
    """Service to manage work status related operations."""

    # pylint: disable=too-few-public-methods,

    @classmethod
    def find_all_work_status(cls, work_id):
        """Find all status related to a work"""
        return WorkStatusModel.list_statuses_for_work_id(work_id)

    @classmethod
    def find_work_status_by_id(cls, work_id, status_id):
        """Find all status related to a work"""
        results = WorkStatusModel.find_by_params({"work_id": work_id, "id": status_id})
        return results[0] if results else None

    @classmethod
    def _check_update_date_validity(cls, work_id, update_data, status_update_id=None):
        """Check if edited date is valid"""
        work_statuses = cls.find_all_work_status(work_id)

        other_approved_updates_dates = [
            update.posted_date for update in work_statuses
            if update.id != status_update_id and update.is_approved
        ]
        if other_approved_updates_dates:
            if update_data.get('posted_date').timestamp() <= max(other_approved_updates_dates).timestamp():
                raise BadRequestError('posted date must be greater than last update')

        other_unapproved_updates_dates = [
            update.posted_date for update in work_statuses
            if update.id != status_update_id and not update.is_approved
        ]
        if other_unapproved_updates_dates:
            if update_data.get('posted_date').timestamp() >= max(other_unapproved_updates_dates).timestamp():
                raise BadRequestError('Cannot exceed the posted date of a pending unapproved update')

    @classmethod
    def create_work_status(cls, work_id, work_status_data: Dict):
        """Creates a work status."""
        cls._check_create_auth(work_id)
        cls._check_update_date_validity(work_id, work_status_data)

        work_status = WorkStatusModel(
            **work_status_data,
            posted_by=TokenInfo.get_username(),
            work_id=work_id
        )
        work_status.save()

        return work_status

    @classmethod
    def _check_create_auth(cls, work_id):
        """Check if user can create"""
        one_of_roles = (
            Membership.TEAM_MEMBER.value,
            KeycloakRole.CREATE.value
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

    @classmethod
    def update_work_status(cls, work_id, status_id, work_status_data: dict):
        """Update an existing work status."""
        work_status = cls.find_work_status_by_id(work_id, status_id)
        if work_status is None:
            raise ResourceNotFoundError("Work status not found")

        cls._check_update_work_status_auth(work_status)
        cls._check_update_date_validity(work_id, work_status_data, status_id)

        work_status.update(work_status_data)

        work_status.save()

        return work_status

    @classmethod
    def _check_update_work_status_auth(cls, work_status):
        """Check if user can edit work status"""
        if work_status.is_approved:
            one_of_roles = (
                KeycloakRole.EXTENDED_EDIT.value,
            )
            authorisation.check_auth(one_of_roles=one_of_roles)
        else:
            cls._check_edit_auth(work_status.work_id)

    @classmethod
    def approve_work_status(cls, work_status):
        """Approve a work status."""
        if work_status.is_approved:
            return work_status

        cls._check_edit_auth(work_status.work_id)

        work_status.is_approved = True
        work_status.approved_by = TokenInfo.get_username()
        work_status.approved_date = datetime.utcnow()

        work_status.save()

        return work_status

    @classmethod
    def _check_edit_auth(cls, work_id):
        """Check if user has edit role or is team member"""
        one_of_roles = (
            Membership.TEAM_MEMBER.value,
            KeycloakRole.EDIT.value
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)
