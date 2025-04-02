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
from typing import Dict

from api.exceptions import BadRequestError, ResourceNotFoundError
from api.models import WorkIssueUpdates as WorkIssueUpdatesModel
from api.models import WorkIssues as WorkIssuesModel
from api.utils import TokenInfo
from api.utils.roles import Role as KeycloakRole, Membership
from api.services import authorisation
from api.models.queries import WorkIssueQuery
from api.models.special_field import EntityEnum, FieldTypeEnum


class WorkIssuesService:  # pylint: disable=too-many-public-methods
    """Service to manage work status related operations."""

    # pylint: disable=too-few-public-methods,

    @classmethod
    def find_all_work_issues(cls, work_id):
        """Find all issues related to a work"""
        work_issues = WorkIssuesModel.list_issues_for_work_id(work_id)
        return work_issues

    @classmethod
    def find_work_issue_by_id(cls, issue_id):
        """Find all status related to a work"""
        return WorkIssuesModel.find_by_id(issue_id)

    @classmethod
    def find_work_issues_by_work_ids(cls, work_ids):
        """Find all work issues by work ids"""
        results = WorkIssueQuery.find_work_issues_by_work_ids(work_ids)
        return results

    @classmethod
    def create_work_issue_and_updates(cls, work_id, issue_data: Dict):
        """Create a new work issue and its updates."""
        updates = issue_data.pop('updates', [])

        cls._check_create_auth(work_id)

        new_work_issue = WorkIssuesModel(**issue_data,
                                         work_id=work_id
                                         )
        new_work_issue.save()

        cls.create_special_fields(
            new_work_issue.id,
            new_work_issue.is_active,
            new_work_issue.start_date
        )

        for update_description in updates:
            new_update = WorkIssueUpdatesModel(
                description=update_description,
                posted_date=issue_data.get('start_date')
            )
            new_update.work_issue_id = new_work_issue.id
            new_update.save()

        return new_work_issue

    @classmethod
    def add_work_issue_update(cls, work_id, issue_id, data: dict):
        """Add a new description to the existing Issue."""
        work_issues = WorkIssuesModel.find_by_params({"work_id": work_id,
                                                      "id": issue_id})
        if not work_issues:
            raise ResourceNotFoundError("Work issue not found. It may be inactive.")

        work_issue = work_issues[0]
        work_issue_id = work_issue.id

        cls._check_create_auth(work_id)

        cls._check_update_date_validity(work_issue, data)

        new_update = WorkIssueUpdatesModel(
            description=data.get('description'),
            posted_date=data.get('posted_date')
        )
        new_update.work_issue_id = work_issue_id
        new_update.save()
        return WorkIssuesModel.find_by_id(issue_id)

    @classmethod
    def _check_create_auth(cls, work_id):
        """Check if user has create role or is team member"""
        one_of_roles = (
            Membership.TEAM_MEMBER.value,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

    @classmethod
    def approve_work_issues(cls, issue_id, update_id):
        """Approve a work status."""
        results = WorkIssueUpdatesModel.find_by_params({"id": update_id, "work_issue_id": issue_id})
        if not results:
            raise ResourceNotFoundError("Work issue Description doesnt exist")

        work_issue_update: WorkIssueUpdatesModel = results[0]

        cls._check_edit_auth(work_issue_update.work_issue.work_id)

        work_issue_update.is_approved = True
        work_issue_update.approved_by = TokenInfo.get_username()

        work_issue_update.save()

        return work_issue_update

    @classmethod
    def _check_valid_issue_edit_data(cls, new_data, work_issue_db):
        """Check if the issue data is valid for editing"""
        if new_data.get('expected_resolution_date'):
            if new_data.get('start_date').timestamp() > new_data.get('expected_resolution_date').timestamp():
                raise BadRequestError('expected resolution date cannot be before the start date')

        earliest_issue_update_date = min(update.posted_date for update in work_issue_db.updates)
        if new_data.get('start_date').timestamp() > earliest_issue_update_date.timestamp():
            raise BadRequestError('issue start date cannot be after an update date')

    @classmethod
    def edit_issue(cls, work_id, issue_id, issue_data):
        """Edit an existing work issue, and save it only if there are changes."""
        work_issue = WorkIssuesService.find_work_issue_by_id(issue_id)

        if not work_issue:
            raise ResourceNotFoundError("Work issue doesnt exist")
        cls._check_edit_auth(work_id)
        cls._check_valid_issue_edit_data(issue_data, work_issue)

        # If work_issue.is_active has been updated log in special history
        if work_issue.is_active != issue_data.get('is_active'):
            cls.create_special_fields(
                issue_id,
                issue_data.get('is_active'),
                datetime.now(timezone.utc)
            )

        # If work_issue.start_date has been updated update the original special field entry
        if work_issue.start_date != issue_data.get('start_date'):
            cls.update_special_field(
                issue_id,
                issue_data.get('start_date'),
            )

        # Create a flag to track changes on work_issues
        has_changes_to_work_issue = False

        for key, value in issue_data.items():
            if getattr(work_issue, key) != value:
                setattr(work_issue, key, value)
                has_changes_to_work_issue = True
        if has_changes_to_work_issue:
            work_issue.save()
        return work_issue

    @classmethod
    def _check_edit_auth(cls, work_id):
        """Check if user has edit role or is team member"""
        one_of_roles = (
            Membership.TEAM_MEMBER.value,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

    @classmethod
    def edit_issue_update(cls, issue_id, issue_update_id, issue_update_data):
        """Edit an existing work issue update."""
        work_issue = WorkIssuesService.find_work_issue_by_id(issue_id)

        if not work_issue:
            raise ResourceNotFoundError("Work issue doesnt exist")

        issue_update: WorkIssueUpdatesModel = WorkIssueUpdatesModel.find_by_id(issue_update_id)

        if not issue_update:
            raise ResourceNotFoundError("Issue Description doesnt exist")

        cls._check_edit_update_auth(work_issue.work_id, issue_update)
        cls._check_update_date_validity(work_issue, issue_update_data, issue_update.id)

        issue_update.description = issue_update_data.get('description')
        issue_update.posted_date = issue_update_data.get('posted_date')
        issue_update.save()

        return issue_update

    @classmethod
    def _check_edit_update_auth(cls, work_id, issue_update):
        """Check if user can edit issue update"""
        if issue_update.is_approved:
            one_of_roles = (
                KeycloakRole.EXTENDED_EDIT.value,
            )
            authorisation.check_auth(one_of_roles=one_of_roles)
        else:
            cls._check_edit_auth(work_id)

    @classmethod
    def _check_update_date_validity(cls, work_issue, update_data, issue_update_id=None):
        """Check if edited date is valid"""
        if update_data.get('posted_date').timestamp() < work_issue.start_date.timestamp():
            raise BadRequestError('posted date cannot be before the work issue start date')

        other_approved_updates_dates = [
            update.posted_date for update in work_issue.updates
            if update.id != issue_update_id and update.is_approved
        ]
        if other_approved_updates_dates:
            if update_data.get('posted_date').timestamp() <= max(other_approved_updates_dates).timestamp():
                raise BadRequestError('posted date must be greater than last update')

        other_unapproved_updates_dates = [
            update.posted_date for update in work_issue.updates
            if update.id != issue_update_id and not update.is_approved
        ]
        if other_unapproved_updates_dates:
            if update_data.get('posted_date').timestamp() >= max(other_unapproved_updates_dates).timestamp():
                raise BadRequestError('Cannot exceed the posted date of a pending unapproved update')

    @classmethod
    def create_special_fields(cls, entity_id, is_active, active_from):
        """Create special fields for work issue"""
        # pylint: disable=import-outside-toplevel,cyclic-import
        from api.services.special_field import SpecialFieldService
        work_issue_special_field_data = {
            "entity": EntityEnum.ISSUE.value,
            "entity_id": entity_id,
            "field_name": "is_active",
            "field_value": is_active,
            "active_from": active_from,
            "field_type": FieldTypeEnum.BOOLEAN.value,
        }
        SpecialFieldService.create_special_field_entry(
            work_issue_special_field_data, commit=False
        )

    @classmethod
    def update_special_field(cls, entity_id, active_from):
        """Update the special entry field"""
        # pylint: disable=import-outside-toplevel,cyclic-import
        from api.services.special_field import SpecialFieldService
        params = {
            "entity": EntityEnum.ISSUE.value,
            "entity_id": entity_id,
            "field_name": "is_active",
            "field_type": FieldTypeEnum.BOOLEAN.value,
        }
        # Get all special field entries for the work issue
        entries = SpecialFieldService.find_all_by_params(params)
        # No entries found, nothing to update
        if not entries:
            return
        first_entry = min(entries, key=lambda x: x.created_at)
        work_issue_special_field_data = {
            "entity": EntityEnum.ISSUE.value,
            "entity_id": entity_id,
            "field_name": "is_active",
            "active_from": active_from,
        }
        # Update the entry with the updated start date
        SpecialFieldService.update_special_field_entry(
            first_entry.id, work_issue_special_field_data, commit=False
        )
