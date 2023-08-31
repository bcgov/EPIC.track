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

from reports_api.models import Event, WorkPhase, db
from reports_api.exceptions import UnprocessableEntityError
from reports_api.models.event_configuration import EventConfiguration
from reports_api.schemas import EventSchema
from .event_configuration import EventConfigurationService
from .work_phase import WorkPhaseService


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
    def create_event(cls, data: dict ,commit: bool = False) -> Event:
        """Create milestone event"""
        event = Event(**
            {
            "name": data.get("name"),
            "anticipated_date": data.get("anticipated_date"),
            "number_of_days": data.get("number_of_days"),
            "event_configuration_id": data.get("event_configuration_id"),
            "work_id": data.get("work_id")
        })
        event_configurations = EventConfigurationService.find_parent_child_configurations(data.get("event_configuration_id"))
        if not event_configurations:
            raise UnprocessableEntityError("Incorrect configuration provided")

        work_phase = WorkPhaseService.find_by_work_nd_phase(data.get("work_id"), data.get("phase_id"))
        if not work_phase:
            raise UnprocessableEntityError("Invalid Work/Phase provided")

        if not (work_phase.phase.legislated and cls._validate_date(work_phase, event)):
            raise UnprocessableEntityError("The event dates should be within the start and end dates of the phase")

        child_configurations = EventConfigurationService.find_child_configurations(data.get("event_configuration_id"))
        events = cls._find_events_by_work(data.get("work_id"))
        

    @classmethod
    def _find_events_by_work(cls, work_id: int) -> [Event]:
        """Find all events by work"""
        events = db.session.query(Event).filter(Event.is_active.is_(True), Event.work_id == work_id).all()
        return events
    
    @classmethod
    def _validate_date(cls, work_phase: WorkPhase, event: Event) -> bool:
        """Validate the event date against the phase"""
        event_date = event.actual_date if event.actual_date else event.anticipated_date
        return work_phase.start_date < event_date < work_phase.end_date

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
    def find_milestone_events_by_work_phase(cls, work_id: int, phase_id: int):
        """Find all milestone events by work id and phase id"""
        return Event.find_milestones_by_work_phase(work_id, phase_id)
