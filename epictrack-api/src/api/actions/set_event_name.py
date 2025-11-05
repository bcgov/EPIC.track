"""Set event name action handler"""
from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event

from .common import find_configuration


class SetEventName(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the event name"""

    def run(self, source_event: Event, params: dict, event: Event = None) -> None:
        """Performs the required operations"""
        from api.services.event import EventService  # pylint: disable=import-outside-toplevel

        event_configuration = find_configuration(source_event, params)
        new_name = str(params.get("new_name", event_configuration.name))
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
                raise ValueError("Event not found for updating event name")
        event_dict = event.as_dict(recursive=False)
        event_dict["name"] = new_name
        EventService.update_event(event_dict, event.id, False, commit=False)
