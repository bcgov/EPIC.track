"""Set phases status action handler"""
from api.actions.base import ActionFactory
from api.models import PRIMARY_CATEGORIES, db
from api.models.event import Event
from api.models.event_configuration import EventConfiguration
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum
from api.models.work_phase import WorkPhase


class SetPhasesStatus(ActionFactory):
    """Set phases status action"""

    def run(self, source_event: Event, params):
        """Sets all future phases to INACTIVE"""
        from api.services import EventService  # pylint: disable=import-outside-toplevel
        work_phase_ids = []
        if isinstance(params, list):
            for phase_des in params:
                work_phase_ids.append(
                    self.get_additional_params(source_event, phase_des)
                )
        elif params.get("all_future_phases") is not None:
            work_phases = (
                db.session.query(WorkPhase)
                .filter(
                    WorkPhase.sort_order > source_event.event_configuration.work_phase.sort_order
                )
                .all()
            )
            work_phase_ids = list(map(lambda x: x.id, work_phases))
            # deactivate all the future events in the current phase
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
                event.is_active = False
                event.update(event.as_dict(recursive=False), commit=False)
        self._deactivate_phases_and_events(work_phase_ids)

    def get_additional_params(self, source_event: Event, params) -> int:
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
        return work_phase.id

    def _deactivate_phases_and_events(self, work_phase_ids: [int]) -> None:
        """Deactivate given work phases and its events"""
        db.session.query(WorkPhase).filter(WorkPhase.id.in_(work_phase_ids)).update(
            {WorkPhase.is_active: False}
        )
        event_configurations = db.session.query(EventConfiguration).filter(
            EventConfiguration.work_phase_id.in_(work_phase_ids)
        )
        event_configuration_ids = list(map(lambda x: x.id, event_configurations))
        db.session.query(Event).filter(
            Event.event_configuration_id.in_(event_configuration_ids)
        ).update({Event.is_active: False})
