"""Disable work start date action handler"""
from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.phase_code import PhaseCode
from api.schemas.response.event_template_response import EventTemplateResponseSchema


# pylint: disable= import-outside-toplevel
class AddPhase(ActionFactory):
    """Add a new phase"""

    def run(self, source_event: Event, params: dict) -> None:
        """Adds a new phase based on params"""
        # Importing here to avoid circular imports
        from api.services.event_template import EventTemplateService
        from api.services.work import WorkService

        phase_start_date = source_event.actual_date + timedelta(days=1)
        work_phase_data = self.get_additional_params(params)
        work_phase_data.update(
            {
                "work_id": source_event.work.id,
                "start_date": f"{phase_start_date}",
                "end_date": f"{phase_start_date + timedelta(days=work_phase_data['number_of_days'])}",
            }
        )
        event_templates = EventTemplateService.find_by_phase_id(
            work_phase_data["phase_id"]
        )
        event_template_json = EventTemplateResponseSchema(many=True).dump(
            event_templates
        )
        WorkService.handle_phase(work_phase_data, event_template_json)

    def get_additional_params(self, params):
        """Returns additional parameter"""
        new_name = params.pop("new_name")
        legislated = params.pop("legislated")
        params["name"] = params.pop("phase_name")
        phase = db.session.query(PhaseCode).filter_by(**params, is_active=True).first()

        work_phase_data = {
            "phase_id": phase.id,
            "name": new_name,
            "legislated": legislated,
            "number_of_days": phase.number_of_days,
        }

        return work_phase_data
