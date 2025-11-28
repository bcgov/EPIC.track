"""Add Event action handler"""

from datetime import timedelta

from api.actions.base import ActionFactory
from api.models import Event, db
from api.models.event_configuration import EventConfiguration
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.phase_code import PhaseCode
from api.models.work_phase import WorkPhase
from api.schemas.response.event_configuration_response import (
    EventConfigurationResponseSchema,
)
from .common import find_event_date, param_to_bool
from flask import current_app

# pylint: disable=import-outside-toplevel


class AddEvent(ActionFactory):
    """Add a new event"""

    def run(self, source_event: Event, params) -> None:
        """Adds a new event based on params"""
        from api.services.event import EventService
        # Normalize params: always a list of dicts
        if isinstance(params, dict):
            params = [params]
        if not isinstance(params, list):
            raise ValueError(f"Expected dict or list of dicts, got {type(params)}")
        for param in params:
            if not isinstance(param, dict):
                raise ValueError(f"Expected dict for param, got {type(param)}: {param}")
            event_data, work_phase_id, work_phase_start_date, event_configuration = self.get_additional_params(source_event, param)
            number_of_days_to_be_added = int(param.get("start_at", event_configuration.start_at))

            # Setting anticipated date based on source event date + start at
            # unless use_phase_start is set, then use phase start date + start at
            if param_to_bool(param.get("use_phase_start", False)):
                current_app.logger.info("Ignoring source event date and using phase start date")
                anticipated_date = work_phase_start_date + timedelta(days=number_of_days_to_be_added)
            else:
                anticipated_date = find_event_date(source_event) + timedelta(days=number_of_days_to_be_added)
            event_data.update(
                {
                    "is_active": True,
                    "work_id": source_event.work_id,
                    "anticipated_date": anticipated_date,
                }
            )
            new_event = EventService.create_event(
                event_data, work_phase_id=work_phase_id, push_events=True, commit=False
            )
            new_event.flush()
            source_event = new_event

    def get_additional_params(self, source_event: Event, params):
        """Returns additional parameter"""
        from api.services.work import WorkService
        # Find phase
        phase_name = params.get("phase_name") or source_event.event_configuration.work_phase.name
        work_phase = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == source_event.work_id,
                WorkPhase.name == phase_name,
                PhaseCode.work_type_id == params.get("work_type_id"),
                PhaseCode.ea_act_id == params.get("ea_act_id"),
                WorkPhase.is_active.is_(True),
                PhaseCode.is_active.is_(True),
            )
            .order_by(WorkPhase.sort_order.desc())
            .first()
        )
        # Find existing event config to copy
        old_event_config = (
            db.session.query(EventConfiguration)
            .filter(
                EventConfiguration.work_phase_id == work_phase.id,
                EventConfiguration.name == params.get("event_name"),
                EventConfiguration.is_active.is_(True),
            )
            .order_by(EventConfiguration.repeat_count.desc())
            .first()
        )
        # If not found, get the latest inactive one
        if not old_event_config:
            old_event_config = (
                db.session.query(EventConfiguration)
                .filter(
                    EventConfiguration.work_phase_id == work_phase.id,
                    EventConfiguration.name == params.get("event_name"),
                )
                .order_by(EventConfiguration.repeat_count.desc())
                .first()
            )

        if not old_event_config:
            raise ValueError(
                f"No event configuration found for phase '{params.get('phase_name')}' "
                f"and event '{params.get('event_name')}'."
            )

        # Copy existing old config
        event_configuration_dict = EventConfigurationResponseSchema().dump(old_event_config)
        event_configuration_dict["event_position"] = EventPositionEnum(event_configuration_dict["event_position"])
        event_configuration_dict["visibility"] = EventTemplateVisibilityEnum(event_configuration_dict["visibility"])

        # Modify fields from params
        event_configuration_dict["start_at"] = params.get("start_at", old_event_config.start_at)
        raw_visibility = params.get("visibility", EventTemplateVisibilityEnum.MANDATORY)
        if not isinstance(raw_visibility, EventTemplateVisibilityEnum):
            raw_visibility = EventTemplateVisibilityEnum(raw_visibility)
        event_configuration_dict["visibility"] = raw_visibility
        event_configuration_dict["repeat_count"] = old_event_config.repeat_count + 1
        event_configuration_dict["name"] = params.get("new_name", old_event_config.name)

        # Remove ID before creating a new config
        del event_configuration_dict["id"]

        # Create new config
        event_configuration = EventConfiguration(**event_configuration_dict)
        event_configuration.flush()
        # Copy outcomes and actions
        WorkService.copy_outcome_and_actions(
            old_event_config.as_dict(recursive=False),
            event_configuration,
            from_template=False,
        )
        event_data = {
            "event_configuration_id": event_configuration.id,
            "name": event_configuration.name,
            "number_of_days": event_configuration.number_of_days,
            "source_event_id": event_configuration.parent_id,
        }

        return event_data, work_phase.id, work_phase.start_date, event_configuration
