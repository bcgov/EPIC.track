"""Change the phase end event to another one"""

from datetime import timedelta
from api.actions.base import ActionFactory
from api.models import Event, EventConfiguration, PhaseCode, WorkPhase, db
from api.models.event_configuration import EventPositionEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.models.work import WorkStateEnum, Work
from api.utils import util
from .set_events_status import SetEventsStatus
from .common import find_configuration, find_event_date


class ChangePhaseEndEvent(ActionFactory):
    """Change the phase end event to another one"""

    def run(self, source_event: Event, params) -> None:  # pylint: disable=too-many-locals
        """Change the phase end event to another one"""
        from api.services.event import (EventService)  # pylint: disable=import-outside-toplevel

        new_end_event_configuration = find_configuration(source_event, params)
        # find the work phase of the future end event as per the params
        if source_event.event_configuration_id == new_end_event_configuration.id:
            work_phase = source_event.event_configuration.work_phase
            new_end_event = [source_event]
        else:
            work_phase = self.get_additional_params(source_event, params)
            new_end_event = Event.find_by_params(
                {"event_configuration_id": new_end_event_configuration.id}
            )
        # Find the current end event configuration
        if (
            source_event.event_configuration.event_position
            == EventPositionEnum.END.value
        ):
            current_end_event_config = source_event.event_configuration
        else:
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

        if new_end_event_configuration.id != current_end_event_config.id:
            current_end_event_config.event_position = EventPositionEnum.INTERMEDIATE
            current_end_event_config.update(
                current_end_event_config.as_dict(recursive=False), commit=False
            )

        new_end_event = new_end_event[0]
        # Make sure all the other events after the new end event date should be deactivated
        set_event_status = SetEventsStatus()
        set_event_status.run(new_end_event, {"all_future_events": False})
        if new_end_event_configuration.id != current_end_event_config.id:
            new_end_event_configuration.event_position = EventPositionEnum.END.value
            new_end_event_configuration.update(
                new_end_event_configuration.as_dict(recursive=False), commit=False
            )

        # In case if the source event was already an end event and we are making a new event as end event,
        # updating the actual would have already
        # completed the phase and updated the work state. Since there is going to be a new end event
        # we should revert those changes
        work = new_end_event.event_configuration.work_phase.work
        new_end_event_work_phase = new_end_event.event_configuration.work_phase
        if new_end_event_work_phase.is_completed and not new_end_event.actual_date:
            # reset the work_phase_id at work level to point back to the current phase
            work.current_work_phase_id = new_end_event.event_configuration.work_phase_id
            new_end_event_work_phase.is_completed = False
            new_end_event_work_phase.update(
                new_end_event_work_phase.as_dict(recursive=False), commit=False
            )
        if (
            new_end_event_work_phase.work.work_state == WorkStateEnum.COMPLETED
            and not new_end_event.actual_date
        ):
            new_end_event_work_phase.work.work_state = WorkStateEnum.IN_PROGRESS
            new_end_event_work_phase.work.update(
                new_end_event_work_phase.work.as_dict(recursive=False), commit=False
            )
        # if the new end event has an actual set already, set it as the enddate of the phase
        if new_end_event.actual_date:
            new_end_event_work_phase.is_completed = True
            new_end_event_work_phase.end_date = new_end_event.actual_date
            new_end_event_work_phase.update(
                new_end_event_work_phase.as_dict(recursive=False), commit=False
            )

        all_work_phases = WorkPhase.find_by_params(
            {
                "work_id": source_event.event_configuration.work_phase.work_id,
                "visibility": PhaseVisibilityEnum.REGULAR.value,
            }
        )
        all_work_phases = sorted(all_work_phases, key=lambda x: x.sort_order)
        current_work_phase_index = util.find_index_in_array(
            all_work_phases, new_end_event.event_configuration.work_phase
        )
        # update the current_work_phase_id in the work model
        work = new_end_event.event_configuration.work_phase.work
        if current_work_phase_index == len(all_work_phases) - 1:
            work.work_state = WorkStateEnum.COMPLETED
        elif new_end_event.actual_date:
            work.current_work_phase_id = all_work_phases[
                current_work_phase_index + 1
            ].id
        work.update(work.as_dict(recursive=False), commit=False)

        if len(all_work_phases) > current_work_phase_index + 1:
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
            next_work_phase_start_event.anticipated_date = (
                find_event_date(new_end_event) + timedelta(days=1)
            )
            EventService.update_event(
                next_work_phase_start_event.as_dict(recursive=False),
                next_work_phase_start_event.id,
                True,
                commit=False,
            )

    def _update_work(self, work: Work):
        """Update the current phase and state of the work based on the actual date"""

    def get_additional_params(self, source_event: Event, params):
        """Returns additional parameter"""
        work_phase = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == source_event.work_id,
                WorkPhase.name == params.get("phase_name"),
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
