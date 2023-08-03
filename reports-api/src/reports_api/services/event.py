# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Event."""
from datetime import datetime

from sqlalchemy import and_

from reports_api.models import Event
from reports_api.models.event_configuration import EventConfiguration
from reports_api.schemas import EventSchema


class EventService:  # pylint: disable=too-few-public-methods
    """Service to manage event related operations."""

    @classmethod
    def bulk_create_events(cls, events):
        """Bulk create events from given list of dicts"""
        events_schema = EventSchema(many=True)
        events = events_schema.load(events)
        for event in events:
            instance = Event(**event)
            instance.flush()
        Event.commit()

    @classmethod
    def find_next_milestone_event_by_work_id(cls, work_id: int) -> Event:
        """Find the next milestone event for given work id"""
        event = (
            Event.query.join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.work_id == work_id,
                    EventConfiguration.parent_id.is_(None),
                ),
            )
            .filter(Event.anticipated_date >= datetime.utcnow().date())
            .order_by(Event.anticipated_date)
            .first()
        )
        return event

    @classmethod
    def find_milestone_progress_by_work_id(cls, work_id: int) -> float:
        """Find the percentage of milestone events completed for given work_id"""
        events_query = Event.query.join(
            EventConfiguration,
            and_(
                Event.event_configuration_id == EventConfiguration.id,
                EventConfiguration.work_id == work_id,
                EventConfiguration.parent_id.is_(None),
            ),
        )
        events_total = events_query.count()
        events_completed = events_query.filter(Event.is_complete.is_(True)).count()
        return (events_completed / events_total) * 100

    @classmethod
    def find_milestone_events_by_work_id(cls, work_id: int):
        """Find all milestone events by work id"""
        return Event.find_milestones_by_work_id(work_id)
