"""Disable work start date action handler"""

from datetime import timedelta

from pytz import timezone

from api.actions.base import ActionFactory
from api.models import db
from api.models.event_configuration import EventConfiguration
from api.models.phase_code import PhaseCode
from api.models.work_phase import WorkPhase
from api.schemas.response.event_configuration_response import EventConfigurationResponseSchema
from api.schemas.response.event_template_response import EventTemplateResponseSchema


# pylint: disable=import-outside-toplevel


class AddEvent(ActionFactory):
    """Add a new event"""

    def run(self, source_event, params) -> None:
        """Adds a new event based on params"""
        from api.services.event import EventService

        event_data, work_phase_id = self.get_additional_params(params)
        # Convert to PST so that correct date time will be taken after 'get_start_of_day' method
        anticipated_date = source_event.actual_date + timedelta(days=params["start_at"])
        anticipated_date = anticipated_date.astimezone(timezone('US/Pacific'))
        event_data.update(
            {
                "is_active": True,
                "work_id": source_event.work_id,
                "anticipated_date": anticipated_date,
            }
        )
        EventService.create_event(event_data, work_phase_id=work_phase_id, push_events=True)

    def get_additional_params(self, params):
        """Returns additional parameter"""
        from api.services.work import WorkService

        phase = {
            "name": params.pop("phase_name"),
            "work_type_id": params.pop("work_type_id"),
            "ea_act_id": params.pop("ea_act_id"),
        }
        phase_query = (
            db.session.query(PhaseCode).filter_by(**phase, is_active=True).subquery()
        )
        work_phase = (
            db.session.query(WorkPhase)
            .join(phase_query, WorkPhase.phase_id == phase_query.c.id)
            .filter(WorkPhase.is_active.is_(True))
            .first()
        )
        old_event_config = (
            db.session.query(EventConfiguration)
            .filter(
                EventConfiguration.work_phase_id == work_phase.id,
                EventConfiguration.name == params.pop("event_name"),
                EventConfiguration.is_active.is_(True),
            )
            .first()
        )

        event_configuration = EventConfigurationResponseSchema().dump(old_event_config)
        event_configuration["start_at"] = params["start_at"]
        del event_configuration["id"]
        event_configuration = EventConfiguration(**event_configuration)
        event_configuration.flush()
        template_json = EventTemplateResponseSchema().dump(old_event_config.event_template)
        WorkService.copy_outcome_and_actions(template_json, event_configuration)
        event_data = {
            "event_configuration_id": event_configuration.id,
            "name": event_configuration.name,
            "number_of_days": event_configuration.number_of_days,
            "source_event_id": event_configuration.parent_id,
        }
        return event_data, work_phase.id
