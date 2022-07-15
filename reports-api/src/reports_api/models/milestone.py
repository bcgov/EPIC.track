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

import enum
from flask import current_app
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .db import db


class MilestoneKind(enum.Enum):
    """Enum for MilestoneKind"""

    EVENT = 'EVENT'
    ENGAGEMENT = 'ENGAGEMENT'


class Milestone(BaseModel):
    """Model class for Milestone."""

    __tablename__ = 'milestones'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    phase_id = Column(ForeignKey('phase_codes.id'), nullable=False)
    milestone_type_id = Column(ForeignKey('milestone_types.id'), nullable=False)
    sort_order = Column(Integer, nullable=False)
    start_at = Column(Integer, nullable=False, default=0)
    duration = Column(Integer, nullable=False, default=0)

    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    milestone_type = relationship('MilestoneType', foreign_keys=[milestone_type_id], lazy='select')

    outcomes = relationship("Outcome",
                            primaryjoin="Milestone.id==Outcome.milestone_id",
                            back_populates="milestone")
    kind = Column(String, nullable=False, default='EVENT')
    auto = Column(Boolean, default=False)

    @classmethod
    def find_by_phase_id(cls, _phase_id):
        """Returns collection of milestone by phaseid"""
        current_app.logger.info(f"Find by phase {_phase_id}")
        milestones = db.session.query(Milestone).filter_by(phase_id=_phase_id, kind=MilestoneKind.EVENT.value).order_by(
            Milestone.sort_order.asc(), Milestone.id.asc()).all()
        return milestones

    @classmethod
    def find_non_decision_by_phase_id(cls, _phase_id: int):
        """Find non decision by phase id."""
        milestones = cls.query.filter_by(phase_id=_phase_id, kind=MilestoneKind.EVENT.value).order_by(
            Milestone.sort_order.asc(), Milestone.id.asc()).all()
        # first and last items should not be returned as it is already autopopulated as events
        return milestones[1:len(milestones) - 1]

    def as_dict(self):  # pylint:disable=arguments-differ
        """Returns JSON representation"""
        return {
            'id': self.id,
            'name': self.name,
            'phase_id': self.phase_id,
            'milestone_type': self.milestone_type.as_dict(),
            'auto': self.auto,
            'sort_order': self.sort_order,
            'kind': self.kind,
            'start_at': self.start_at,
            'duration': self.duration,
            'outcomes': [x.as_dict() for x in self.outcomes]
        }
