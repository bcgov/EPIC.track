"""Set events status action handler"""

from api.actions.base import ActionFactory
from api.models import db, PRIMARY_CATEGORIES
from api.models.event import Event

from .common import find_configuration, deactivate_calendar_events_by_configuration_ids


class SetEventsStatus(ActionFactory):
    """Set events status action"""

    def run(self, source_event, params):
        """Sets all future events to INACTIVE"""
        from api.services import EventService  # pylint: disable=import-outside-toplevel

        event_configuration_ids = []
        if isinstance(params, list):
            for event_params in params:
                event_configuration = find_configuration(source_event, event_params)
                event_configuration_ids.append(event_configuration.id)
                db.session.query(Event).filter(
                    Event.event_configuration_id == event_configuration.id
                ).update({Event.is_active: event_params.get("is_active")})
        elif params.get("all_future_events") is not None:
            events = EventService.find_events(
                source_event.work_id,
                source_event.event_configuration.work_phase_id,
                PRIMARY_CATEGORIES,
            )
            event_index = EventService.find_event_index(
                events, source_event, source_event.event_configuration.work_phase
            )
            events_to_be_updated = events[(event_index + 1):]
            for event in events_to_be_updated:
                event_configuration_ids.append(event.event_configuration_id)
                event.is_active = False
                event.update(event.as_dict(recursive=False), commit=False)
        # Deactivate all child events (Calendar events at this point) of the main event
        deactivate_calendar_events_by_configuration_ids(event_configuration_ids)
