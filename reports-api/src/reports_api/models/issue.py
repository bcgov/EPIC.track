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

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Issue(BaseModel):
    """Model class for Issue."""

    __tablename__ = 'issues'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    short_description = Column(String(255), nullable=False)
    long_description = Column(Text, nullable=True)
    is_key_issue = Column(Boolean(), default=False)
    is_sensitive = Column(Boolean(), default=False)
    is_active = Column(Boolean(), default=True)
    is_resolved = Column(Boolean(), default=False)
    start_date = Column(DateTime, nullable=False)
    anticipated_resolution_date = Column(DateTime, nullable=True)
    resolution_date = Column(DateTime, nullable=True)

    work_id = Column(ForeignKey('works.id'), nullable=False)
    work = relationship('Work', foreign_keys=[work_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'title': self.title,
            'short_description': self.short_description,
            'long_description': self.long_description,
            'is_active': self.is_active,
            'is_key_issue': self.is_key_issue,
            'is_sensitive': self.is_sensitive,
            'is_resolved': self.is_resolved,
            'start_date': str(self.start_date) if self.start_date else None,
            'anticipated_resolution_date': str(
                self.anticipated_resolution_date) if self.anticipated_resolution_date else None,
            'resolution_date': str(self.resolution_date) if self.resolution_date else None,
            'work_id': self.work_id,
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Find by work id."""
        return cls.query.filter_by(work_id=work_id)
