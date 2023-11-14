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

from typing import List

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

    @classmethod
    def list_statuses_for_work_id(cls, work_id) -> List[WorkStatus]:
        """Return all WorkStatus records for a specific work_id"""
        return WorkStatus.query.filter_by(work_id=work_id).order_by(desc(WorkStatus.posted_date)).all()
