"""Disable work start date action handler"""
from datetime import timedelta
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.event_configuration import EventConfiguration

from .common import find_configuration, find_event_date, param_to_bool


class SetEventDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the event date"""

    def run(self, source_event: Event, params: dict, event: Event = None) -> None:
        """Performs the required operations"""
        from api.services.event import EventService  # pylint: disable=import-outside-toplevel
        event_configuration = None
        if event is not None:
            event_configuration = (
                db.session.query(EventConfiguration)
                .filter(EventConfiguration.id == event.event_configuration_id)
                .first()
            )
        else:
            event_configuration = find_configuration(source_event, params)
        if event_configuration is None:
            raise ValueError(f"Event configuration not found when setting event date for event ID {event.id if event else 'N/A'} while processing action based on source event ID {source_event.id}. Params were {params}")
        number_of_days_to_be_added = int(params.get("start_at", event_configuration.start_at))
        if event is None:
            # fallback if no event passed
            event = (
                db.session.query(Event)
                .filter(
                    Event.work_id == source_event.work_id,
                    Event.is_active.is_(True),
                    Event.event_configuration_id == event_configuration.id,
                )
                .first()
            )
            if event is None:
                raise ValueError("Event not found for updating anticipated date")
        event_dict = event.as_dict(recursive=False)
        # Set date relative to phase start
        if param_to_bool(params.get("use_phase_start", False)):
            work_phase = event_configuration.work_phase
            event_dict["anticipated_date"] = work_phase.start_date + timedelta(days=number_of_days_to_be_added)
        # Set date relative to source event date
        else:
            event_dict["anticipated_date"] = find_event_date(source_event) + timedelta(
                days=number_of_days_to_be_added
            )
        EventService.update_event(event_dict, event.id, True, commit=False)
