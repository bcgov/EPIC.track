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

from api.actions.action_handler import ActionHandler
from api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from api.models import (PRIMARY_CATEGORIES, CalendarEvent, Event,
                        EventCategoryEnum, EventConfiguration, EventTypeEnum,
                        WorkCalendarEvent, WorkPhase, db)
from api.models.action import Action, ActionEnum
from api.models.action_configuration import ActionConfiguration
from api.models.event_template import EventPositionEnum
from api.services.outcome_configuration import OutcomeConfigurationService
from api.utils import util
from api.utils.datetime_helper import get_start_of_day
from sqlalchemy import and_, or_

from .event_configuration import EventConfigurationService


class EventService:
    """Service to manage event related operations."""

    @classmethod
    def create_event(cls, data: dict, work_phase_id: int, commit: bool = True) -> Event:
        """Create milestone event"""
        current_work_phase = WorkPhase.find_by_id(work_phase_id)

        data["work_id"] = current_work_phase.work_id
        data["anticipated_date"] = get_start_of_day(data.get("anticipated_date"))
        data["actual_date"] = get_start_of_day(data.get("actual_date"))
        event = Event(**data)
        event = event.flush()
        cls._process_events(current_work_phase, event, None)
        cls._process_actions(event, data.get("outcome_id", None))
        if commit:
            db.session.commit()
        return event

    @classmethod
    def update_event(cls, data: dict, event_id: int, commit: bool = True) -> Event:
        """Update the event"""
        event = Event.find_by_id(event_id)
        event_old = copy.copy(event)
        current_work_phase = WorkPhase.find_by_id(
            event.event_configuration.work_phase_id
        )
        all_work_phase_events = cls._find_events(
            current_work_phase.work_id, current_work_phase.id, PRIMARY_CATEGORIES
        )
        current_event_old_index = util.find_index_in_array(all_work_phase_events, event)
        if not event:
            raise ResourceNotFoundError("Event not found")
        if not event.is_active:
            raise UnprocessableEntityError("Event is inactive and cannot be updated")
        data["anticipated_date"] = get_start_of_day(data.get("anticipated_date"))
        data["actual_date"] = get_start_of_day(data.get("actual_date"))
        event = event.update(data, commit=False)
        cls._process_events(
            current_work_phase, event, event_old, current_event_old_index
        )
        cls._process_actions(event, data.get("outcome_id", None))
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
    def find_milestone_progress_by_work_phase_id(cls, work_phase_id: int) -> float:
        """Find the percentage of milestone events completed for given work_id"""
        events_query = Event.query.join(
            EventConfiguration,
            and_(
                Event.event_configuration_id == EventConfiguration.id,
                EventConfiguration.work_phase_id == work_phase_id,
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
    def _process_events(
        cls,
        current_work_phase: WorkPhase,
        event: Event,
        event_old: Event = None,
        current_event_old_index: int = None,
    ) -> None:
        """Process the event date logic"""
        all_work_event_configurations = EventConfigurationService.find_configurations(
            event.work_id, _all=True
        )
        cls._handle_child_events(all_work_event_configurations, event)
        number_of_days_to_be_pushed = cls._get_number_of_days_to_be_pushed(
            event, event_old, current_work_phase
        )
        if (
            event.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_SUSPENSION.value
            and event.actual_date
        ):
            current_work_phase.suspended_date = event.actual_date
            current_work_phase.is_suspended = True
            current_work_phase.update(current_work_phase.as_dict(recursive=False), commit=False)
        if (
                event.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_RESUMPTION.value
                and event.actual_date
        ):
            event.number_of_days = (event.actual_date - current_work_phase.suspended_date).days
            event.update(event.as_dict(recursive=False), commit=False)
            current_work_phase.is_suspended = False
            current_work_phase.update(current_work_phase.as_dict(recursive=False), commit=False)

        if number_of_days_to_be_pushed != 0:
            cls._end_event_anticipated_change_rule(event, event_old)

            all_work_events = cls._find_events(
                current_work_phase.work_id, None, PRIMARY_CATEGORIES
            )
            all_work_events = sorted(
                all_work_events, key=lambda x: x.actual_date or x.anticipated_date
            )
            cls._previous_event_acutal_date_rule(all_work_events, event)
            all_work_phases = WorkPhase.find_by_params(
                {"work_id": current_work_phase.work_id}
            )

            current_work_phase_index = util.find_index_in_array(
                all_work_phases, current_work_phase
            )
            current_future_work_phases = all_work_phases[current_work_phase_index:]
            if current_work_phase.legislated:
                phase_events = list(
                    filter(
                        lambda x, _work_phase_id=current_work_phase.id:
                            x.event_configuration.work_phase_id == _work_phase_id,
                        all_work_events,
                    )
                )
                current_event_index = (
                    current_event_old_index
                    if current_event_old_index
                    else util.find_index_in_array(phase_events, event)
                )
                if (
                    event.event_configuration.event_position == EventPositionEnum.START.value or
                    event.event_configuration.event_category_id in [
                        EventCategoryEnum.EXTENSION.value,
                        EventCategoryEnum.SUSPENSION.value,
                    ]
                ):
                    end_event_index = None
                    if cls._find_event_date(event) >= current_work_phase.end_date:
                        end_event = next(
                            filter(
                                lambda x: x.event_configuration.event_position == EventPositionEnum.END.value,
                                phase_events,
                            )
                        )
                        end_event_index = util.find_index_in_array(
                            phase_events, end_event
                        )
                    cls._push_work_phases(
                        current_future_work_phases,
                        all_work_events,
                        all_work_event_configurations,
                        number_of_days_to_be_pushed,
                        event,
                        current_work_phase,
                        (end_event_index - 1)
                        if end_event_index
                        else current_event_old_index,
                    )
                else:
                    phase_events = list(
                        filter(
                            lambda x: x.event_configuration.event_position != EventPositionEnum.END.value,
                            phase_events,
                        )
                    )
                    cls._push_events(
                        phase_events[current_event_index:],
                        number_of_days_to_be_pushed,
                        event,
                        all_work_event_configurations,
                    )
            if not current_work_phase.legislated:
                cls._push_work_phases(
                    current_future_work_phases,
                    all_work_events,
                    all_work_event_configurations,
                    number_of_days_to_be_pushed,
                    event,
                    current_work_phase,
                    current_event_old_index,
                )

    @classmethod
    def _get_number_of_days_to_be_pushed(cls, event: Event, event_old: Event, current_work_phase: WorkPhase) -> int:
        """Returns the number of days to be pushed"""
        delta = (
            (cls._find_event_date(event) - cls._find_event_date(event_old)).days
            if event_old
            else 0
        )  # used to have the difference
        number_of_days = event.number_of_days
        if event.event_configuration.event_category_id == EventCategoryEnum.EXTENSION.value:
            # return 0 days to be pushed unless actual date is entered
            return 0 if not event.actual_date else event.number_of_days
        if (
            event.event_configuration.event_category_id == EventCategoryEnum.SUSPENSION.value
            and event.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_SUSPENSION.value
        ):
            # always return 0 as suspension does not push the number of days
            return 0

        if (
            event.event_configuration.event_category_id == EventCategoryEnum.SUSPENSION.value
            and event.event_configuration.event_type_id == EventTypeEnum.TIME_LIMIT_RESUMPTION.value
        ):
            if event.actual_date:
                return (event.actual_date - current_work_phase.suspended_date).days
            else:
                return 0

        if event.event_configuration.event_position in [
            EventPositionEnum.START.value,
            EventPositionEnum.END.value,
        ]:
            return (cls._find_event_date(event) - cls._find_event_date(event_old)).days

        if event.event_configuration.multiple_days and event_old:
            number_of_days = (
                (event.number_of_days - event_old.number_of_days)
                if event_old
                else event.number_of_days
            )
            return number_of_days + delta
        return delta

    @classmethod
    def _push_events(
        cls,
        phase_events: [Event],
        number_of_days_to_be_pushed: int,
        event: Event,
        all_work_event_configurations: [EventConfiguration],
    ) -> None:
        """Push events the given number of days"""
        for event_to_update in phase_events:
            if event_to_update.id != event.id:
                if event_to_update.actual_date:
                    event_to_update.actual_date = (
                        event_to_update.actual_date + timedelta(days=number_of_days_to_be_pushed)
                    )
                elif event_to_update.anticipated_date:
                    event_to_update.anticipated_date = (
                        event_to_update.anticipated_date + timedelta(days=number_of_days_to_be_pushed)
                    )
                event_to_update.update(
                    event_to_update.as_dict(recursive=False), commit=False
                )
                cls._handle_child_events(all_work_event_configurations, event)

    @classmethod
    def _push_work_phases(
        cls,
        work_phases: [WorkPhase],
        all_work_events: [Event],
        all_work_event_configurations: [EventConfiguration],
        number_of_days_to_be_pushed: int,
        event: Event,
        current_work_phase: WorkPhase,
        current_event_index: int = None,
    ) -> None:
        # pylint: disable=too-many-arguments
        """Push all the events and work phases"""
        for each_work_phase in work_phases:
            phase_events = list(
                filter(
                    lambda x, _work_phase_id=each_work_phase.id:
                        x.event_configuration.work_phase_id == _work_phase_id,
                    all_work_events,
                )
            )
            # if updating: get the old event index if we are in the current phase
            # if inserting: get the event index when we are in the current phase
            _current_event_index = -1
            if each_work_phase.id == current_work_phase.id:
                _current_event_index = (
                    current_event_index
                    if current_event_index
                    else util.find_index_in_array(phase_events, event)
                )
            cls._push_events(
                phase_events[_current_event_index + 1:],
                number_of_days_to_be_pushed,
                event,
                all_work_event_configurations,
            )
            if (
                event.event_configuration.event_category_id
                not in [
                    EventCategoryEnum.EXTENSION.value,
                    EventCategoryEnum.SUSPENSION.value,
                ] or each_work_phase.id != current_work_phase.id
            ):
                each_work_phase.start_date = each_work_phase.start_date + timedelta(
                    days=number_of_days_to_be_pushed
                )
            each_work_phase.end_date = each_work_phase.end_date + timedelta(
                days=number_of_days_to_be_pushed
            )
            each_work_phase.update(
                each_work_phase.as_dict(recursive=False), commit=False
            )

    @classmethod
    def _end_event_anticipated_change_rule(cls, event: Event, event_old: Event) -> None:
        """Anticipated date of end event cannot be changed"""
        if (
            event.event_configuration.event_position == EventPositionEnum.END.value and
            (event_old.anticipated_date - event.anticipated_date).days != 0
        ):
            raise UnprocessableEntityError(
                "Anticipated date of the phase end event should not be changed"
            )

    @classmethod
    def _previous_event_acutal_date_rule(
        cls, all_work_events: [Event], event: Event
    ) -> None:
        """Check to see if the previous event has actual date present

        # When you put actual date of an event, it is mandatory to
        have actual dates in all the previous events.
        """
        if event.actual_date:
            phase_events = list(
                filter(
                    lambda x, _work_phase_id=event.event_configuration.work_phase_id:
                        x.event_configuration.work_phase_id == _work_phase_id,
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
                event_index > 0 and event.actual_date and (
                    not phase_events[event_index - 1].actual_date and not phase_events[
                        event_index - 1
                    ].event_configuration.event_position == EventPositionEnum.END.value
                )
            ):
                raise UnprocessableEntityError(
                    "Previous event should be completed to proceed"
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
            .order_by(Event.actual_date, Event.anticipated_date)
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
        return start_at_value

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
    def find_next_milestone_event_by_work_phase_id(cls, work_phase_id: int) -> Event:
        """Find the next milestone event for given work id"""
        event = (
            Event.query.join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.work_phase_id == work_phase_id,
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

    @classmethod
    def delete_event(cls, event_id: int):
        """Mark milestone as deleted by id"""
        event = Event.find_by_id(event_id)
        if not event:
            raise ResourceNotFoundError("No event found with given id")
        if event.actual_date:
            raise UnprocessableEntityError("Locked events cannot be deleted")
        db.session.query(Event).filter(
            or_(Event.id == event_id, Event.source_event_id == event_id)
        ).update({"is_active": False, "is_deleted": True})
        db.session.commit()
        return "Deleted successfully"

    @classmethod
    def _process_actions(cls, event: Event, outcome_id: int = None) -> None:
        if event.actual_date is None:
            return
        if outcome_id is None:
            outcomes = OutcomeConfigurationService.find_by_configuration_id(
                event.event_configuration_id
            )
            if not outcomes:
                return
            outcome_id = outcomes[0].id
        action_configurations = (
            db.session.query(ActionConfiguration)
            .join(Action, Action.id == ActionConfiguration.action_id)
            .filter(ActionConfiguration.outcome_configuration_id == outcome_id)
            .all()
        )
        for action_configuration in action_configurations:
            action_handler = ActionHandler(ActionEnum(action_configuration.action_id))
            action_handler.apply(event, action_configuration)
