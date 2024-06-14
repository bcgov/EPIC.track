"""Create work action handler"""
from datetime import timedelta

from pytz import timezone

from api.actions.base import ActionFactory
from api.models.linked_work import LinkedWork


class CreateWork(ActionFactory):
    """Create work action"""

    def run(self, source_event, params) -> None:
        """Create a new WORK: "Minister's Designation" and link to this work's Project"""
        # Importing here to avoid circular imports
        from api.services.work import WorkService  # pylint: disable=import-outside-toplevel

        start_date = source_event.actual_date + timedelta(days=1)
        start_date = start_date.astimezone(timezone('US/Pacific'))
        new_work = {
            "ea_act_id": source_event.work.ea_act_id,
            "work_type_id": params.get("work_type"),
            "start_date": start_date,
            "simple_title": "",
            "report_description": "",
            "project_id": source_event.work.project_id,
            "ministry_id": source_event.work.ministry_id,
            "federal_involvement_id": source_event.work.federal_involvement_id,
            "is_active": True,
            "responsible_epd_id": source_event.work.responsible_epd_id,
            # Added because of errors
            "work_lead_id": source_event.work.work_lead_id,
            "eao_team_id": source_event.work.eao_team_id,
            "decision_by_id": source_event.work.decision_by_id,
        }
        work = WorkService.create_work(new_work)
        linked_work = LinkedWork(
            **{
                "source_work_id": source_event.work_id,
                "linked_work_id": work.id,
                "source_event_id": source_event.id,
                "is_active": True,
            }
        )
        linked_work.flush()
