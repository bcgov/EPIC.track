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
    short_description = Column(String(255), nullable=True)
    long_description = Column(Text, nullable=True)
    is_active = Column(Boolean(), default=False)
    is_complete = Column(Boolean(), default=False)
    oh_attendance = Column(Integer(), nullable=True)
    anticipated_start_date = Column(DateTime, nullable=True)
    start_date = Column(DateTime, nullable=True)
    anticipated_end_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)

    work_id = Column(ForeignKey('works.id'), nullable=False)
    milestone_id = Column(ForeignKey('milestones.id'), nullable=False)
    outcome_id = Column(ForeignKey('outcomes.id'), nullable=True, default=None)

    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    milestone = relationship('Milestone', foreign_keys=[milestone_id], lazy='select')
    outcome = relationship('Outcome', foreign_keys=[outcome_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'title': self.title,
            'short_description': self.short_description,
            'long_description': self.long_description,
            'is_active': self.is_active,
            'is_complete': self.is_complete,
            'oh_attendance': self.oh_attendance,
            'anticipated_start_date': str(self.anticipated_start_date) if self.anticipated_start_date else None,
            'start_date': str(self.start_date) if self.start_date else None,
            'anticipated_end_date': str(self.anticipated_end_date) if self.anticipated_end_date else None,
            'end_date': str(self.end_date) if self.end_date else None,
            'work_id': self.work_id,
            'milestone': self.milestone.as_dict() if self.milestone else None,
            'outcome': self.outcome.as_dict() if self.outcome else None
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)
