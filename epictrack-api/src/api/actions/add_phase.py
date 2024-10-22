"""Disable work start date action handler"""

from datetime import timedelta
from typing import List
from operator import attrgetter
from sqlalchemy import and_

from api.actions.base import ActionFactory
from api.models import Event, EventConfiguration, WorkPhase, Work, db
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum
from api.models.event_template import (
    EventTemplateVisibilityEnum,
    EventPositionEnum,
)
from api.models.event_category import PRIMARY_CATEGORIES
from api.services.event_template import EventTemplateService
from api.schemas import response as res


# pylint: disable= import-outside-toplevel, too-many-locals
class AddPhase(ActionFactory):
    """Add a new phase"""

    def run(self, source_event: Event, params) -> None:
        """Adds a new phase based on params"""
        # Importing here to avoid circular imports
        from api.services.work import WorkService
        from api.services.work_phase import WorkPhaseService

        number_of_phases = len(params)
        # Push the sort order of the existing work phases after the new ones
        self.preset_sort_order(source_event, number_of_phases)
        number_of_days_to_be_added = self._get_number_of_days_to_be_added(source_event)
        phase_start_date = source_event.actual_date + timedelta(
            days=number_of_days_to_be_added
        )
        sort_order = source_event.event_configuration.work_phase.sort_order + 1
        total_number_of_days = 0
        for param in params:
            work_phase_data = self.get_additional_params(source_event, param)
            total_number_of_days = total_number_of_days + work_phase_data.get(
                "number_of_days"
            )
            end_date = phase_start_date + timedelta(
                days=work_phase_data.get("number_of_days")
            )
            work_phase_data.update(
                {
                    "work_id": source_event.work.id,
                    "start_date": f"{phase_start_date}",
                    "end_date": end_date,
                    "sort_order": sort_order,
                }
            )
            event_templates_for_the_phase = EventTemplateService.find_by_phase_id(
                work_phase_data.get("phase_id")
            )
            event_templates_for_the_phase_json = res.EventTemplateResponseSchema(
                many=True
            ).dump(event_templates_for_the_phase)
            work_phase = WorkService.create_events_by_template(
                work_phase_data, event_templates_for_the_phase_json
            )
            sort_order = sort_order + 1
            phase_start_date = end_date + timedelta(days=1)
        # update the current work phase
        current_work_phase = WorkPhaseService.find_current_work_phase(
            source_event.work_id
        )

        work = Work.find_by_id(source_event.work_id)
        work.current_work_phase_id = current_work_phase.id
        work.update(work.as_dict(recursive=False), commit=False)

        if work_phase:
            self.update_susequent_work_phases(work_phase)

    def _get_number_of_days_to_be_added(self, source_event) -> int:
        """Returns the phase start date"""
        if source_event.event_position == EventPositionEnum.INTERMEDIATE.value:
            work_phase_id = source_event.event_configuration.work_phase.id
            event_configurations = EventConfiguration.find_by_params(
                {
                    "work_phase_id": work_phase_id,
                    "visibility": EventTemplateVisibilityEnum.MANDATORY.value,
                }
            )
            primary_categories = list(map(lambda x: x.value, PRIMARY_CATEGORIES))
            filtered_configurations = [
                template
                for template in event_configurations
                if template.event_category_id in primary_categories
                and template.sort_order > source_event.event_configuration.sort_order
            ]
            last_mandatory_configuration = max(
                filtered_configurations, key=attrgetter("sort_order")
            )
            return (
                int(last_mandatory_configuration.start_at)
                - int(source_event.event_configuration.start_at)
            ) + 1
        return 1

    def preset_sort_order(self, source_event, number_of_new_work_phases: int) -> None:
        """Adjust the sort order of the existing work phases for the new ones"""
        db.session.query(WorkPhase).filter(
            WorkPhase.sort_order
            > source_event.event_configuration.work_phase.sort_order,
            WorkPhase.work_id == source_event.work_id,
        ).update(
            {WorkPhase.sort_order: WorkPhase.sort_order + number_of_new_work_phases}
        )

    def update_susequent_work_phases(
        self,
        latest_work_phase_added: WorkPhase,
    ):
        """Update subsequent work phases with the number of additional days added by the phases"""
        from api.services.event import EventService

        # Find the next work phase after the new work phases
        next_work_phase = (
            db.session.query(WorkPhase)
            .filter(
                WorkPhase.work_id == latest_work_phase_added.work_id,
                WorkPhase.sort_order > latest_work_phase_added.sort_order,
                WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                WorkPhase.is_active.is_(True),
            )
            .order_by(WorkPhase.sort_order)
            .first()
        )

        # Find the start event of the work phase
        if next_work_phase:
            start_event = (
                db.session.query(Event)
                .join(
                    EventConfiguration,
                    and_(
                        Event.event_configuration_id == EventConfiguration.id,
                        EventConfiguration.is_active.is_(True),
                        EventConfiguration.visibility
                        == EventTemplateVisibilityEnum.MANDATORY.value,
                        EventConfiguration.event_position == EventPositionEnum.START,
                    ),
                )
                .join(
                    WorkPhase,
                    and_(
                        EventConfiguration.work_phase_id == WorkPhase.id,
                        WorkPhase.id == next_work_phase.id,
                    ),
                )
                .first()
            )

            # Update the start event anticipated date by the number of total days added by all the new phases
            # This will push all the susequent work phases and all the events
            start_event_dict = start_event.as_dict(recursive=False)
            start_event_dict["anticipated_date"] = (
                latest_work_phase_added.end_date + timedelta(days=1)
            )
            EventService.update_event(
                start_event_dict, start_event.id, True, commit=False
            )

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
            "visibility": PhaseVisibilityEnum.REGULAR,
        }
        return work_phase_data

    def get_configurations(
        self, source_event: Event, params
    ) -> List[EventConfiguration]:
        """Find the latest event configurations per the given params"""
        work_phase = (
            db.session.query(WorkPhase)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .filter(
                WorkPhase.work_id == source_event.work_id,
                WorkPhase.name == params.get("phase_name"),
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
