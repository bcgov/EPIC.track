"""Disable work start date action handler"""

from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db
from api.models.action_configuration import ActionConfiguration
from api.models.action_template import ActionTemplate
from api.models.event_configuration import EventConfiguration
from api.models.event_template import EventTemplate
from api.models.outcome_configuration import OutcomeConfiguration
from api.models.phase_code import PhaseCode
from api.models.work_phase import WorkPhase
from api.schemas.request.action_configuration_request import ActionConfigurationBodyParameterSchema
from api.schemas.request.outcome_configuration_request import OutcomeConfigurationBodyParameterSchema
from api.schemas.response.action_template_response import ActionTemplateResponseSchema
from api.schemas.response.event_template_response import EventTemplateResponseSchema
from api.schemas.response.outcome_template_response import OutcomeTemplateResponseSchema


# pylint: disable=import-outside-toplevel


class AddEvent(ActionFactory):  # pylint: disable=too-few-public-methods
    """Add a new event"""

    def run(self, source_event, params) -> None:
        """Adds a new event based on params"""
        from api.services.event import EventService

        event_data, work_phase_id = self.get_additional_params(params)
        event_data.update(
            {
                "is_active": True,
                "work_id": source_event.work_id,
                "anticipated_date": source_event.actual_date
                + timedelta(days=params["start_at"]),
            }
        )
        EventService.create_event(event_data, work_phase_id=work_phase_id)

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
        event_template = (
            db.session.query(EventTemplate)
            .filter(
                EventTemplate.phase_id == phase_query.c.id,
                EventTemplate.name == params.pop("event_name"),
                EventTemplate.is_active.is_(True),
            )
            .first()
        )
        event_configuration = {
            "name": event_template.name,
            "parent_id": event_template.parent_id,
            "event_type_id": event_template.event_type_id,
            "event_category_id": event_template.event_category_id,
            "start_at": params["start_at"],
            "number_of_days": event_template.number_of_days,
            "mandatory": event_template.mandatory,
            "event_position": event_template.event_position,
            "multiple_days": event_template.multiple_days,
            "sort_order": event_template.sort_order,
            "template_id": event_template.id,
            "work_phase_id": work_phase.id,
        }
        event_configuration = EventConfiguration(**event_configuration)
        event_configuration.flush()
        template_json = EventTemplateResponseSchema().dump(event_template)
        WorkService.copy_outcome_and_actions(template_json, event_configuration)
        event_data = {
            "event_configuration_id": event_configuration.id,
            "name": event_configuration.name,
            "number_of_days": event_configuration.number_of_days,
            "source_event_id": event_configuration.parent_id,
        }
        return event_data, work_phase.id
