# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Model to handle all complex operations related to Work Issues."""
from typing import List
from sqlalchemy import and_
from api.models import WorkIssues, db


# pylint: disable=too-few-public-methods
class WorkIssueQuery:
    """Query module for complex work issue queries"""

    @classmethod
    def find_work_issues_by_work_ids(cls, work_ids: List[int]) -> List[WorkIssues]:
        """Find work issues by work ids"""
        results = (
            db.session.query(WorkIssues)
            .filter(
                and_(
                    WorkIssues.work_id.in_(work_ids),
                    WorkIssues.is_active.is_(True),
                    WorkIssues.is_deleted.is_(False),
                )
            )
            .all()
        )
        return results
