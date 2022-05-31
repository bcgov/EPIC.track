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

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class WorkStatus(BaseModel):
    """Model class for WorkStatus."""

    __tablename__ = 'work_statuses'

    id = Column(Integer, primary_key=True, autoincrement=True)
    status = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    work_id = Column(ForeignKey('works.id'), nullable=False)
    work = relationship('Work', foreign_keys=[work_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return dict representation."""
        return {
            'id': self.id,
            'status': self.status,
            'created_at': str(self.created_at) if self.created_at else None,
            'updated_at': str(self.updated_at) if self.updated_at else None,
            'work_id': self.work_id
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)
