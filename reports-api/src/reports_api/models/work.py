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
"""Model to handle all operations related to Work."""

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Work(BaseModel):
    """Model class for Work."""

    __tablename__ = 'works'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(80), nullable=False)
    short_description = Column(String(2000))
    long_description = Column(Text)
    is_pecp_required = Column(Boolean, default=False, nullable=False)
    is_cac_recommended = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    is_watched = Column(Boolean, default=False, nullable=False)
    work_status_stoplight = Column(String(6))
    is_deleted = Column(Boolean(), default=False, nullable=False)
    project_tracking_number = Column(String(255), nullable=True, default=None)
    work_tracking_number = Column(String(255), nullable=True, default=None)

    start_date = Column(DateTime(timezone=True))
    anticipated_decision_date = Column(DateTime(timezone=True))
    decision_date = Column(DateTime(timezone=True))

    project_id = Column(ForeignKey('projects.id'), nullable=False)
    ministry_id = Column(ForeignKey('ministries.id'), nullable=False)
    ea_act_id = Column(ForeignKey('ea_acts.id'), nullable=False)
    eao_team_id = Column(ForeignKey('eao_teams.id'), nullable=True)
    federal_involvement_id = Column(ForeignKey('federal_involvements.id'), nullable=False)
    responsible_epd_id = Column(ForeignKey('staffs.id'), nullable=True)
    work_lead_id = Column(ForeignKey('staffs.id'), nullable=True)
    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    current_phase_id = Column(ForeignKey('phase_codes.id'), nullable=True, default=None)
    substitution_act_id = Column(ForeignKey('substitution_acts.id'), nullable=True, default=None)
    eac_decision_by_id = Column(ForeignKey('staffs.id'), nullable=True)
    decision_by_id = Column(ForeignKey('staffs.id'), nullable=True)

    project = relationship('Project', foreign_keys=[project_id], lazy='select')
    ministry = relationship('Ministry', foreign_keys=[ministry_id], lazy='select')
    eao_team = relationship('EAOTeam', foreign_keys=[eao_team_id], lazy='select')
    ea_act = relationship('EAAct', foreign_keys=[ea_act_id], lazy='select')
    federal_involvement = relationship('FederalInvolvement', foreign_keys=[federal_involvement_id], lazy='select')
    responsible_epd = relationship('Staff', foreign_keys=[responsible_epd_id], lazy='select')
    work_lead = relationship('Staff', foreign_keys=[work_lead_id], lazy='select')
    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
    current_phase = relationship("PhaseCode", foreign_keys=[current_phase_id], lazy='select')
    substitution_act = relationship("SubstitutionAct", foreign_keys=[substitution_act_id], lazy='select')
    eac_decision_by = relationship("Staff", foreign_keys=[eac_decision_by_id], lazy='select')
    decision_by = relationship("Staff", foreign_keys=[decision_by_id], lazy='select')

    def as_dict(self, recursive=True):
        """Return JSON Representation."""
        result = super().as_dict(recursive=recursive)
        return result
