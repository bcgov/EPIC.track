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
import functools
from datetime import datetime, timedelta
from typing import List
from flask import current_app

import pytz

from sqlalchemy import and_, extract, func, or_

from api.actions.action_handler import ActionHandler
from api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from api.models import (
    PRIMARY_CATEGORIES,
    CalendarEvent,
    Event,
    EventCategoryEnum,
    EventConfiguration,
    EventTypeEnum,
    Work,
    WorkCalendarEvent,
    WorkPhase,
    WorkStateEnum,
    db,
)
from api.models.action import Action, ActionEnum
from api.models.action_configuration import ActionConfiguration
from api.models.event_template import EventPositionEnum
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum
from api.models.project import Project
from api.models.work_type import WorkType
from api.services.outcome_configuration import OutcomeConfigurationService
from api.utils import util
from api.application_constants import MIN_WORK_START_DATE

from ..utils.roles import Membership
from ..utils.roles import Role as KeycloakRole
from . import authorisation
from .event_configuration import EventConfigurationService
from .common_service import find_event_date, event_compare_func


# pylint:disable=not-callable, too-many-lines
class EventService:
    """Service to manage event related operations."""

    @classmethod
    def create_event(
        cls, data: dict, work_phase_id: int, push_events: bool, commit: bool = True
    ) -> Event:
        """Create milestone event"""
        current_work_phase = WorkPhase.find_by_id(work_phase_id)

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(
            one_of_roles=one_of_roles, work_id=current_work_phase.work_id
        )

        all_work_events = cls.find_events(
            current_work_phase.work_id, None, PRIMARY_CATEGORIES, True
        )
        data["work_id"] = current_work_phase.work_id
        event = Event(**data)
        event = event.flush()
        if not current_app.config["SKIP_EVENT_LOGIC"]:
            cls._process_events(
                current_work_phase, event, all_work_events, push_events, None
            )
        cls._process_actions(event, data.get("outcome_id", None))
        cls._post_process_actions(event)
        if commit:
            db.session.commit()
        return event

    @classmethod
    def update_event(
        cls, data: dict, event_id: int, push_events: bool, commit: bool = True
    ) -> Event:
        """Update the event"""
        event = Event.find_by_id(event_id)
        event_old = copy.copy(event)
        current_work_phase = WorkPhase.find_by_id(
            event.event_configuration.work_phase_id
        )

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(
            one_of_roles=one_of_roles, work_id=current_work_phase.work_id
        )

        all_work_events = cls.find_events(
            current_work_phase.work_id, None, PRIMARY_CATEGORIES, scoped=True
        )
        if not event:
            raise ResourceNotFoundError("Event not found")
        if not event.is_active:
            raise UnprocessableEntityError("Event is inactive and cannot be updated")
        event = event.update(data, commit=False)
        # Do not process the date logic if the event is already locked(has actual date entered)
        if not event_old.actual_date:
            if not current_app.config["SKIP_EVENT_LOGIC"]:
                cls._process_events(
                    current_work_phase,
                    event,
                    all_work_events,
                    push_events,
                    event_old,
                )
            cls._process_actions(event, data.get("outcome_id", None))
            cls._post_process_actions(event)
        if commit:
            db.session.commit()
        return event

    @classmethod
    def check_event(cls, data: dict, event_id: int = None):
        """Check to see if the event goes beyond the existing phase end dates"""
        result = {
            "subsequent_event_push_required": False,
            "phase_end_push_required": False,
            "days_pushed": 0,
        }
        if current_app.config["SKIP_EVENT_LOGIC"]:
            return result
        event_old = None
        if event_id:
            event = Event.find_by_id(event_id)
            event_old = copy.copy(event)
        event_to_check = Event(**data)
        if event_id:
            event_to_check.event_configuration = event.event_configuration
        else:
            event_configuration = EventConfiguration.find_by_id(
                event_to_check.event_configuration_id
            )
            event_to_check.event_configuration = event_configuration
        current_work_phase = WorkPhase.find_by_id(
            event_to_check.event_configuration.work_phase_id
        )
        number_of_days_to_be_pushed = cls._get_number_of_days_to_be_pushed(
            event_to_check, event_old, current_work_phase
        )
        if number_of_days_to_be_pushed != 0:
            all_work_events = cls.find_events(
                current_work_phase.work_id, None, PRIMARY_CATEGORIES
            )
            result = cls._validate_event_effect_on_dates(
                current_work_phase,
                event_to_check,
                all_work_events,
                event_old,
                number_of_days_to_be_pushed,
            )
            result["subsequent_event_push_required"] = True
            result["days_pushed"] = number_of_days_to_be_pushed
        return result

    @classmethod
    def _validate_event_effect_on_dates(
        cls,
        current_work_phase: WorkPhase,
        event: Event,
        all_work_events: List[Event],
        event_old: Event,
        number_of_days_to_be_pushed: int,
    ):
        # pylint: disable=too-many-arguments,too-many-locals
        """Validate the existing event to see which phase end date does it cause this event or any other event to go"""
        result = {"phase_end_push_required": False}
        legislated_phase_end_push_can_happen = (
            event.event_configuration.event_position.value
            == EventPositionEnum.START.value
            or event.event_configuration.event_category_id
            in [
                EventCategoryEnum.EXTENSION.value,
                EventCategoryEnum.SUSPENSION.value,
            ]
        )
        if current_work_phase.legislated and not legislated_phase_end_push_can_happen:
            return result
        all_work_phases = WorkPhase.find_by_params(
            {"work_id": current_work_phase.work_id}
        )
        current_work_phase_index = util.find_index_in_array(
            all_work_phases, current_work_phase
        )
        current_event_index = cls.find_event_index(
            all_work_events, event_old if event_old else event, current_work_phase
        )
        work_phases_to_be_checked = [all_work_phases[current_work_phase_index]]
        if current_work_phase.legislated:
            phase_events = cls._find_work_phase_events(
                all_work_events, current_work_phase.id
            )
            if legislated_phase_end_push_can_happen:
                if find_event_date(event) >= current_work_phase.end_date:
                    end_event = next(
                        filter(
                            lambda x: x.event_configuration.event_position.value
                            == EventPositionEnum.END.value,
                            phase_events,
                        )
                    )
                    current_event_index = util.find_index_in_array(
                        phase_events, end_event
                    )
        for work_phase in work_phases_to_be_checked:
            phase_events_to_be_checked = cls._find_work_phase_events(
                all_work_events, work_phase.id
            )
            if current_work_phase.id == work_phase.id:
                phase_events_to_be_checked = phase_events_to_be_checked[
                    current_event_index:
                ]
                for each_event in phase_events_to_be_checked:
                    if each_event.id:
                        if each_event.actual_date:
                            each_event.actual_date = each_event.actual_date + timedelta(
                                days=number_of_days_to_be_pushed
                            )
                        elif each_event.anticipated_date:
                            each_event.anticipated_date = (
                                each_event.anticipated_date
                                + timedelta(days=number_of_days_to_be_pushed)
                            )
                    days_diff = (
                        work_phase.end_date.date()
                        - find_event_date(each_event).date()
                    ).days
                    if days_diff < 0:
                        result["phase_end_push_required"] = True
                        result["work_phase_to_be_exceeded"] = work_phase
                        result["event"] = each_event
                        return result
        return result

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
        events_completed = events_query.filter(Event.actual_date.is_not(None)).count()
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
        all_work_events: List[Event],
        push_events: bool,
        event_old: Event = None,
    ) -> None:
        # pylint: disable=too-many-arguments
        """Process the event date logic"""
        cls._end_event_anticipated_change_rule(event, event_old, current_work_phase)
        all_work_phases = WorkPhase.find_by_params(
            {
                "work_id": current_work_phase.work_id,
                "visibility": PhaseVisibilityEnum.REGULAR.value,
            }
        )
        all_work_phases = sorted(all_work_phases, key=lambda x: x.sort_order)
        current_work_phase_index = util.find_index_in_array(
            all_work_phases, current_work_phase
        )
        cls._validate_dates(event, current_work_phase, all_work_phases)
        cls._previous_event_acutal_date_rule(
            all_work_events, all_work_phases, current_work_phase_index, event, event_old
        )
        cls._handle_work_start_date_for_start_event_start_phase(
            event, current_work_phase_index
        )
        number_of_days_to_be_pushed = cls._get_number_of_days_to_be_pushed(
            event, event_old, current_work_phase
        )
        cls._handle_work_phase_for_end_phase_end_event(
            all_work_phases, current_work_phase_index, event, current_work_phase
        )
        cls._handle_end_event_date_when_start_event_changed(
            current_work_phase,
            event,
            all_work_events,
            number_of_days_to_be_pushed,
            push_events,
        )
        cls._handle_work_phase_for_start_event(
            event, current_work_phase, number_of_days_to_be_pushed, push_events
        )
        cls._handle_work_phase_for_suspension(event, current_work_phase)
        cls._handle_work_phase_for_resumption(
            event, current_work_phase, number_of_days_to_be_pushed
        )
        cls._handle_work_phase_for_extension_without_push_events(
            event, current_work_phase, push_events, number_of_days_to_be_pushed
        )
        if number_of_days_to_be_pushed != 0 and push_events:
            cls._push_subsequent_events(
                event,
                all_work_phases,
                all_work_events,
                current_work_phase_index,
                current_work_phase,
                number_of_days_to_be_pushed,
                event_old,
            )
        else:
            all_work_event_configurations = (
                EventConfigurationService.find_all_configurations_by_work(event.work_id)
            )
            cls._handle_child_events(all_work_event_configurations, event)

    @classmethod
    def _push_subsequent_events(
        cls,
        event: Event,
        all_work_phases: List[WorkPhase],
        all_work_events: List[Event],
        current_work_phase_index: int,
        current_work_phase: WorkPhase,
        number_of_days_to_be_pushed: int,
        event_old: Event = None,
    ):
        # pylint: disable=too-many-arguments
        """Push the subsequent events or phases if push_events flag is set"""
        all_work_event_configurations = (
            EventConfigurationService.find_all_configurations_by_work(event.work_id)
        )
        current_event_index = cls.find_event_index(
            all_work_events, event_old if event_old else event, current_work_phase
        )
        cls._handle_child_events(all_work_event_configurations, event)
        current_future_work_phases = all_work_phases[current_work_phase_index:]
        # if the phase is legislated, only start event, extension or suspension can push
        # all the subsequent events in all the subsequent phases
        if current_work_phase.legislated:
            phase_events = cls._find_work_phase_events(
                all_work_events, current_work_phase.id
            )
            if (
                event.event_configuration.event_position.value
                == EventPositionEnum.START.value
                or event.event_configuration.event_category_id
                in [
                    EventCategoryEnum.EXTENSION.value,
                    EventCategoryEnum.SUSPENSION.value,
                ]
            ):
                end_event_index = None
                if event.event_configuration.event_category_id in [
                    EventCategoryEnum.EXTENSION.value,
                    EventCategoryEnum.SUSPENSION.value,
                ]:
                    end_event = next(
                        filter(
                            lambda x: x.event_configuration.event_position.value
                            == EventPositionEnum.END.value,
                            phase_events,
                        )
                    )
                    end_event_index = util.find_index_in_array(phase_events, end_event)
                    # In this case, we will be extending the end event as well
                    # Index is decremented by one to include the end event also to be pushed
                    if end_event_index > 0:
                        end_event_index = end_event_index - 1
                cls._push_work_phases(
                    current_future_work_phases,
                    all_work_events,
                    all_work_event_configurations,
                    number_of_days_to_be_pushed,
                    event,
                    current_work_phase,
                    end_event_index if end_event_index else current_event_index,
                )
            else:
                phase_events = list(
                    filter(
                        lambda x: x.event_configuration.event_position.value
                        != EventPositionEnum.END.value,
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
                current_event_index,
            )

    @classmethod
    def _validate_dates(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        all_work_phases: List[WorkPhase],
    ):
        """Perform date validations for the min and max dates for events"""
        if event.actual_date:
            actual_min_date = cls._find_actual_date_min(
                event, current_work_phase, all_work_phases
            )
            actual_max_date = cls._find_actual_date_max(current_work_phase, event)
            if (
                event.actual_date.date() < actual_min_date.date()
                or event.actual_date.date() > actual_max_date.date()
            ):
                raise UnprocessableEntityError(
                    f"Actual date should be between {actual_min_date} and {actual_max_date}"
                )
        if not event.actual_date:
            anticipated_min_date = cls._find_anticipated_date_min(
                event, current_work_phase, all_work_phases
            )
            if event.anticipated_date < anticipated_min_date:
                raise UnprocessableEntityError(
                    f"Anticipdated date should be greater than {anticipated_min_date}"
                )

    @classmethod
    def _find_anticipated_date_min(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        all_work_phases: List[WorkPhase],
    ):
        """Return the min date of anticipated date"""
        anticipated_date_min = (
            datetime.strptime(MIN_WORK_START_DATE, "%Y-%m-%d").replace(tzinfo=pytz.utc)
            if cls._is_start_event(event)
            and cls._is_start_phase(current_work_phase, all_work_phases)
            else current_work_phase.work.start_date
        )
        return anticipated_date_min

    @classmethod
    def _find_actual_date_min(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        all_work_phases: List[WorkPhase],
    ):
        """Return the min date of actual date"""
        actual_date_min = (
            datetime.strptime(MIN_WORK_START_DATE, "%Y-%m-%d").replace(tzinfo=pytz.utc)
            if cls._is_start_event(event)
            and cls._is_start_phase(current_work_phase, all_work_phases)
            else current_work_phase.start_date
        )
        return actual_date_min

    @classmethod
    def _find_actual_date_max(cls, current_work_phase: WorkPhase, event: Event):
        """Return the max date of actual date"""
        actual_date_max = (
            current_work_phase.end_date
            if current_work_phase.legislated
            and event.event_configuration.event_category_id
            != EventCategoryEnum.EXTENSION.value
            else datetime.utcnow().replace(tzinfo=pytz.utc)
        )
        return actual_date_max

    @classmethod
    def _is_start_event(cls, event):
        """Return true if the given event is start event"""
        return (
            event.event_configuration.event_position.value
            == EventPositionEnum.START.value
        )

    @classmethod
    def _is_start_phase(
        cls, current_work_phase: WorkPhase, all_work_phases: List[WorkPhase]
    ):
        """Return true if the current phase is start phase"""
        return all_work_phases[0].id == current_work_phase.id

    @classmethod
    def _handle_work_phase_for_start_event(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        number_of_days_to_be_pushed: int,
        push_events: bool,
    ) -> None:
        """Update the work phase's start date if the start event's date changed"""
        if event.event_position == EventPositionEnum.START.value:
            current_work_phase.start_date = find_event_date(event)
            # Adjust the phase end date when START event's date changed in a legislated phase
            # This section executes if the user opt not to push the events
            if current_work_phase.legislated and not push_events:
                current_work_phase.end_date = current_work_phase.end_date + timedelta(
                    days=number_of_days_to_be_pushed
                )
            current_work_phase.update(
                current_work_phase.as_dict(recursive=False), commit=False
            )

    @classmethod
    def _handle_work_start_date_for_start_event_start_phase(
        cls, event: Event, current_phase_index: int
    ):
        """Update the work start date to the event's actual if the event is start event and the phase is start phase"""
        if (
            event.actual_date
            and event.event_position == EventPositionEnum.START.value
            and current_phase_index == 0
        ):
            work = event.work
            work.start_date = event.actual_date
            work.update(work.as_dict(recursive=False), commit=False)

    @classmethod
    def _handle_end_event_date_when_start_event_changed(
        cls,
        current_work_phase: WorkPhase,
        event: Event,
        all_work_events: List[Event],
        number_of_days_to_be_pushed: int,
        push_events: bool,
    ):
        # pylint: disable=too-many-arguments
        """END event date change according to start event when the no-push subsequent events requested"""
        # The date of the END event of a phase should be adjusted according to the number of days
        # changed in the START event of the phase in the leslated phase. The total number of days
        # in legislated phase should always remains the same unless and extension/suspension happened.
        # This section of the code will work only if the push_events turned false.

        if (
            current_work_phase.legislated
            and event.event_position == EventPositionEnum.START.value
            and not push_events
        ):
            phase_events = cls._find_work_phase_events(
                all_work_events, event.event_configuration.work_phase_id
            )
            end_event = next(
                (
                    phase_event
                    for phase_event in phase_events
                    if phase_event.event_position == EventPositionEnum.END.value
                ),
                None,
            )
            end_event_from_db = Event.find_by_id(end_event.id)
            end_event_from_db.anticipated_date = (
                end_event_from_db.anticipated_date
                + timedelta(days=number_of_days_to_be_pushed)
            )
            end_event_from_db.update(
                end_event_from_db.as_dict(recursive=False), commit=False
            )

    @classmethod
    def _handle_work_phase_for_suspension(
        cls, event: Event, current_work_phase: WorkPhase
    ) -> None:
        """Update the work phase if the phase is suspended"""
        if (
            event.event_configuration.event_type_id
            == EventTypeEnum.TIME_LIMIT_SUSPENSION.value
            and event.actual_date
        ):
            current_work_phase.suspended_date = event.actual_date
            current_work_phase.is_suspended = True
            current_work_phase.update(
                current_work_phase.as_dict(recursive=False), commit=False
            )

    @classmethod
    def _handle_work_phase_for_resumption(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        number_of_days_to_be_pushed: int,
    ) -> None:
        """Update the work phase if the phase is resumed"""
        if (
            event.event_configuration.event_type_id
            == EventTypeEnum.TIME_LIMIT_RESUMPTION.value
            and event.actual_date
        ):
            event.number_of_days = number_of_days_to_be_pushed
            event.update(event.as_dict(recursive=False), commit=False)
            current_work_phase.is_suspended = False
            current_work_phase.update(
                current_work_phase.as_dict(recursive=False), commit=False
            )

    @classmethod
    def _handle_work_phase_for_end_phase_end_event(
        cls,
        all_work_phases: List[WorkPhase],
        current_work_phase_index: int,
        event: Event,
        current_work_phase: WorkPhase,
    ) -> None:
        """Mark the current work phase complete and set the next work phase as the current one in the work"""
        if (
            event.actual_date
            and event.event_configuration.event_position.value
            == EventPositionEnum.END.value
        ):
            current_work_phase.is_completed = True
            current_work_phase.end_date = event.actual_date
            current_work_phase.update(
                current_work_phase.as_dict(recursive=False), commit=False
            )

            work: Work = Work.find_by_id(current_work_phase.work_id)
            if current_work_phase_index == len(all_work_phases) - 1:
                work.work_state = WorkStateEnum.COMPLETED
            else:
                work.current_work_phase_id = all_work_phases[
                    current_work_phase_index + 1
                ].id
            work.update(work.as_dict(recursive=False), commit=False)

    @classmethod
    def _handle_work_phase_for_extension_without_push_events(
        cls,
        event: Event,
        current_work_phase: WorkPhase,
        push_events: bool,
        number_of_days_to_be_pushed: int,
    ) -> None:
        """Update the work phase for extension with actual date and push events option as false"""
        if (
            event.event_configuration.event_category_id
            == EventCategoryEnum.EXTENSION.value
            and event.actual_date
            and not push_events
        ):
            current_work_phase.end_date = current_work_phase.end_date + timedelta(
                days=number_of_days_to_be_pushed
            )
            current_work_phase.update(
                current_work_phase.as_dict(recursive=False), commit=False
            )

    @classmethod
    def find_event_index(
        cls, all_work_events: List[Event], event: Event, current_work_phase: WorkPhase
    ):
        """Find the index of given event in the list of existing events"""
        all_phase_events = list(
            filter(
                lambda x: x.event_configuration.work_phase_id == current_work_phase.id,
                all_work_events,
            )
        )
        all_phase_events = sorted(
            all_phase_events, key=functools.cmp_to_key(event_compare_func)
        )
        event_index_if_existing = cls._find_event_index_in_array(
            all_phase_events, event
        )
        if event_index_if_existing != -1:
            return event_index_if_existing
        copy_of_all_phase_events: List[Event] = copy.copy(all_phase_events)
        copy_of_all_phase_events.append(event)
        copy_of_all_phase_events = sorted(
            copy_of_all_phase_events,
            key=functools.cmp_to_key(event_compare_func),
        )
        return cls._find_event_index_in_array(copy_of_all_phase_events, event)

    @classmethod
    def _find_event_index_in_array(cls, events: List[Event], event_to_find: Event):
        """Find the index of the event in the given array"""
        index = -1
        for i, event in enumerate(events):
            if event.id == event_to_find.id:
                index = i
                break
        return index

    @classmethod
    def _get_number_of_days_to_be_pushed(
        cls, event: Event, event_old: Event, current_work_phase: WorkPhase
    ) -> int:
        # pylint: disable=too-many-return-statements
        """Returns the number of days to be pushed"""
        delta = (
            (
                find_event_date(event).date()
                - find_event_date(event_old).date()
            ).days
            if event_old
            else 0
        )  # used to have the difference
        number_of_days = event.number_of_days
        if (
            event.event_configuration.event_category_id
            == EventCategoryEnum.EXTENSION.value
        ):
            # return 0 days to be pushed unless actual date is entered
            return 0 if not event.actual_date else event.number_of_days
        if (
            event.event_configuration.event_category_id
            == EventCategoryEnum.SUSPENSION.value
            and event.event_configuration.event_type_id
            == EventTypeEnum.TIME_LIMIT_SUSPENSION.value
        ):
            # always return 0 as suspension does not push the number of days
            return 0
        if (
            event.event_configuration.event_category_id
            == EventCategoryEnum.SUSPENSION.value
            and event.event_configuration.event_type_id
            == EventTypeEnum.TIME_LIMIT_RESUMPTION.value
        ):
            if event.actual_date:
                return (event.actual_date - current_work_phase.suspended_date).days
            return 0
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
        phase_events: List[Event],
        number_of_days_to_be_pushed: int,
        event: Event,
        all_work_event_configurations: List[EventConfiguration],
    ) -> None:
        """Push events the given number of days"""
        for event_to_update in phase_events:
            if event_to_update.id != event.id:
                event_from_db = Event.find_by_id(event_to_update.id)
                if (
                    not event_from_db.actual_date
                ):  # do not modify already locked milestones
                    event_from_db.anticipated_date = (
                        event_from_db.anticipated_date
                        + timedelta(days=number_of_days_to_be_pushed)
                    )
                event_from_db.update(
                    event_from_db.as_dict(recursive=False), commit=False
                )
                cls._handle_child_events(all_work_event_configurations, event_from_db)

    @classmethod
    def _push_work_phases(
        cls,
        work_phases: List[WorkPhase],
        all_work_events: List[Event],
        all_work_event_configurations: List[EventConfiguration],
        number_of_days_to_be_pushed: int,
        event: Event,
        current_work_phase: WorkPhase,
        current_event_index: int = None,
    ) -> None:
        # pylint: disable=too-many-arguments
        """Push all the events and work phases"""
        for each_work_phase in work_phases:
            phase_events = cls._find_work_phase_events(
                all_work_events, each_work_phase.id
            )
            _current_event_index = (
                -1
                if each_work_phase.id != current_work_phase.id
                else current_event_index
            )
            cls._push_events(
                phase_events[_current_event_index + 1:],
                number_of_days_to_be_pushed,
                event,
                all_work_event_configurations,
            )
            if each_work_phase.id != current_work_phase.id:
                each_work_phase.start_date = each_work_phase.start_date + timedelta(
                    days=number_of_days_to_be_pushed
                )
            # work phase end date is handled in _handle_work_phase_for_end_phase_end_event,
            # if the event has actual and if event is end event
            # . This code has to be invoked only if the work phase is not current phase and doesn't have
            # actual date on the event
            if (
                each_work_phase.id != current_work_phase.id
                or not event.actual_date
                or not event.event_position == EventPositionEnum.END.value
            ):
                each_work_phase.end_date = each_work_phase.end_date + timedelta(
                    days=number_of_days_to_be_pushed
                )
                each_work_phase.update(
                    each_work_phase.as_dict(recursive=False), commit=False
                )

    @classmethod
    def _find_work_phase_events(
        cls, all_work_events: List[Event], work_phase_id: int
    ) -> List[Event]:
        """Filter the work events to find the phase event"""
        phase_events = list(
            filter(
                lambda x: x.event_configuration.work_phase_id == work_phase_id,
                all_work_events,
            )
        )
        phase_events = sorted(
            phase_events, key=functools.cmp_to_key(event_compare_func)
        )
        return phase_events

    @classmethod
    def _end_event_anticipated_change_rule(
        cls, event: Event, event_old: Event, current_work_phase: WorkPhase
    ) -> None:
        """Anticipated date of end event of legislated phase cannot be changed"""
        if (
            current_work_phase.legislated
            and event.event_position == EventPositionEnum.END.value
            and (event_old.anticipated_date.date() - event.anticipated_date.date()).days
            != 0
        ):
            raise UnprocessableEntityError(
                "Anticipated date of the phase end event should not be changed"
            )

    @classmethod
    def _previous_event_acutal_date_rule(  # pylint: disable=too-many-arguments
        cls,
        all_work_events: List[Event],
        all_work_phases: List[WorkPhase],
        current_work_phase_index: int,
        event: Event,
        event_old,
    ) -> None:
        """Check to see if the previous event has actual date present

        # When you put actual date of an event, it is mandatory to
        have actual dates in all the previous events.
        """
        if event.actual_date:
            if current_work_phase_index > 0:
                previous_work_phase = all_work_phases[current_work_phase_index - 1]
                if not previous_work_phase.is_completed:
                    raise UnprocessableEntityError(
                        "Previous phase should be completed to proceed"
                    )
            if (
                event.event_configuration.event_category_id
                != EventCategoryEnum.EXTENSION.value
            ):
                event_index = cls.find_event_index(
                    all_work_events,
                    event_old if event_old else event,
                    all_work_phases[current_work_phase_index],
                )
                phase_events = cls._find_work_phase_events(
                    all_work_events, event.event_configuration.work_phase_id
                )
                phase_events = sorted(
                    phase_events, key=functools.cmp_to_key(event_compare_func)
                )
                previous_event = phase_events[event_index - 1]
                if event_index > 0 and not previous_event.actual_date:
                    raise UnprocessableEntityError(
                        "Previous event should be completed to proceed"
                    )

    @classmethod
    def _handle_child_events(
        cls, event_configurations: List[EventConfiguration], event: List[Event]
    ) -> None:
        """Create events based on the child event configurations"""
        child_configurations = list(
            filter(
                lambda x, p_id=event.event_configuration_id: x.parent_id == p_id,
                event_configurations,
            )
        )
        for c_event_conf in child_configurations:
            c_event_start_date = find_event_date(event) + timedelta(
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
                existing_event = (
                    db.session.query(Event)
                    .filter(
                        Event.source_event_id == event.id, Event.is_active.is_(True)
                    )
                    .first()
                )
                if existing_event:
                    existing_event.anticipated_date = c_event_start_date
                    existing_event.update(
                        existing_event.as_dict(recursive=False), commit=False
                    )
                else:
                    Event.flush(
                        Event(
                            **cls._prepare_regular_event(
                                c_event_conf.name,
                                str(c_event_start_date),
                                c_event_conf.number_of_days,
                                c_event_conf.id,
                                event.work_id,
                                event.id,
                            )
                        )
                    )

    @classmethod
    def find_events(
        cls,
        work_id: int,
        work_phase_id: int = None,
        event_categories: List[EventCategoryEnum] = [],
        scoped: bool = False,
    ) -> List[Event]:
        # pylint: disable=dangerous-default-value
        """Find all events by work"""
        events_query = (
            db.session.query(Event)
            .join(
                EventConfiguration,
                Event.event_configuration_id == EventConfiguration.id,
            )
            .filter(
                Event.is_active.is_(True),
                Event.is_deleted.is_(False),
                Event.work_id == work_id,
                EventConfiguration.is_active.is_(True),
            )
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
        results = events_query.all()
        # sometimes, we need copy of list of events not attached to the current
        # database session
        if scoped:
            results_scoped = []
            for result in results:
                event_configuration = result.event_configuration
                result_copy = copy.copy(result)
                result_copy.event_configuration = copy.copy(event_configuration)
                results_scoped.append(result_copy)
            return results_scoped
        return results

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

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=event.work_id)

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
            .filter(
                ActionConfiguration.outcome_configuration_id == outcome_id,
                ActionConfiguration.is_active is True,
                ActionConfiguration.is_deleted is False
            )
            .order_by(ActionConfiguration.sort_order)
            .all()
        )
        for action_configuration in action_configurations:
            action_handler = ActionHandler(ActionEnum(action_configuration.action_id))
            action_handler.apply(event, action_configuration.additional_params)

    @classmethod
    def _post_process_actions(cls, source_event: Event):
        """Things to happen after the actions are being processed"""
        all_work_phases = WorkPhase.find_by_params(
            {
                "work_id": source_event.event_configuration.work_phase.work_id,
                "visibility": PhaseVisibilityEnum.REGULAR.value,
                "is_completed": False,
            }
        )
        all_work_phases = sorted(all_work_phases, key=lambda x: x.sort_order)
        work = source_event.work
        # if it is same, no need to do unwanted update
        if (
            len(all_work_phases) > 0
            and work.current_work_phase_id != all_work_phases[0].id
        ):
            work.current_work_phase_id = all_work_phases[0].id
            work.update(work.as_dict(recursive=False), commit=False)

    @classmethod
    def find_events_by_date(cls, from_date: datetime) -> List[Event]:
        """Returns the future events based on given date.

        To be used for event calendar.
        """
        events = (
            db.session.query(CalendarEvent)
            .filter(
                extract(
                    "YEAR",
                    func.coalesce(
                        CalendarEvent.actual_date, CalendarEvent.anticipated_date
                    ),
                )
                == from_date.year
            )
            .outerjoin(
                WorkCalendarEvent,
                WorkCalendarEvent.calendar_event_id == CalendarEvent.id,
            )
            .outerjoin(
                EventConfiguration,
                EventConfiguration.id == WorkCalendarEvent.event_configuration_id,
            )
            .outerjoin(WorkPhase, WorkPhase.id == EventConfiguration.work_phase_id)
            .outerjoin(Work, Work.id == WorkPhase.work_id)
            .outerjoin(Project, Project.id == Work.project_id)
            .outerjoin(WorkType, WorkType.id == Work.work_type_id)
            .outerjoin(PhaseCode, PhaseCode.id == WorkPhase.phase_id)
            .add_columns(
                Project.name.label("project"),
                Project.description.label("project_description"),
                Project.address.label("project_address"),
                Project.abbreviation.label("project_short_code"),
                WorkPhase.name.label("phase"),
                PhaseCode.color.label("color"),
                WorkType.name.label("work_type"),
                func.coalesce(
                    CalendarEvent.actual_date, CalendarEvent.anticipated_date
                ).label("start_date"),
                CalendarEvent.number_of_days.label("duration"),
                CalendarEvent.name.label("name"),
                CalendarEvent.id.label("id"),
            )
            .all()
        )
        return events
