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

from __future__ import annotations

import enum
from typing import List, Tuple

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String, Text, and_, exists, func
from sqlalchemy.orm import relationship

from api.models.dashboard_seach_options import WorkplanDashboardSearchOptions
from api.models.project import Project
from api.models.staff_work_role import StaffWorkRole

from .base_model import BaseModelVersioned
from .pagination_options import PaginationOptions


class WorkStateEnum(enum.Enum):
    """Enum for WorkState"""

    SUSPENDED = "SUSPENDED"
    IN_PROGRESS = "IN_PROGRESS"
    WITHDRAWN = "WITHDRAWN"
    TERMINATED = "TERMINATED"
    CLOSED = "CLOSED"
    COMPLETED = "COMPLETED"


class Work(BaseModelVersioned):
    """Model class for Work."""

    __tablename__ = 'works'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(80), nullable=False)
    report_description = Column(String(2000))
    epic_description = Column(Text)
    is_cac_recommended = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    is_high_priority = Column(Boolean, default=False, nullable=False)
    work_status_stoplight = Column(String(6))
    is_deleted = Column(Boolean(), default=False, nullable=False)
    project_tracking_number = Column(String(255), nullable=True, default=None)
    work_tracking_number = Column(String(255), nullable=True, default=None)
    first_nation_notes = Column(String)
    status_notes = Column(Text)
    issue_notes = Column(Text)

    start_date = Column(DateTime(timezone=True))
    anticipated_decision_date = Column(DateTime(timezone=True))
    decision_date = Column(DateTime(timezone=True))
    work_decision_date = Column(DateTime(timezone=True))

    project_id = Column(ForeignKey('projects.id'), nullable=False)
    ministry_id = Column(ForeignKey('ministries.id'), nullable=False)
    ea_act_id = Column(ForeignKey('ea_acts.id'), nullable=False)
    eao_team_id = Column(ForeignKey('eao_teams.id'), nullable=False)
    federal_involvement_id = Column(ForeignKey('federal_involvements.id'), nullable=False)
    responsible_epd_id = Column(ForeignKey('staffs.id'), nullable=False)
    work_lead_id = Column(ForeignKey('staffs.id'), nullable=False)
    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    current_work_phase_id = Column(ForeignKey('work_phases.id'), nullable=True, default=None)
    substitution_act_id = Column(ForeignKey('substitution_acts.id'), nullable=True, default=None)
    eac_decision_by_id = Column(ForeignKey('staffs.id'), nullable=True)
    decision_by_id = Column(ForeignKey('staffs.id'), nullable=False)
    start_date_locked = Column(Boolean(), default=False)
    decision_maker_position_id = Column(ForeignKey('positions.id'), nullable=True)
    work_state = Column(Enum(WorkStateEnum), default=WorkStateEnum.IN_PROGRESS)

    project = relationship('Project', foreign_keys=[project_id], lazy='select')
    ministry = relationship('Ministry', foreign_keys=[ministry_id], lazy='select')
    eao_team = relationship('EAOTeam', foreign_keys=[eao_team_id], lazy='select')
    ea_act = relationship('EAAct', foreign_keys=[ea_act_id], lazy='select')
    federal_involvement = relationship('FederalInvolvement', foreign_keys=[federal_involvement_id], lazy='select')
    responsible_epd = relationship('Staff', foreign_keys=[responsible_epd_id], lazy='select')
    work_lead = relationship('Staff', foreign_keys=[work_lead_id], lazy='select')
    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
    current_work_phase = relationship("WorkPhase", foreign_keys=[current_work_phase_id], lazy='select')
    substitution_act = relationship("SubstitutionAct", foreign_keys=[substitution_act_id], lazy='select')
    eac_decision_by = relationship("Staff", foreign_keys=[eac_decision_by_id], lazy='select')
    decision_by = relationship("Staff", foreign_keys=[decision_by_id], lazy='select')
    decision_maker_position = relationship("Staff", foreign_keys=[decision_by_id], lazy='select')

    def as_dict(self, recursive=True):
        """Return JSON Representation."""
        result = super().as_dict(recursive=recursive)
        return result

    @classmethod
    def check_existence(cls, title, work_id=None):
        """Checks if a work exists for a given title"""
        query = Work.query.filter(
            func.lower(Work.title) == func.lower(title), Work.is_deleted.is_(False)
        )
        if work_id:
            query = query.filter(Work.id != work_id)
        if query.count() > 0:
            return True
        return False

    @classmethod
    def fetch_all_works(
        cls,
        pagination_options: PaginationOptions,
        search_filters: WorkplanDashboardSearchOptions = None
    ) -> Tuple[List[Work], int]:
        """Fetch all active works."""
        query = cls.query.filter_by(is_active=True, is_deleted=False)

        query = cls.filter_by_search_criteria(query, search_filters)

        no_pagination_options = not pagination_options or not pagination_options.page or not pagination_options.size
        if no_pagination_options:
            items = query.all()
            return items, len(items)

        page = query.paginate(page=pagination_options.page, per_page=pagination_options.size)

        return page.items, page.total

    @classmethod
    def filter_by_search_criteria(cls, query, search_filters: WorkplanDashboardSearchOptions):
        """Filter by search criteria."""
        if not search_filters:
            return query

        query = cls._filter_by_search_text(query, search_filters.text)

        query = cls._filter_by_eao_team(query, search_filters.teams)

        query = cls._filter_by_work_type(query, search_filters.work_types)

        query = cls._filter_by_project_type(query, search_filters.project_types)

        query = cls._filter_by_env_regions(query, search_filters.regions)

        query = cls._filter_by_work_states(query, search_filters.work_states)

        return query

    @classmethod
    def _filter_by_staff_id(cls, query, staff_id):
        if staff_id:
            subquery = (
                cls.query
                .filter(StaffWorkRole.staff_id == staff_id)
                .exists()
            )
            query = query.filter(subquery)
        return query

    @classmethod
    def _filter_by_search_text(cls, query, search_text):
        if search_text:
            query = query.filter(Work.title.ilike(f'%{search_text}%'))
        return query

    @classmethod
    def _filter_by_eao_team(cls, query, team_ids):
        if team_ids:
            query = query.filter(Work.eao_team_id.in_(team_ids))
        return query

    @classmethod
    def _filter_by_work_type(cls, query, work_type_ids):
        if work_type_ids:
            query = query.filter(Work.work_type_id.in_(work_type_ids))
        return query

    @classmethod
    def _filter_by_project_type(cls, query, project_type_ids):
        if project_type_ids:
            subquery = exists().where(and_(Work.project_id == Project.id, Project.type_id.in_(project_type_ids)))
            query = query.filter(subquery)
        return query

    @classmethod
    def _filter_by_env_regions(cls, query, env_regions):
        if env_regions:
            subquery = exists().where(and_(Work.project_id == Project.id, Project.region_id_env.in_(env_regions)))
            query = query.filter(subquery)
        return query

    @classmethod
    def _filter_by_work_states(cls, query, work_states):
        if work_states:
            query = query.filter(Work.work_state.in_(work_states))
        return query
