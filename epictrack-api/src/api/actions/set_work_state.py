"""Set work state action handler"""

from datetime import datetime, timezone
from api.actions.base import ActionFactory
from api.models import db
from api.models.special_field import EntityEnum, FieldTypeEnum
from api.models.work import Work, WorkStateEnum, EndingWorkStateEnum
from api.services.special_field import SpecialFieldService
from .change_phase_end_event import ChangePhaseEndEvent


class SetWorkState(ActionFactory):
    """Set work state status action"""

    def run(self, source_event, params) -> None:
        """Sets the work as per action configuration"""
        work_state = params.get("work_state")
        if work_state in [
            WorkStateEnum.TERMINATED.value,
            WorkStateEnum.WITHDRAWN.value,
        ]:
            change_phase_end_event = ChangePhaseEndEvent()
            change_phase_end_event_param = {
                "phase_name": source_event.event_configuration.work_phase.name,
                "work_type_id": source_event.work.work_type_id,
                "ea_act_id": source_event.work.ea_act_id,
                "event_name": source_event.event_configuration.name,
            }
            change_phase_end_event.run(source_event, change_phase_end_event_param)
        is_active = True
        work_decision_date = None
        if work_state in [state.value for state in EndingWorkStateEnum]:
            is_active = False
            work_decision_date = datetime.now()
        db.session.query(Work).filter(Work.id == source_event.work_id).update(
            {Work.work_state: work_state, Work.is_active: is_active, Work.work_decision_date: work_decision_date}
        )
        work_state_special_field_data = {
            "entity": EntityEnum.WORK.value,
            "entity_id": source_event.work_id,
            "field_name": "work_state",
            "field_value": work_state,
            "active_from": datetime.now(timezone.utc),
            "field_type": FieldTypeEnum.STRING.value,
        }
        SpecialFieldService.create_special_field_entry(
            work_state_special_field_data, commit=False
        )
