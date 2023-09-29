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
import copy
from datetime import datetime, timedelta
from typing import List

from sqlalchemy import and_, or_

from reports_api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from reports_api.models import (
    PRIMARY_CATEGORIES,
    CalendarEvent,
    Event,
    EventCategoryEnum,
    EventConfiguration,
    WorkCalendarEvent,
    WorkPhase,
    db,
)
from reports_api.models.event_template import EventPositionEnum
from reports_api.schemas import EventSchema

from .event_configuration import EventConfigurationService
from .work_phase import WorkPhaseService
from reports_api.utils import util


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
    def create_event(cls, data: dict, work_phase_id: int, commit: bool = True) -> Event:
        """Create milestone event"""
        current_work_phase = WorkPhase.find_by_id(work_phase_id)

        data["work_id"] = current_work_phase.work_id
        event = Event(**data)
        event = event.flush()

        all_work_events = cls._find_events(
            current_work_phase.work_id, None, PRIMARY_CATEGORIES
        )
        all_work_events.append(event)

        cls._previous_event_completed_check(all_work_events, event)

        all_work_event_configurations = EventConfigurationService.find_configurations(
            event.work_id, _all=True
        )
        all_work_phases = WorkPhase.find_by_params(
            {"work_id": current_work_phase.work_id}
        )
        cls._handle_child_events(all_work_event_configurations, event)

        number_of_days_to_be_pushed = cls._get_number_of_days_to_be_pushed(event, current_work_phase)

        if current_work_phase.phase.legislated:
            phase_events = list(
                filter(
                    lambda x, _work_phase_id=current_work_phase.id: x.work_phase_id
                    == _work_phase_id
                    and x.event_configuration.event_position
                    != EventPositionEnum.END.value,
                    all_work_events,
                )
            )
            current_event_index = util.find_index_in_array(phase_events, event)
            cls._push_events(phase_events[current_event_index + 1 :],number_of_days_to_be_pushed, event, all_work_event_configurations)

        current_work_phase_index = util.find_index_in_array(
            all_work_phases, current_work_phase
        )
        current_future_work_phases = all_work_phases[current_work_phase_index:]
        if not current_work_phase.phase.legislated:
            for each_work_phase, index in enumerate(current_future_work_phases):
                phase_events = list(
                    filter(
                        lambda x, _work_phase_id=each_work_phase.id: x.work_phase_id
                        == _work_phase_id,
                        all_work_events,
                    )
                )
                current_event_index = util.find_index_in_array(phase_events, event) if index == 0 else -1
                cls._push_events(phase_events[current_event_index + 1 :],number_of_days_to_be_pushed, event, all_work_event_configurations)

        # if commit:
        #     db.session.commit()
        return event

    @classmethod
    def _get_number_of_days_to_be_pushed(
        cls, event: Event, current_work_phase: WorkPhase
    ) -> int:
        """Returns the number of days to be pushed"""
        if event.event_configuration.event_category_id in [
            EventCategoryEnum.EXTENSION,
            EventCategoryEnum.SUSPENSION,
        ]:
            return event.number_of_days
        date_diff_from_phase_end = (
            cls._find_event_date(event) - current_work_phase.end_date
        ).days + event.number_of_days
        number_of_days_to_be_pushed = (
            0
            if current_work_phase.end_date + timedelta(days=date_diff_from_phase_end)
            < current_work_phase.end_date
            else date_diff_from_phase_end
        )
        return number_of_days_to_be_pushed

    @classmethod
    def _push_events(
        cls,
        phase_events: [Event],
        number_of_days_to_be_pushed: int,
        event: Event,
        all_work_event_configurations: [EventConfiguration]
    ) -> None:
        """Push events the given number of days"""
        for event_to_update, index in phase_events:
            if event_to_update.actual_date:
                event_to_update.actual_date = event_to_update.actual_date + timedelta(
                    days=number_of_days_to_be_pushed
                )
            elif event_to_update.anticipated_date:
                event_to_update.anticipated_date = (
                    event_to_update.anticipated_date
                    + timedelta(days=number_of_days_to_be_pushed)
                )
            event_to_update.update(**event_to_update.as_dict(), commit=False)
            cls._handle_child_events(all_work_event_configurations, event)

    @classmethod
    def update_event(cls, data: dict, event_id: int, commit: bool = True) -> Event:
        """Update the event"""
        event = Event.find_by_id(event_id)
        if not event:
            raise ResourceNotFoundError("Event not found")
        if not event.is_active:
            raise UnprocessableEntityError("Event is inactive and cannot be updated")
        event_configurations = (
            EventConfigurationService.find_parent_child_configurations(
                data.get("event_configuration_id")
            )
        )
        if not event_configurations:
            raise UnprocessableEntityError("Incorrect configuration provided")
        child_configurations = list(filter(lambda x: x.parent_id, event_configurations))
        event.update(data, commit=False)
        cls._handle_child_events(event_configurations, event)
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
    def find_milestone_events_by_work_phase(cls, work_phase_id: int):
        """Find all milestone events by work id and phase id"""
        return Event.find_milestone_events_by_work_phase(work_phase_id)

    @classmethod
    def _previous_event_completed_check(
        cls, all_work_events: [Event], event: Event
    ) -> None:
        """Check to see if the previous event has actual date present"""
        if event.actual_date:
            phase_events = list(
                filter(
                    lambda x, _phase_id=event.event_configuration.phase_id: x.event_configuration.phase_id
                    == _phase_id,
                    all_work_events,
                )
            )
            phase_events = sorted(
                phase_events, key=lambda x: x.actual_date or x.anticipated_date
            )
            event_index = -1
            for index, item in enumerate(phase_events):
                if item.id == event.id:
                    event_index = index
                    break
            if (
                event_index > 0
                and event.actual_date
                and not phase_events[event_index - 1].actual_date
            ):
                raise UnprocessableEntityError(
                    "The event dates should be within the start and end dates of the phase"
                )

    @classmethod
    def _handle_event_types(
        cls,
        all_events: [Event],
        event_configurations: [EventConfiguration],
        event: Event,
        work_phase: WorkPhase,
    ):
        """Handle the event and related actions"""
        config = next(
            (
                config
                for config in event_configurations
                if config.id == event.event_configuration_id
            ),
            None,
        )
        child_configurations = list(
            filter(
                lambda x, p_id=event.event_configuration_id: x.parent_id == p_id,
                event_configurations,
            )
        )
        if config.event_category_id in [
            EventCategoryEnum.EXTENSION,
            EventCategoryEnum.SUSPENSION,
        ]:
            if cls._find_event_date(event) > work_phase.end_date:
                work_phase.end_date = work_phase.end_date + timedelta(
                    days=event.number_of_days
                )
                # phase_events = list(filter(lambda x: x.work_phase_id = work_phase_id, all_events)
                # last_event = phase_events[-2]
                # last_event.actual_date = last_event.actual_date + event.number_of_days
                filtered_events = list(
                    filter(
                        lambda x, _work_phase_id=work_phase.id: x.event_configuration.work_phase_id
                        > _work_phase_id,
                        all_events,
                    )
                )
                cls._push_event_dates(
                    event_configurations, filtered_events, event.number_of_days
                )
            if cls._find_event_date(event) < work_phase.end_date:
                event_index = -1
                for index, item in enumerate(all_events):
                    if item.id == event.id:
                        event_index = index
                        break
                events_after_the_current = all_events[event_index + 1 :]
                cls._push_event_dates(
                    event_configurations, events_after_the_current, event.number_of_days
                )


    @classmethod
    def _handle_child_events(
        cls, event_configurations: [EventConfiguration], event: [Event]
    ) -> None:
        """Create events based on the child event configurations"""
        child_configurations = list(
            filter(
                lambda x, p_id=event.event_configuration_id: x.parent_id == p_id,
                event_configurations,
            )
        )
        for c_event_conf in child_configurations:
            c_event_start_date = cls._find_event_date(event) + timedelta(
                days=cls._find_start_at_value(
                    c_event_conf.start_at, event.number_of_days
                )
            )
            if c_event_conf.event_category_id == EventCategoryEnum.CALENDAR.value:
                work_calendar_event = (
                    db.session.query(WorkCalendarEvent)
                    .filter(
                        WorkCalendarEvent.event_configuration_id == c_event_conf.id,
                        WorkCalendarEvent.source_event_id == event.id,
                        WorkCalendarEvent.is_active.is_(True),
                    )
                    .scalar()
                )
                if work_calendar_event:
                    cal_event = CalendarEvent.find_by_id(
                        work_calendar_event.calendar_event_id
                    )
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
                existing_event = db.session.query(Event).filter(
                    Event.source_event_id == event.id, Event.is_active.is_(True)
                )
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
    def _find_events(
        cls,
        work_id: int,
        work_phase_id: int,
        event_categories: [EventCategoryEnum] = [],
    ) -> [Event]:
        # pylint: disable=dangerous-default-value
        """Find all events by work"""
        events_query = (
            db.session.query(Event)
            .join(
                EventConfiguration,
                Event.event_configuration_id == EventConfiguration.id,
            )
            .filter(Event.is_active.is_(True), Event.work_id == work_id)
        )
        if len(event_categories) > 0:
            category_ids = list(map(lambda x: x.value, event_categories))
            events_query = events_query.filter(
                EventConfiguration.event_category_id.in_(category_ids)
            )
        if work_phase_id:
            events_query = events_query.filter(
                EventConfiguration.work_phase_id == work_phase_id
            )
        return events_query.all()

    @classmethod
    def _find_event_date(cls, event) -> datetime:
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
            "work_id": work_id,
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

    @classmethod
    def bulk_delete_milestones(cls, milestone_ids: List):
        """Mark milestones as deleted"""
        db.session.query(Event).filter(
            or_(Event.id.in_(milestone_ids), Event.source_event_id.in_(milestone_ids))
        ).update({"is_active": False, "is_deleted": True})
        db.session.commit()
        return "Deleted successfully"
