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
from datetime import datetime, timedelta

from sqlalchemy import and_

from reports_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from reports_api.models import (
    PRIMARY_CATEGORIES, CalendarEvent, Event, EventCategoryEnum, EventConfiguration, WorkCalendarEvent, WorkPhase, db)
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
    def create_event(cls, data: dict, work_id: int, phase_id: int, commit: bool = True) -> Event:
        """Create milestone event"""
        data["work_id"] = work_id
        event = Event(**data)
        event_configurations = EventConfigurationService.find_configurations(event.work_id, all=True)
        if not next((config for config in event_configurations if config.id == event.event_configuration_id), None):
            raise UnprocessableEntityError("Incorrect configuration provided")

        work_phase = WorkPhaseService.find_by_work_nd_phase(work_id, phase_id)
        if not work_phase:
            raise UnprocessableEntityError("Invalid Work/Phase provided")

        if not work_phase.phase.legislated and cls._validate_date(work_phase, event):
            raise UnprocessableEntityError("The event dates should be within the start and end dates of the phase")

        events = cls._find_events_by_work(work_id, phase_id, PRIMARY_CATEGORIES)
        event = event.flush()
        if event.actual_date and not cls._is_previous_event_completed(events, event_configurations, event):
            raise UnprocessableEntityError("Prevous event must be completed")
        child_configurations = list(filter(lambda x, p_id=event.event_configuration_id:
                                           x.parent_id == p_id, event_configurations))
        cls._handle_child_events(child_configurations, event)
        if commit:
            db.session.commit()
        return event

    @classmethod
    def update_event(cls, data: dict, event_id: int, commit: bool = True) -> Event:
        """Update the event"""
        event = Event.find_by_id(event_id)
        if not event:
            raise ResourceNotFoundError("Event not found")
        if not event.is_active:
            raise UnprocessableEntityError("Event is inactive and cannot be updated")
        event_configurations = EventConfigurationService.find_parent_child_configurations(
            data.get("event_configuration_id"))
        if not event_configurations:
            raise UnprocessableEntityError("Incorrect configuration provided")
        child_configurations = list(filter(lambda x: x.parent_id, event_configurations))
        event.update(data, commit=False)
        cls._handle_child_events(child_configurations, event)
        if commit:
            db.session.commit()
        return event

    @classmethod
    def find_milestone_event(cls, event_id: int) -> Event:
        """Get the milestone event"""
        m_event = Event.find_by_id(event_id)
        if not m_event or not m_event.is_active:
            raise ResourceNotFoundError("Milestone event either not found or inactive")
        return m_event

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
        events_completed = events_query.filter(Event.actual_date is not None).count()
        return (events_completed / events_total) * 100

    @classmethod
    def find_milestone_events_by_work_phase(cls, work_id: int, phase_id: int):
        """Find all milestone events by work id and phase id"""
        return Event.find_milestones_by_work_phase(work_id, phase_id)

    @classmethod
    def _is_previous_event_completed(cls, events: [Event],
                                     event_configurations: [EventConfiguration], event: Event) -> bool:
        """Check to see if the previous event has actual date present"""
        config = next((config for config in event_configurations if config.id == event.event_configuration_id), None)
        phase_events = list(filter(lambda x, _phase_id=config.phase_id:
                                   x.event_configuration.phase_id == _phase_id, events))
        phase_events.append(event)
        phase_events = sorted(phase_events, key=lambda x: x.actual_date or x.anticipated_date)
        event_index = -1
        for index, item in enumerate(phase_events):
            if item.id == event.id:
                event_index = index
                break
        if event_index > 0 and event.actual_date and not phase_events[event_index - 1].actual_date:
            return False
        return True

    @classmethod
    def _handle_event_types(cls, events: [Event], event_configurations: [EventConfiguration], event):
        """Handle the event and related actions"""
        pass
        # config = next((config for config in event_configurations if config.id == event.event_configuration_id), None)
        # child_configurations = list(filter(lambda x,
        #                                    p_id=event.event_configuration_id:
        #                                    x.parent_id == p_id, event_configurations))
        # match config.event_category_id:
        #     case EventCategoryEnum.EXTENSION:
        #         work_phases = WorkPhaseService.find_by_work_id(event.work_id)
        #     case EventCategoryEnum.SUSPENSION:
        #         pass
        #     case EventCategoryEnum.DECISION:
        #         pass
        #     case EventCategoryEnum.PCP:
        #         pass
        #     case _:
        #         cls._handle_child_events(child_configurations, event)

    @classmethod
    def _handle_child_events(cls, child_configurations: [EventConfiguration], event: [Event]) -> None:
        """Create events based on the child event configurations"""
        for c_event_conf in child_configurations:
            c_event_start_date = cls._find_event_date(event) + timedelta(
                days=cls._find_start_at_value(
                    c_event_conf.start_at, event.number_of_days))
            if c_event_conf.event_category_id == EventCategoryEnum.CALENDAR.value:
                work_calendar_event = db.session.query(WorkCalendarEvent)\
                    .filter(WorkCalendarEvent.event_configuration_id == c_event_conf.id,
                            WorkCalendarEvent.source_event_id == event.id,
                            WorkCalendarEvent.is_active.is_(True)).scalar()
                if work_calendar_event:
                    cal_event = CalendarEvent.find_by_id(work_calendar_event.calendar_event_id)
                    cal_event.anticipated = c_event_start_date
                    cal_event.update(cal_event.as_dict(), commit=False)
                else:
                    cal_event = CalendarEvent.flush(
                        CalendarEvent(
                            **{
                                "name": c_event_conf.name,
                                "anticipated_date": c_event_start_date,
                                "number_of_days": c_event_conf.number_of_days,
                            }
                        )
                    )
                    WorkCalendarEvent.flush(
                        WorkCalendarEvent(
                            **{
                                "calendar_event_id": cal_event.id,
                                "source_event_id": event.id,
                                "event_configuration_id": c_event_conf.id,
                            }
                        )
                    )
            else:
                existing_event = db.session.query(Event).filter(Event.source_event_id == event.id,
                                                                Event.is_active.is_(True))
                if existing_event:
                    existing_event.anticipated_date = c_event_start_date
                    existing_event.update(existing_event.as_dict(), commit=False)
                else:
                    Event.flush(
                        Event(
                            **cls._prepare_regular_event(
                                c_event_conf.name,
                                str(c_event_start_date),
                                c_event_conf.number_of_days,
                                c_event_conf.id,
                                c_event_conf.work_id,
                                event.id,
                            )
                        )
                    )

    @classmethod
    def _find_events_by_work(cls, work_id: int, phase_id: int = None,
                             event_categories: [EventCategoryEnum] = []) -> [Event]:
        # pylint: disable=dangerous-default-value
        """Find all events by work"""
        events_query = db.session.query(Event)\
            .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)\
            .filter(Event.is_active.is_(True), EventConfiguration.work_id == work_id)
        if len(event_categories) > 0:
            events_query.filter(EventConfiguration.event_category_id.in_(event_categories))
        if not phase_id:
            events_query = events_query.filter(EventConfiguration.phase_id == phase_id)
        return events_query.all()

    @classmethod
    def _find_event_date(cls, event):
        """Returns the event actual or anticipated date"""
        return event.actual_date if event.actual_date else event.anticipated_date

    @classmethod
    def _find_start_at_value(cls, start_at: str, number_of_days: int) -> int:
        """Calculate the start at value"""
        # pylint: disable=eval-used
        start_at_value = (
            eval(start_at.replace("number_of_days", str(number_of_days)))
            if "number_of_days" in start_at
            else int(start_at)
        )
        return start_at_value + number_of_days

    @classmethod
    def _prepare_regular_event(  # pylint: disable=too-many-arguments
        cls,
        name: str,
        start_date: str,
        number_of_days: int,
        ev_config_id: int,
        work_id: int,
        source_e_id: int = None,
    ) -> dict:
        """Prepare the event object"""
        return {
            "name": name,
            "anticipated_date": f"{start_date}",
            "number_of_days": number_of_days,
            "event_configuration_id": ev_config_id,
            "source_event_id": source_e_id,
            "work_id": work_id
        }

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
