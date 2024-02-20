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

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, and_
from sqlalchemy.orm import relationship

from api.models.event_category import EventCategory, PRIMARY_CATEGORIES
from api.models.event_configuration import EventConfiguration

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

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)

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
