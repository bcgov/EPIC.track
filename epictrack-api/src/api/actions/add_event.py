"""Disable work start date action handler"""

from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db, Event
from api.models.event_configuration import EventConfiguration
from api.models.phase_code import PhaseCode
from api.models.work_phase import WorkPhase
from api.models.event_template import EventTemplateVisibilityEnum
from api.schemas.response.event_configuration_response import (
    EventConfigurationResponseSchema,
)
from api.schemas.response.event_template_response import EventTemplateResponseSchema


# pylint: disable=import-outside-toplevel


class AddEvent(ActionFactory):
    """Add a new event"""

    def run(self, source_event: Event, params) -> None:
        """Adds a new event based on params"""
        from api.services.event import EventService

        event_data, work_phase_id = self.get_additional_params(source_event, params)
        event_data.update(
            {
                "is_active": True,
                "work_id": source_event.work_id,
                "anticipated_date": source_event.actual_date
                + timedelta(days=params["start_at"]),
            }
        )
        EventService.create_event(
            event_data, work_phase_id=work_phase_id, push_events=True
        )

    def get_additional_params(self, source_event: Event, params):
        """Returns additional parameter"""
        from api.services.work import WorkService

        work_phase = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == source_event.work_id,
                PhaseCode.name == params.get("phase_name"),
                PhaseCode.work_type_id == params.get("work_type_id"),
                PhaseCode.ea_act_id == params.get("ea_act_id"),
                WorkPhase.is_active.is_(True),
                PhaseCode.is_active.is_(True),
            )
            .order_by(WorkPhase.sort_order.desc())
            .first()
        )
        old_event_config = (
            db.session.query(EventConfiguration)
            .filter(
                EventConfiguration.work_phase_id == work_phase.id,
                EventConfiguration.name == params.pop("event_name"),
                EventConfiguration.is_active.is_(True),
            )
            .order_by(EventConfiguration.repeat_count.desc())
            .first()
        )

        event_configuration = EventConfigurationResponseSchema().dump(old_event_config)
        event_configuration["start_at"] = params["start_at"]
        event_configuration["visibility"] = EventTemplateVisibilityEnum.MANDATORY.value
        event_configuration["repeat_count"] = old_event_config.repeat_count + 1
        del event_configuration["id"]
        event_configuration = EventConfiguration(**event_configuration)
        event_configuration.flush()
        template_json = EventTemplateResponseSchema().dump(
            old_event_config.event_template
        )
        WorkService.copy_outcome_and_actions(template_json, event_configuration)
        event_data = {
            "event_configuration_id": event_configuration.id,
            "name": event_configuration.name,
            "number_of_days": event_configuration.number_of_days,
            "source_event_id": event_configuration.parent_id,
        }
        return event_data, work_phase.id
