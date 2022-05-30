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
"""Model to handle all operations related to Payment Disbursement status code."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTable
from .db import db


class PhaseCode(db.Model, CodeTable):
    """Model class for Phase."""

    __tablename__ = 'phase_codes'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent

    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    ea_act_id = Column(ForeignKey('ea_acts.id'), nullable=False)
    start_event = Column(String())
    end_event = Column(String)
    duration = Column(Integer())
    legislated = Column(Boolean())
    sort_order = Column(Integer())
    color = Column(String(15))

    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
    ea_act = relationship('EAAct', foreign_keys=[ea_act_id], lazy='select')

    milestones = relationship("Milestone",
                              primaryjoin="PhaseCode.id==Milestone.phase_id",
                              back_populates="phase")

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name,
            'sort_order': self.sort_order,
            'start_event': self.start_event,
            'end_event': self.end_event,
            'duration': self.duration,
            'legislated': self.legislated,
            'work_type': self.work_type.as_dict(),
            'ea_act': self.ea_act.as_dict(),
            'milestones': [milestone.as_dict() for milestone in self.milestones],
            'color': self.color
        }

    @classmethod
    def find_by_ea_act_and_work_type(cls, _ea_act_id, _work_type_id):
        """Given a id, this will return code master details."""
        code_table = db.session.query(PhaseCode).filter_by(work_type_id=_work_type_id,
                                                           ea_act_id=_ea_act_id).all()  # pylint: disable=no-member
        return code_table
