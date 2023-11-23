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
from http import HTTPStatus
from typing import Dict

from api.exceptions import BusinessError
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
    def create_work_status(cls, work_id, work_status: Dict):
        """Creates a work status."""
        work_status = WorkStatusModel(
            **work_status,
            posted_by=TokenInfo.get_username(),
            work_id=work_id
        )
        work_status.save()

        return work_status

    @classmethod
    def update_work_status(cls, work_status: WorkStatusModel, work_status_data: dict):
        """Update an existing work status."""
        # TODO Add Super user check
        if work_status.is_approved:
            if not TokenInfo.is_super_user():
                raise BusinessError("Access Denied", HTTPStatus.UNAUTHORIZED)

        work_status.update(work_status_data)

        work_status.save()

        return work_status

    @classmethod
    def approve_work_status(cls, work_status):
        """Approve a work status."""
        if work_status.is_approved:
            return work_status

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_status.work_id)

        work_status.is_approved = True
        work_status.approved_by = TokenInfo.get_username()

        work_status.save()

        return work_status
