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
"""Model to handle all operations related to WorkStatus."""
from __future__ import annotations

from collections import defaultdict
from typing import Dict, List

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, desc
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class WorkStatus(BaseModelVersioned):
    """Model class for WorkStatus."""

    __tablename__ = 'work_statuses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(String(2000), nullable=False)
    posted_date = Column(DateTime(timezone=True), nullable=False)
    posted_by = Column(String(100), nullable=True)
    work_id = Column(ForeignKey('works.id'), nullable=False)
    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    is_approved = Column(Boolean(), default=False, nullable=False)
    approved_by = Column(String(255), default=None, nullable=True)
    approved_date = Column(DateTime(timezone=True), nullable=True)

    @classmethod
    def list_statuses_for_work_id(cls, work_id) -> List[WorkStatus]:
        """Return all WorkStatus records for a specific work_id"""
        return WorkStatus.query.filter_by(work_id=work_id).order_by(desc(WorkStatus.posted_date), desc(WorkStatus.id)).all()

    @classmethod
    def list_statuses_for_work_ids(cls, work_ids: list[int]) -> dict[int, list[WorkStatus]]:
        """Fetch all statuses for multiple works, grouped by work_id."""
        statuses = (
            WorkStatus
            .query
            .filter(cls.work_id.in_(work_ids))
            .order_by(cls.work_id, cls.posted_date.desc(), cls.id.desc())
            .all()
        )

        grouped = defaultdict(list)
        for result in statuses:
            grouped[result.work_id].append(result)
        return grouped

    @classmethod
    def list_latest_approved_statuses_for_work_ids(cls, work_ids: List[int]) -> Dict[int, WorkStatus]:
        """Return a dictionary with work_id as key and the latest approved WorkStatus against it."""
        return cls._latest_statuses(work_ids, approved_only=True)

    @classmethod
    def list_latest_status_for_work_ids(cls, work_ids: List[int]) -> Dict[int, WorkStatus]:
        """Return the latest WorkStatus per work_id."""
        return cls._latest_statuses(work_ids)

    @classmethod
    def _latest_statuses(cls, work_ids, approved_only=False):
        if not work_ids:
            return {}
        query = cls.query.filter(cls.work_id.in_(work_ids))
        if approved_only:
            query = query.filter(cls.is_approved.is_(True))
        rows = query.distinct(cls.work_id).order_by(cls.work_id, cls.posted_date.desc(), cls.id.desc()).all()
        return {row.work_id: row for row in rows}
