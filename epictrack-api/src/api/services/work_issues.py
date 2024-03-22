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
from typing import Dict

from api.exceptions import BadRequestError, ResourceNotFoundError
from api.models import WorkIssueUpdates as WorkIssueUpdatesModel
from api.models import WorkIssues as WorkIssuesModel
from api.utils import TokenInfo
from api.utils.roles import Role as KeycloakRole, Membership
from api.services import authorisation


class WorkIssuesService:  # pylint: disable=too-many-public-methods
    """Service to manage work status related operations."""

    # pylint: disable=too-few-public-methods,

    @classmethod
    def find_all_work_issues(cls, work_id):
        """Find all issues related to a work"""
        work_issues = WorkIssuesModel.list_issues_for_work_id(work_id)
        return work_issues

    @classmethod
    def find_work_issue_by_id(cls, work_id, issue_id):
        """Find all status related to a work"""
        results = WorkIssuesModel.find_by_params({"work_id": work_id, "id": issue_id})
        return results[0] if results else None

    @classmethod
    def create_work_issue_and_updates(cls, work_id, issue_data: Dict):
        """Create a new work issue and its updates."""
        updates = issue_data.pop('updates', [])

        cls._check_create_auth(work_id)

        new_work_issue = WorkIssuesModel(**issue_data,
                                         work_id=work_id
                                         )
        new_work_issue.save()

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
        work_issue = work_issues[0]
        work_issue_id = work_issue.id

        cls._check_create_auth(work_id)

        if not work_issues:
            raise ResourceNotFoundError("Work Issues not found")

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
            Membership.TEAM_MEMBER.name,
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
    def edit_issue(cls, work_id, issue_id, issue_data):
        """Edit an existing work issue, and save it only if there are changes."""
        work_issue = WorkIssuesService.find_work_issue_by_id(work_id, issue_id)

        if not work_issue:
            raise ResourceNotFoundError("Work issue doesnt exist")

        cls._check_edit_auth(work_id)

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
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

    @classmethod
    def edit_issue_update(cls, work_id, issue_id, issue_update_id, issue_update_data):
        """Edit an existing work issue update."""
        work_issue = WorkIssuesService.find_work_issue_by_id(work_id, issue_id)

        if not work_issue:
            raise ResourceNotFoundError("Work issue doesnt exist")

        issue_update: WorkIssueUpdatesModel = WorkIssueUpdatesModel.find_by_id(issue_update_id)

        if not issue_update:
            raise ResourceNotFoundError("Issue Description doesnt exist")

        cls._check_edit_update_auth(work_issue.id, issue_update)
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
        if update_data.get('posted_date') < work_issue.start_date:
            raise BadRequestError('posted date cannot be before the work issue start date')

        other_approved_updates_dates = [
            update.posted_date for update in work_issue.updates
            if update.id != issue_update_id and update.is_approved
        ]
        if not other_approved_updates_dates:
            return

        if update_data.get('posted_date') <= max(other_approved_updates_dates):
            raise BadRequestError('posted date must be greater than last update')

        other_unapproved_updates_dates = [
            update.posted_date for update in work_issue.updates
            if update.id != issue_update_id and not update.is_approved
        ]

        if not other_unapproved_updates_dates:
            return

        if update_data.get('posted_date') >= max(other_unapproved_updates_dates):
            raise BadRequestError('Cannot exceed the posted date of a pending unapproved update')

