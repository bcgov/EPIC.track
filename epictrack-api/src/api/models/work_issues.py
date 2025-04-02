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
from __future__ import annotations

from typing import List

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class WorkIssues(BaseModelVersioned):
    """Model class for Issue Connected to a Work."""

    __tablename__ = "work_issues"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(500), nullable=False)
    is_active = Column(Boolean(), default=True, nullable=False)
    is_high_priority = Column(Boolean(), default=False, nullable=False)
    is_resolved = Column(Boolean(), default=False, nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=False)
    expected_resolution_date = Column(DateTime(timezone=True), nullable=True)

    work_id = Column(ForeignKey("works.id"), nullable=False)
    work = relationship("Work", foreign_keys=[work_id], lazy="select")

    updates = relationship(
        "WorkIssueUpdates",
        back_populates="work_issue",
        lazy="joined",
        order_by="desc(WorkIssueUpdates.posted_date)",
    )

    @classmethod
    def list_issues_for_work_id(cls, work_id) -> List[WorkIssues]:
        """List all WorkIssues sorted by start_date, filtering out WorkIssues marked as deleted in the DB"""
        query = WorkIssues.query.filter(
            cls.work_id == work_id,
            cls.is_deleted.is_(False)
        ).order_by(
            cls.start_date.desc()
        )
        return query.all()
