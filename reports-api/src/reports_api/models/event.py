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
"""Model to handle all operations related to Event."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Event(BaseModel):
    """Model class for Event."""

    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    short_description = Column(String(2000), nullable=True)
    long_description = Column(Text, nullable=True)
    decision_information = Column(Text, nullable=True)
    topic = Column(String(2000), nullable=True, default=None)
    explanation = Column(Text, nullable=True, default=None)
    is_active = Column(Boolean(), default=False, nullable=False)
    is_complete = Column(Boolean(), default=False, nullable=False)
    oh_attendance = Column(Integer(), nullable=True)
    anticipated_start_date = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    anticipated_end_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_deleted = Column(Boolean(), default=False, nullable=False)

    work_id = Column(ForeignKey('works.id'), nullable=False)
    milestone_id = Column(ForeignKey('milestones.id'), nullable=False)
    outcome_id = Column(ForeignKey('outcomes.id'), nullable=True, default=None)
    decision_by_id = Column(ForeignKey('staffs.id'), nullable=True, default=None)

    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    milestone = relationship('Milestone', foreign_keys=[milestone_id], lazy='select')
    outcome = relationship('Outcome', foreign_keys=[outcome_id], lazy='select')
    decision_by = relationship('Staff', foreign_keys=[decision_by_id], lazy='select')

    def as_dict(self, recursive=True):
        """Return Json representation."""
        obj = {
            'id': self.id,
            'title': self.title,
            'short_description': self.short_description,
            'long_description': self.long_description,
            'is_active': self.is_active,
            'is_complete': self.is_complete,
            'is_deleted': self.is_deleted,
            'oh_attendance': self.oh_attendance,
            'anticipated_start_date': self.anticipated_start_date,
            'start_date': self.start_date,
            'anticipated_end_date': self.anticipated_end_date,
            'end_date': self.end_date,
            'work_id': self.work_id,
        }
        if recursive:
            obj['milestone'] = self.milestone.as_dict() if self.milestone else None
            obj['outcome'] = self.outcome.as_dict() if self.outcome else None
        else:
            obj['milestone_id'] = self.milestone_id
            obj['outcome_id'] = self.outcome_id
        return obj

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)
