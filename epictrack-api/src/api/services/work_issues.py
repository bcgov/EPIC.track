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
from typing import Dict, List

from api.exceptions import ResourceNotFoundError
from api.models import WorkIssueUpdates as WorkIssueUpdatesModel
from api.models import WorkIssues as WorkIssuesModel
from api.utils import TokenInfo


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

        new_work_issue = WorkIssuesModel(**issue_data,
                                         work_id=work_id
                                         )
        new_work_issue.save()

        for update_description in updates:
            new_update = WorkIssueUpdatesModel(description=update_description)
            new_update.work_issue_id = new_work_issue.id
            new_update.save()

        return new_work_issue

    @classmethod
    def add_work_issue_update(cls, work_id, issue_id, description_data: List[str]):
        """Add a new description to the existing Issue."""
        work_issues = WorkIssuesModel.find_by_params({"work_id": work_id,
                                                      "id": issue_id})

        if not work_issues:
            raise ResourceNotFoundError("Work Issues not found")

        for description in description_data:
            new_update = WorkIssueUpdatesModel(description=description)
            new_update.work_issue_id = work_issues[0].id
            new_update.save()

        return WorkIssuesModel.find_by_id(issue_id)

    @classmethod
    def approve_work_issues(cls, issue_id, update_id):
        """Approve a work status."""
        results = WorkIssueUpdatesModel.find_by_params({"id": update_id, "work_issue_id": issue_id})
        if not results:
            raise ResourceNotFoundError("Work issue Description doesnt exist")

        work_issue_update: WorkIssueUpdatesModel = results[0]

        work_issue_update.is_approved = True
        work_issue_update.approved_by = TokenInfo.get_username()

        work_issue_update.save()

        return work_issue_update

    @classmethod
    def edit_issue_update(cls, work_id, issue_id, issue_data):
        """Update an existing work issue, and save it only if there are changes."""
        work_issue = WorkIssuesService.find_work_issue_by_id(work_id, issue_id)

        if not work_issue:
            raise ResourceNotFoundError("Work issue doesnt exist")

        updates = issue_data.pop('updates', [])

        # Create a flag to track changes on work_issues
        has_changes_to_work_issue = False

        for key, value in issue_data.items():
            if getattr(work_issue, key) != value:
                setattr(work_issue, key, value)
                has_changes_to_work_issue = True

        if updates:
            for update_description in updates:
                description_id = update_description.get('id')
                if not description_id:
                    raise ResourceNotFoundError("Issue Description doesnt exist")
                if (description_id := update_description.get('id')) is not None:
                    issue_update_model: WorkIssueUpdatesModel = WorkIssueUpdatesModel.find_by_id(description_id)
                    if not issue_update_model:
                        raise ResourceNotFoundError("Issue Description doesnt exist")
                    issue_update_model.description = update_description.get('description')
                    issue_update_model.flush()

        if has_changes_to_work_issue:
            work_issue.save()  # Save the updated work issue only if there are changes
        else:
            issue_update_model.commit()
        return work_issue
