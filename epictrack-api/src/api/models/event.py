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
"""Model to handle all operations related to Event."""

import copy
from datetime import date
from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, and_, cast, func, literal_column, or_
from sqlalchemy.orm import relationship, aliased

from flask import current_app

from api.models.event_template import EventPositionEnum
from api.models.dashboard_search_options import EventCalendarSearchOptions
from api.models.event_category import EventCategory, PRIMARY_CATEGORIES
from api.models.event_configuration import EventConfiguration
from api.models.work_phase import WorkPhase
from api.utils.work_phases import FIRST_WORK_PHASES

from .base_model import BaseModelVersioned


class Event(BaseModelVersioned):
    """Model class for Event."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(String(2000), nullable=True)
    anticipated_date = Column(DateTime(timezone=True), nullable=True)
    actual_date = Column(DateTime(timezone=True), nullable=True)
    number_of_days = Column(Integer, default=0, nullable=False)
    outcome_id = Column(ForeignKey("outcome_configurations.id"), nullable=True, default=None)
    is_active = Column(Boolean(), default=True, nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)
    source_event_id = Column(Integer, nullable=True)
    work_id = Column(ForeignKey("works.id"), nullable=False)
    event_configuration_id = Column(
        ForeignKey("event_configurations.id"), nullable=False
    )
    high_priority = Column(Boolean)
    act_section_id = Column(ForeignKey("act_sections.id"), nullable=True)
    reason = Column(String, nullable=True)
    decision_maker_id = Column(ForeignKey("staffs.id"), nullable=True)
    number_of_attendees = Column(Integer, nullable=True)
    number_of_responses = Column(Integer, nullable=True)
    topic = Column(String, nullable=True)

    outcome = relationship("OutcomeConfiguration", foreign_keys=[outcome_id], lazy="select")
    act_section = relationship("ActSection", foreign_keys=[act_section_id], lazy="select")
    decision_maker = relationship("Staff", foreign_keys=[decision_maker_id], lazy="select")
    work = relationship("Work", foreign_keys=[work_id], lazy="select")
    event_configuration = relationship(
        "EventConfiguration", foreign_keys=[event_configuration_id], lazy="select"
    )
    notes = Column(String)

    def as_dict_snapshot(self, recursive=True):
        """Return JSON Representation (detached copy)."""
        mapper = self.__mapper__
        result = {c.key: getattr(self, c.key) for c in mapper.columns}
        if recursive:
            for rel in mapper.relationships:
                relationship_name = rel.key
                relational_data = getattr(self, relationship_name, None)
                result[relationship] = relational_data.as_dict() if relational_data else None
        return copy.deepcopy(result)

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)

    @classmethod
    def fetch_all_events_by_calendar_search_criteria(
        cls,
        work_ids: list[int],
        search_filters: EventCalendarSearchOptions = None
    ):
        """Fetch all active events with optional event type / category filters."""
        if not work_ids:
            return [], 0

        # create alias inside method
        event_config_alias = aliased(EventConfiguration)

        query = cls.find_by_work_ids_and_year(work_ids, search_filters, event_config_alias)

        # parse event_types[] filters
        filter_conditions = []
        if search_filters and search_filters.event_types:
            for f in search_filters.event_types:
                try:
                    key, value = f.split(":")
                    if key == "event_category":
                        val = int(value)
                        filter_conditions.append(event_config_alias.event_category_id == val)
                    elif key == "event_type":
                        val = int(value)
                        filter_conditions.append(event_config_alias.event_type_id == val)
                    elif key == "event_position":
                        positions = [v.strip().upper() for v in value.split(",")]
                        valid_positions = []
                        for position in positions:
                            try:
                                valid_positions.append(EventPositionEnum[position])
                            except KeyError:
                                current_app.logger.warning(f"Invalid event_position value: {position}")
                        if valid_positions:
                            condition = event_config_alias.event_position.in_(valid_positions)

                            # For START/END events we only want legislated ones
                            if any(p in (EventPositionEnum.START, EventPositionEnum.END) for p in valid_positions):
                                condition = and_(condition, WorkPhase.legislated.is_(True))

                            filter_conditions.append(condition)

                except ValueError:
                    current_app.logger.warning(f"Invalid filter format: {f}. Expected format 'key:value'.")
                    continue

        if filter_conditions:
            # combine all conditions with OR
            query = query.filter(or_(*filter_conditions))

        items = query.all()
        return items, len(items)

    @classmethod
    def find_by_work_ids_and_year(cls, work_ids, search_filters, event_config_alias):
        """Find events by work ids and year."""
        start_of_year = date(search_filters.year, 1, 1)
        end_of_year = date(search_filters.year, 12, 31)

        start_date = func.coalesce(Event.actual_date, Event.anticipated_date)
        interval_expr = literal_column("INTERVAL '1 day'") * Event.number_of_days
        end_date = start_date + interval_expr

        query = (
            Event.query
            .join(event_config_alias, Event.event_configuration)
            .join(Event.work)
            .join(event_config_alias.work_phase)  # join via the alias
            .filter(
                Event.work_id.in_(work_ids),
                Event.is_deleted.is_(False),
                Event.is_active.is_(True),
                start_date <= cast(end_of_year, Date),
                end_date >= cast(start_of_year, Date),
                WorkPhase.name.notin_(FIRST_WORK_PHASES),
            )
        )
        return query

    @classmethod
    def find_milestone_events_by_work_phase(cls, work_phase_id: int):
        """Return milestones by work id and phase id."""
        category_ids = list(map(lambda x: x.value, PRIMARY_CATEGORIES))
        return (
            Event.query.join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.work_phase_id == work_phase_id,
                    Event.is_deleted.is_(False),
                    Event.is_active.is_(True)
                ),
            )
            .join(
                EventCategory,
                and_(
                    EventConfiguration.event_category_id == EventCategory.id,
                    EventCategory.id.in_(category_ids),
                ),
            )
            .all()
        )

    @property
    def event_position(self):
        """Returns the event position of the event"""
        return self.event_configuration.event_position.value
