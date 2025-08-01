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
from datetime import datetime, timezone
from typing import Dict, Optional

from api.exceptions import BadRequestError, ResourceNotFoundError
from api.models.dashboard_search_options import StatusDashboardSearchOptions
from api.models.pagination_options import PaginationOptions
from api.models import WorkStatus as WorkStatusModel
from api.models import Work
from api.utils import TokenInfo
from api.utils.roles import Membership
from api.services import authorisation
from api.schemas.response import WorkStatusResponseSchema
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
    def fetch_status_for_all_works(
            cls,
            pagination_options: PaginationOptions,
            search_options: StatusDashboardSearchOptions):
        """Fetch all latest work statuses for all works."""
        works, _ = Work.fetch_all_works_by_work_status(None, search_options)
        work_ids = [work.id for work in works]

        work_statuses = WorkStatusModel.list_latest_status_for_work_ids(work_ids)
        approved_status_histories = WorkStatusModel.list_statuses_for_work_ids(work_ids)

        schema = WorkStatusResponseSchema()

        filtered = []
        for work in works:
            status = work_statuses.get(work.id)
            if (
                search_options.is_approved
                and (not status or str(status.is_approved).lower() not in search_options.is_approved)
            ):
                continue
            if search_options.staleness and status:
                status_staleness = schema.get_staleness(status)
                if status_staleness not in search_options.staleness:
                    continue

            filtered.append((work, status))

        # Apply pagination to filtered results
        if pagination_options.sort_key:
            sort_key = pagination_options.sort_key
            reverse = pagination_options.sort_order == "desc"
            filtered.sort(
                key=lambda item: getattr(item[1], sort_key, None) if item[1] else datetime.min.replace(tzinfo=timezone.utc),
                reverse=reverse
            )
        total = len(filtered)
        page = pagination_options.page or 1
        size = pagination_options.size or total
        start = (page - 1) * size
        end = start + size
        paginated_filtered = filtered[start:end]

        serialized = []
        for work, status in paginated_filtered:
            history = approved_status_histories.get(work.id, [])
            serialized.append(cls._serialize_status(work, status, history))

        return {"items": serialized, "total": total}

    @staticmethod
    def _serialize_status(work: Work, status: Optional[WorkStatusModel], status_history: Optional[list[WorkStatusModel]]) -> Dict:
        """Serialize the status info for a single work."""
        return {
            "work_id": work.id,
            "work_name": work.title,
            "project_name": work.project.name if work.project else None,
            "work_type": work.work_type.name if work.work_type else None,
            "project_is_active": work.project.is_active if work.project else None,
            "work_is_active": work.is_active,
            "status": WorkStatusResponseSchema(many=False).dump(status) if status else None,
            "status_history": WorkStatusResponseSchema(many=True).dump(
                status_history if status_history else []
            ),
        }

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
