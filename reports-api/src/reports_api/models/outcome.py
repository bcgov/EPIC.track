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
"""Model to handle all operations related to Outcome."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Outcome(BaseModel):
    """Model class for Outcome."""

    __tablename__ = 'outcomes'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    milestone_id = Column(ForeignKey('milestones.id'), nullable=False)
    sort_order = Column(Integer, nullable=False)
    terminates_work = Column(Boolean, default=False)

    milestone = relationship('Milestone', foreign_keys=[milestone_id], lazy='select')

    @classmethod
    def find_by_milestone_id(cls, _milestone_id):
        """Returns collection of outcomes by milestone_id"""
        outcomes = cls.query.filter_by(milestone_id=_milestone_id).all()
        return outcomes

    def as_dict(self):  # pylint:disable=arguments-differ
        """Returns JSON representation"""
        return {
            'id': self.id,
            'name': self.name,
            'milestone_id': self.milestone_id,
            'terminates_work': self.terminates_work
        }
