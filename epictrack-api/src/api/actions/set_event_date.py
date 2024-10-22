"""Disable work start date action handler"""

from datetime import timedelta
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event

from .common import find_configuration, find_event_date


class SetEventDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the event date"""

    def run(self, source_event: Event, params: dict) -> None:
        """Performs the required operations"""
        from api.services.event import EventService  # pylint: disable=import-outside-toplevel

        number_of_days_to_be_added = params.get("start_at")
        event_configuration = find_configuration(source_event, params)
        event = (
            db.session.query(Event)
            .filter(
                Event.work_id == source_event.work_id,
                Event.is_active.is_(True),
                Event.event_configuration_id == event_configuration.id,
            )
            .first()
        )
        event_dict = event.as_dict(recursive=False)
        event_dict["anticipated_date"] = find_event_date(source_event) + timedelta(
            days=number_of_days_to_be_added
        )
        EventService.update_event(event_dict, event.id, True, commit=False)
