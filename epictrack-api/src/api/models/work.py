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

from datetime import datetime
import enum
from typing import List, Tuple

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    and_,
    exists,
    func,
    or_
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property

from api.models import db
from api.models.dashboard_seach_options import WorkplanDashboardSearchOptions
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.event import Event
from api.models.project import Project
from api.models.staff_work_role import StaffWorkRole

from api.utils import util
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


class EndingWorkStateEnum(enum.Enum):
    """Ending states for work"""

    WITHDRAWN = "WITHDRAWN"
    TERMINATED = "TERMINATED"
    CLOSED = "CLOSED"
    COMPLETED = "COMPLETED"


class Work(BaseModelVersioned):
    """Model class for Work."""

    __tablename__ = 'works'

    id = Column(Integer, primary_key=True, autoincrement=True)
    simple_title = Column(String(), nullable=True)
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
    ministry_id = Column(ForeignKey('ministries.id'), nullable=True)
    ea_act_id = Column(ForeignKey('ea_acts.id'), nullable=False)
    eao_team_id = Column(ForeignKey('eao_teams.id'), nullable=False)
    federal_involvement_id = Column(ForeignKey('federal_involvements.id'), nullable=False)
    responsible_epd_id = Column(ForeignKey('staffs.id'), nullable=False)
    work_lead_id = Column(ForeignKey('staffs.id'), nullable=False)
    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    current_work_phase_id = Column(Integer, nullable=True, default=None)
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
    work_type = relationship("WorkType", foreign_keys=[work_type_id], lazy="select")
    current_work_phase = relationship(
        "WorkPhase",
        primaryjoin="WorkPhase.id == foreign(Work.current_work_phase_id)",
        lazy="select",
    )
    substitution_act = relationship("SubstitutionAct", foreign_keys=[substitution_act_id], lazy='select')
    eac_decision_by = relationship("Staff", foreign_keys=[eac_decision_by_id], lazy='select')
    decision_by = relationship("Staff", foreign_keys=[decision_by_id], lazy='select')
    decision_maker_position = relationship("Staff", foreign_keys=[decision_by_id], lazy='select')
    indigenous_works = relationship(
        "IndigenousWork", backref="parent_work", lazy="select", cascade="all, delete-orphan"
    )

    @hybrid_property
    def title(self):
        """Dynamically create the title."""
        if self.project and self.work_type:
            return util.generate_title(self.project.name, self.work_type.name, self.simple_title)
        return None

    @title.expression
    def title(self):
        """SQL expression for title."""
        from api.models.work_type import WorkType  # pylint:disable=import-outside-toplevel
        return func.concat(Project.name, " - ", WorkType.name, " - ", self.simple_title)  # pylint:disable=not-callable

    @hybrid_property
    def anticipated_referral_date(self):
        """Dynamically create the anticipated referral date."""
        return (
            db.session.query(func.min(Event.anticipated_date).label("min_anticipated_date"))
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                ),
            )
            .filter(
                Event.work_id == self.id,
                func.coalesce(Event.actual_date, Event.anticipated_date) >= datetime.today(),
            )
            .scalar()
        )

    def as_dict(self, recursive=True):
        """Return JSON Representation."""
        result = super().as_dict(recursive=recursive)
        return result

    @classmethod
    def check_existence(cls, title: str, work_id=None):
        """Checks if a work exists for a given title"""
        from api.models.work_type import WorkType  # pylint:disable=import-outside-toplevel
        query = (
            Work.query.join(Project, Work.project_id == Project.id)
            .join(WorkType, Work.work_type_id == WorkType.id)
            .filter(
                func.trim(func.lower(Work.title)) == func.trim(func.lower(title)), Work.is_deleted.is_(False)
            )
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
        query = cls.query.filter_by(is_deleted=False)
        query = cls.filter_by_search_criteria(query, search_filters)
        query = query.order_by(Work.start_date.desc())

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

        query = cls._filter_by_staff_id(query, search_filters.staff_id)

        query = cls._filter_by_search_text(query, search_filters.text)

        query = cls._filter_by_eao_team(query, search_filters.teams)

        query = cls._filter_by_work_type(query, search_filters.work_types)

        query = cls._filter_by_project_type(query, search_filters.project_types)

        query = cls._filter_by_env_regions(query, search_filters.regions)

        query = cls._filter_by_work_states(query, search_filters.work_states)

        return query

    @classmethod
    def _filter_by_staff_id(cls, query, staff_id):
        if staff_id is not None:
            is_active_team_member = and_(StaffWorkRole.staff_id == staff_id, StaffWorkRole.is_active)
            is_epd_on_work = Work.responsible_epd_id == staff_id
            subquery = exists().where(
                and_(
                    Work.id == StaffWorkRole.work_id,
                    or_(
                        is_active_team_member,
                        is_epd_on_work,
                    ),
                )
            )
            query = query.filter(subquery)
        return query

    @classmethod
    def _filter_by_search_text(cls, query, search_text):
        if search_text:
            subquery = exists().where(and_(Work.project_id == Project.id, Project.name.ilike(f'%{search_text}%')))
            query = query.filter(subquery)
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
            ending_states = [state.value for state in EndingWorkStateEnum]
            filtered_ending_states = [work_state for work_state in work_states if work_state in ending_states]
            filtered_non_ending_states = [
                work_state
                for work_state in work_states
                if work_state not in ending_states
            ]
            ending_state_query = None
            if filtered_ending_states:
                ending_state_query = query.filter(
                    and_(
                        Work.work_state.in_(filtered_ending_states),
                    )
                )
            if filtered_non_ending_states:
                query = query.filter(
                    and_(
                        Work.work_state.in_(filtered_non_ending_states),
                        Work.is_active.is_(True),
                    )
                )
            if ending_state_query:
                if (
                    not filtered_non_ending_states
                ):  # if non ending state query is not pressent
                    query = ending_state_query
                else:  # if both state queries are present
                    query = query.union(ending_state_query)
        else:
            query = query.filter_by(is_active=True, is_deleted=False)
        return query
