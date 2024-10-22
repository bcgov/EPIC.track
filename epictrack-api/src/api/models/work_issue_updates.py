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
"""Model to handle all operations related to Issues."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned
from ..utils.utcnow import utcnow


class WorkIssueUpdates(BaseModelVersioned):
    """Model class for updates Connected to an issue."""

    __tablename__ = 'work_issue_updates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(2000), nullable=False)

    is_approved = Column(Boolean(), default=False, nullable=True)
    approved_by = Column(String(255), default=None, nullable=True)

    work_issue_id = Column(ForeignKey('work_issues.id'), nullable=False)
    work_issue = relationship('WorkIssues', back_populates='updates')
    posted_date = Column(DateTime(timezone=True), nullable=False, server_default=utcnow())

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'description': self.description,
            'work_issue_id': self.work_issue_id,
        }
