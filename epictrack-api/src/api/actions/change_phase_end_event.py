"""Change the phase end event to another one"""

from datetime import timedelta
from api.actions.base import ActionFactory
from api.models import Event, EventConfiguration, PhaseCode, WorkPhase, db
from api.models.event_configuration import EventPositionEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.utils import util
from .set_events_status import SetEventsStatus


class ChangePhaseEndEvent(ActionFactory):
    """Change the phase end event to another one"""

    def run(self, source_event: Event, params) -> None:
        """Change the phase end event to another one"""
        from api.services.event import EventService  # pylint: disable=import-outside-toplevel

        work_phase = self.get_additional_params(source_event, params)
        current_end_event_config = (
            db.session.query(EventConfiguration)
            .filter(
                EventConfiguration.work_phase_id == work_phase.id,
                EventConfiguration.event_position == EventPositionEnum.END.value,
                EventConfiguration.is_active.is_(True),
                EventConfiguration.is_deleted.is_(False),
            )
            .first()
        )
        current_end_event_config.event_position = EventPositionEnum.INTERMEDIATE.value
        current_end_event_config.update(
            current_end_event_config.as_dict(recursive=False), commit=False
        )
        # Make sure all the other events after the new end event date should be deactivated
        set_event_status = SetEventsStatus()
        set_event_status.run(source_event, {"all_future_events": False})
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
        # Since this source event is the new last event and has actual date, the work phase
        # is completed
        work_phase.end_date = source_event.actual_date
        work_phase.is_completed = True
        work_phase.update(work_phase.as_dict(recursive=False), commit=False)

        all_work_phases = WorkPhase.find_by_params(
            {
                "work_id": source_event.event_configuration.work_phase.work_id,
                "visibility": PhaseVisibilityEnum.REGULAR.value,
            }
        )
        all_work_phases = sorted(all_work_phases, key=lambda x: x.sort_order)
        current_work_phase_index = util.find_index_in_array(
            all_work_phases, source_event.event_configuration.work_phase
        )
        next_work_phase = all_work_phases[current_work_phase_index + 1]
        work_phase_events = Event.find_milestone_events_by_work_phase(
            next_work_phase.id
        )
        next_work_phase_start_event = next(
            iter(
                [
                    event
                    for event in work_phase_events
                    if event.event_configuration.event_position.value
                    == EventPositionEnum.START.value
                ]
            ),
            None,
        )
        next_work_phase_start_event.start_date = source_event.actual_date + timedelta(
            days=1
        )
        EventService.update_event(
            next_work_phase_start_event.as_dict(recursive=False),
            next_work_phase_start_event.id,
            True,
            commit=False,
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
