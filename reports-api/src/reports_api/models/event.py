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

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, and_
from sqlalchemy.orm import relationship

from reports_api.models.event_category import EventCategory
from reports_api.models.event_configuration import EventConfiguration

from .base_model import BaseModelVersioned


class Event(BaseModelVersioned):
    """Model class for Event."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    short_description = Column(String(2000), nullable=True)
    long_description = Column(Text, nullable=True)
    anticipated_date = Column(DateTime(timezone=True), nullable=True)
    actual_date = Column(DateTime(timezone=True), nullable=True)
    number_of_days = Column(Integer, default=0, nullable=False)
    outcome_id = Column(ForeignKey("outcomes.id"), nullable=True, default=None)
    is_active = Column(Boolean(), default=False, nullable=False)
    is_complete = Column(Boolean(), default=False, nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)
    source_event_id = Column(Integer, nullable=True)
    event_configuration_id = Column(
        ForeignKey("event_configurations.id"), nullable=False
    )

    outcome = relationship("Outcome", foreign_keys=[outcome_id], lazy="select")
    event_configuration = relationship(
        "EventConfiguration", foreign_keys=[event_configuration_id], lazy="select"
    )

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)

    @classmethod
    def find_milestones_by_work_phase(cls, work_id: int, phase_id: int):
        """Return milestones by work id and phase id."""
        return (
            Event.query.join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.work_id == work_id,
                    EventConfiguration.phase_id == phase_id
                ),
            )
            .join(
                EventCategory,
                and_(
                    EventConfiguration.event_category_id == EventCategory.id,
                    EventCategory.name.notin_(["Calendar", "Finance"]),
                ),
            )
            .all()
        )
