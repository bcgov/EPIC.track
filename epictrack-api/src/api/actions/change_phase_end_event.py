"""Change the phase end event to another one"""

from api.actions.base import ActionFactory
from api.models import db, Event, PhaseCode, WorkPhase, EventConfiguration
from api.models.event_configuration import EventPositionEnum
from api.models.phase_code import PhaseVisibilityEnum


class ChangePhaseEndEvent(ActionFactory):
    """Change the phase end event to another one"""

    def run(self, source_event: Event, params) -> None:
        """Change the phase end event to another one"""
        work_phase = self.get_additional_params(source_event, params)
        current_end_event_config = db.session.query(EventConfiguration).filter(
            EventConfiguration.work_phase_id == work_phase.id,
            EventConfiguration.event_position == EventPositionEnum.END.value,
        )
        current_end_event_config.event_position = EventPositionEnum.INTERMEDIATE.value
        current_end_event_config.update(
            current_end_event_config.as_dict(recursive=False), commit=False
        )
        new_end_event_configuration = (
            db.session.query(EventConfiguration)
            .filter(
                EventConfiguration.work_phase_id == work_phase.id,
                EventConfiguration.name == params.get("event_name"),
                EventConfiguration.is_active.is_(True),
            )
            .first()
        )
        new_end_event_configuration.event_position = EventPositionEnum.END.value
        new_end_event_configuration.update(
            new_end_event_configuration.as_dict(recursive=False), commit=False
        )

    def get_additional_params(self, source_event: Event, params):
        """Returns additional parameter"""
        work_phase = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == source_event.work_id,
                PhaseCode.name == params.get("phase_name"),
                PhaseCode.work_type_id == params.get("work_type_id"),
                PhaseCode.ea_act_id == params.get("ea_act_id"),
                WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                WorkPhase.is_active.is_(True),
                PhaseCode.is_active.is_(True),
            )
            .order_by(WorkPhase.sort_order.desc())
            .first()
        )
        return work_phase
