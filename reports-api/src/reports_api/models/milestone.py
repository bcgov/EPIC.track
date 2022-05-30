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
"""Model to handle all operations related to Milestone."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .db import db


class Milestone(BaseModel):
    """Model class for Milestone."""

    __tablename__ = 'milestones'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    phase_id = Column(ForeignKey('phase_codes.id'), nullable=False)
    milestone_type_id = Column(ForeignKey('milestone_types.id'), nullable=False)
    sort_order = Column(Integer, nullable=False)
    is_start_event = Column(Boolean, default=False)
    is_end_event = Column(Boolean, default=False)

    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    milestone_type = relationship('MilestoneType', foreign_keys=[milestone_type_id], lazy='select')

    outcomes = relationship("Outcome",
                            primaryjoin="Milestone.id==Outcome.milestone_id",
                            back_populates="milestone")

    @classmethod
    def find_by_phase_id(cls, _phase_id):
        """Returns collection of milestone by phaseid"""
        milestones = db.session.query(Milestone).filter_by(phase_id=_phase_id).all()
        return milestones

    @classmethod
    def find_non_decision_by_phase_id(cls, _phase_id: int):
        """Find non decision by phase id."""
        milestones = cls.query.filter_by(phase_id=_phase_id, is_start_event=False, is_end_event=False).all()
        return milestones

    def as_dict(self):  # pylint:disable=arguments-differ
        """Returns JSON representation"""
        return {
            'id': self.id,
            'name': self.name,
            'phase_id': self.phase_id,
            'milestone_type': self.milestone_type.as_dict(),
            'is_start_event': self.is_start_event,
            'is_end_event': self.is_end_event,
            'outcomes': [x.as_dict() for x in self.outcomes]
        }
