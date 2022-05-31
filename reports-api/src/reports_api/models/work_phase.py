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
"""Model to handle all operations related to WorkPhase."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class WorkPhase(BaseModel):
    """Model class for WorkPhase."""

    __tablename__ = 'work_phases'

    id = Column(Integer, primary_key=True, autoincrement=True)
    start_date = Column(DateTime)
    anticipated_end_date = Column(DateTime)

    work_id = Column(ForeignKey('works.id'), nullable=False)
    phase_id = Column(ForeignKey('phase_codes.id'), nullable=False)

    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return JSON Representation."""
        return {
            'id': self.id,
            'start_date': str(self.start_date),
            'anticipated_end_date': str(self.anticipated_end_date),
            'work_id': self.work_id,
            'phase': self.phase.as_dict()
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Find by work id."""
        return cls.query.filter_by(work_id=work_id)
