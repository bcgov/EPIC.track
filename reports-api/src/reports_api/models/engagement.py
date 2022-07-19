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
"""Model to handle all operations related to Engagement."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Engagement(BaseModel):
    """Model class for Engagement."""

    __tablename__ = 'engagements'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    correlation_id = Column(String(255), nullable=True, default=None)
    met_link = Column(String(255), nullable=True, default=None)
    status = Column(String(32), nullable=False, default='planned')

    staff_id = Column(ForeignKey('staffs.id'), nullable=True)
    staff = relationship('Staff', foreign_keys=[staff_id], lazy='select')

    work_engagements_list = relationship("WorkEngagement",
                                         primaryjoin="Engagement.id==WorkEngagement.engagement_id",
                                         back_populates="engagement")

    def as_dict(self, recursive=False):
        """Return a JSON representation"""
        return super().as_dict(recursive=recursive)


class WorkEngagement(BaseModel):
    """Model class for Work Engagements."""

    __tablename__ = 'work_engagements'
    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(ForeignKey('projects.id'), nullable=False)
    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    phase_id = Column(ForeignKey('phase_codes.id'), nullable=False)
    milestone_id = Column(ForeignKey('milestones.id'), nullable=True)
    engagement_id = Column(ForeignKey('engagements.id'), nullable=False)

    project = relationship('Project', foreign_keys=[project_id], lazy='select')
    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    engagement = relationship('Engagement', foreign_keys=[engagement_id], lazy='select')

    def as_dict(self, recursive=False):
        """Return a JSON representation"""
        obj = super().as_dict(recursive=recursive)
        if recursive:
            obj['engagement'] = self.engagement.as_dict(recursive=recursive)
        return obj
