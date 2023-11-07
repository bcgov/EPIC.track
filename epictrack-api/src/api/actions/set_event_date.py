"""Disable work start date action handler"""

from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db
from api.models.event import Event
from api.models.event_configuration import EventConfiguration
from api.models.phase_code import PhaseCode
from api.models.work_phase import WorkPhase


class SetEventDate(ActionFactory):  # pylint: disable=too-few-public-methods
    """Sets the event date"""

    def run(self, source_event, params: dict) -> None:
        """Performs the required operations"""
        event_configuration_id = self.get_additional_params(params)
        db.session.query(Event).filter(
            Event.work_id == source_event.work_id,
            Event.is_active.is_(True),
            Event.event_configuration_id == event_configuration_id,
        ).update({
            "anticipated_date": source_event.actual_date + timedelta(days=1)
        })
        db.session.commit()

    def get_additional_params(self, params):
        """Returns additional parameter"""
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
        event_configuration = db.session.query(EventConfiguration).filter(
            EventConfiguration.work_phase_id == work_phase.id,
            EventConfiguration.name == params["event_name"],
            EventConfiguration.is_active.is_(True),
        ).first()
        return event_configuration.id
