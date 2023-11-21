"""Disable work start date action handler"""
from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import db, WorkPhase, Event, EventConfiguration
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum
from api.schemas import response as res


# pylint: disable= import-outside-toplevel
class AddPhase(ActionFactory):
    """Add a new phase"""

    def run(self, source_event: Event, params: dict) -> None:
        """Adds a new phase based on params"""
        # Importing here to avoid circular imports
        from api.services.work import WorkService

        phase_start_date = source_event.actual_date + timedelta(days=1)
        work_phase_data = self.get_additional_params(source_event, params)
        work_phase_data.update(
            {
                "work_id": source_event.work.id,
                "start_date": f"{phase_start_date}",
                "end_date": f"{phase_start_date + timedelta(days=work_phase_data['number_of_days'])}",
                "sort_order": source_event.event_configuration.work_phase.sort_order
                + 1,
            }
        )
        work_phases = (
            db.session.query(WorkPhase)
            .filter(
                WorkPhase.sort_order
                > source_event.event_configuration.work_phase.sort_order,
                WorkPhase.work_id == source_event.work_id,
            )
            .all()
        )
        for work_phase in work_phases:
            work_phase.sort_order = work_phase.sort_order + 1
            work_phase.update(work_phase.as_dict(recursive=False), commit=False)
        work_phase = WorkPhase.flush(WorkPhase(**work_phase_data))
        event_configurations = self.get_configurations(source_event, params)
        event_configurations = res.EventConfigurationResponseSchema(many=True).dump(
            event_configurations
        )
        new_event_configurations = WorkService.create_configurations(
            work_phase, event_configurations, False
        )
        WorkService.create_events_by_configuration(work_phase, new_event_configurations)

    def get_additional_params(self, source_event, params):
        """Returns additional parameter"""
        query_params = {
            "name": params.get("phase_name"),
            "work_type_id": params.get("work_type_id"),
            "ea_act_id": params.get("ea_act_id"),
        }
        phase = (
            db.session.query(PhaseCode)
            .filter_by(**query_params, is_active=True)
            .first()
        )

        work_phase_data = {
            "phase_id": phase.id,
            "name": params.get("new_name"),
            "legislated": params.get("legislated"),
            "number_of_days": phase.number_of_days,
            "visibility": PhaseVisibilityEnum.REGULAR.value,
        }
        return work_phase_data

    def get_configurations(self, source_event: Event, params) -> [EventConfiguration]:
        """Find the latest event configurations per the given params"""
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

        event_configurations = EventConfiguration.find_by_params(
            {"work_phase_id": work_phase.id}
        )
        return event_configurations
