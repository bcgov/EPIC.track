# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Works."""
from datetime import timedelta
from io import BytesIO

import pandas as pd
from sqlalchemy import exc
from sqlalchemy.orm import aliased

from reports_api.exceptions import ResourceExistsError, ResourceNotFoundError
from reports_api.models import (
    CalendarEvent, EAOTeam, Event, EventConfiguration, Project, Role, Staff, StaffWorkRole, Work, WorkCalendarEvent,
    WorkPhase, db)
from reports_api.models.event_category import EventCategoryEnum
from reports_api.schemas.response import EventTemplateResponseSchema
from reports_api.schemas.work_plan import WorkPlanSchema
from reports_api.services.event import EventService
from reports_api.services.event_template import EventTemplateService
from reports_api.services.phaseservice import PhaseService
from reports_api.services.task import TaskService


class WorkService:
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, title, work_id=None):
        """Checks if a work exists for a given title"""
        return Work.check_existence(title=title, work_id=work_id)

    @classmethod
    def find_all_works(cls):
        """Find all non-deleted works"""
        works = Work.find_all(default_filters=False)
        return works

    @classmethod
    def find_allocated_resources(cls):
        """Find all allocated resources"""
        lead = aliased(Staff)
        epd = aliased(Staff)
        work_result = (
            Work.query.join(Project)
            .filter(Project.is_deleted.is_(False), Project.is_project_closed.is_(False))
            .outerjoin(EAOTeam, Work.eao_team_id == EAOTeam.id)
            .outerjoin(lead, lead.id == Work.work_lead_id)
            .outerjoin(epd, epd.id == Work.responsible_epd_id)
            .all()
        )
        works = [
            {
                "id": work.id,
                "title": work.title,
                "project": work.project,
                "eao_team": work.eao_team,
                "responsible_epd": work.responsible_epd,
                "work_lead": work.work_lead,
            }
            for work in work_result
        ]
        work_ids = [work["id"] for work in works]
        staff_result = (
            Staff.query.join(StaffWorkRole, StaffWorkRole.staff_id == Staff.id)
            .filter(
                StaffWorkRole.work_id.in_(work_ids), StaffWorkRole.is_deleted.is_(False)
            )
            .join(Role, Role.id == StaffWorkRole.role_id)
            .add_entity(Role)
            .add_columns(StaffWorkRole.work_id)
            .all()
        )
        for work in works:
            staffs = list(
                filter(
                    lambda x, _work_id=work["id"]: x.work_id == _work_id, staff_result
                )
            )
            work["staff"] = staffs
        return works

    @classmethod
    def create_work(cls, payload):
        # pylint: disable=too-many-locals
        """Create a new work"""
        try:
            if cls.check_existence(payload["title"]):
                raise ResourceExistsError("Work with same title already exists")
            work = Work(**payload)
            work.flush()
            phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(
                work.ea_act_id, work.work_type_id
            )
            phase_ids = list(map(lambda x: x.id, phases))
            event_templates = EventTemplateService.find_by_phase_ids(phase_ids)
            event_template_json = EventTemplateResponseSchema(many=True).dump(
                event_templates
            )
            event_configurations = []
            for parent_config in list(
                filter(lambda x: not x["parent_id"], event_template_json)
            ):
                parent_config["work_id"] = work.id
                p_result = EventConfiguration(
                    **cls._prepare_configuration(parent_config)
                )
                p_result.flush()
                event_configurations.append(p_result)
                for child in list(
                    filter(
                        lambda x, _parent_config_id=parent_config["id"]: x["parent_id"] == _parent_config_id,
                        event_template_json,
                    )
                ):
                    child["work_id"] = work.id
                    child["parent_id"] = p_result.id
                    c_result = EventConfiguration.flush(
                                EventConfiguration(**cls._prepare_configuration(child))
                    )
                    event_configurations.append(c_result)
            work.current_phase_id = phases[0].id
            phase_start_date = work.start_date
            for phase in phases:
                end_date = phase_start_date + timedelta(days=phase.number_of_days)
                WorkPhase.flush(
                    WorkPhase(
                        **{
                            "work_id": work.id,
                            "phase_id": phase.id,
                            "start_date": f"{phase_start_date}",
                            "end_date": f"{end_date}",
                        }
                    )
                )
                parent_event_configs = list(
                    filter(lambda x, _phase_id=phase.id: not x.parent_id and x.mandatory and
                           x.phase_id == _phase_id, event_configurations)
                )
                for p_event_conf in parent_event_configs:
                    p_event_start_date = phase_start_date + timedelta(
                        days=cls._find_start_at_value(p_event_conf.start_at, 0)
                    )
                    p_event = Event.flush(
                        Event(
                            **cls._prepare_regular_event(
                                p_event_conf.name,
                                str(p_event_start_date),
                                p_event_conf.number_of_days,
                                p_event_conf.id,
                            )
                        )
                    )
                    c_events = list(
                        filter(
                            lambda x, _parent_id=p_event_conf.id, _phase_id=phase.id: x.parent_id == _parent_id and
                            x.mandatory and x.phase_id == _phase_id,
                            event_configurations,
                        )
                    )
                    for c_event_conf in c_events:
                        c_event_start_date = p_event_start_date + timedelta(
                            days=cls._find_start_at_value(
                                c_event_conf.start_at, p_event_conf.number_of_days
                            )
                        )
                        if (
                            c_event_conf.event_category_id == EventCategoryEnum.CALENDAR.value
                        ):
                            cal_event = CalendarEvent.flush(
                                CalendarEvent(
                                    **{
                                        "name": c_event_conf.name,
                                        "anticipated_date": c_event_start_date,
                                        "number_of_days": c_event_conf.number_of_days,
                                    }
                                )
                            )
                            WorkCalendarEvent.flush(
                                WorkCalendarEvent(
                                    **{
                                        "calendar_event_id": cal_event.id,
                                        "source_event_id": p_event.id,
                                        "event_configuration_id": c_event_conf.id,
                                    }
                                )
                            )
                        else:
                            Event.flush(
                                Event(
                                    **cls._prepare_regular_event(
                                        c_event_conf.name,
                                        str(c_event_start_date),
                                        c_event_conf.number_of_days,
                                        c_event_conf.id,
                                        p_event.id,
                                    )
                                )
                            )
                phase_start_date = end_date + timedelta(days=1)
            db.session.commit()
        except exc.IntegrityError as exception:
            db.session.rollback()
            raise exception
        return work

    @classmethod
    def find_staff(cls, work_id: int) -> [Staff]:
        """Active staff assigned on a work"""
        query = db.session.query(Staff)\
            .join(StaffWorkRole, StaffWorkRole.staff_id == Staff.id)\
            .filter(StaffWorkRole.is_active.is_(True),
                    StaffWorkRole.is_deleted.is_(False),
                    StaffWorkRole.work_id == work_id,
                    Staff.is_active.is_(True),
                    Staff.is_deleted.is_(False))
        return query.all()

    @classmethod
    def _find_start_at_value(cls, start_at: str, number_of_days: int) -> int:
        """Calculate the start at value"""
        # pylint: disable=eval-used
        start_at_value = (
            eval(start_at.replace("number_of_days", str(number_of_days)))
            if "number_of_days" in start_at
            else int(start_at)
        )
        return start_at_value + number_of_days

    @classmethod
    def _prepare_regular_event(  # pylint: disable=too-many-arguments
        cls,
        name: str,
        start_date: str,
        number_of_days: int,
        ev_config_id: int,
        source_e_id: int = None,
    ) -> dict:
        """Prepare the event object"""
        return {
            "name": name,
            "anticipated_date": f"{start_date}",
            "number_of_days": number_of_days,
            "event_configuration_id": ev_config_id,
            "source_event_id": source_e_id,
        }

    @classmethod
    def _prepare_configuration(cls, data) -> dict:
        """Prepare the configuration object"""
        return {
            "name": data["name"],
            "work_id": data["work_id"],
            "phase_id": data["phase_id"],
            "parent_id": data["parent_id"],
            "event_type_id": data["event_type_id"],
            "event_category_id": data["event_category_id"],
            "start_at": data["start_at"],
            "number_of_days": data["number_of_days"],
            "mandatory": data["mandatory"],
            "sort_order": data["sort_order"],
        }

    @classmethod
    def find_by_id(cls, work_id):
        """Find work by id."""
        work = Work.find_by_id(work_id)
        if not work:
            raise ResourceNotFoundError(f"Work with id '{work_id}' not found")
        return work

    @classmethod
    def update_work(cls, work_id: int, payload: dict):
        """Update existing work."""
        exists = cls.check_existence(payload["title"], work_id)
        if exists:
            raise ResourceExistsError("Work with same title already exists")
        work = Work.find_by_id(work_id)
        if not work:
            raise ResourceNotFoundError(f"Work with id '{work_id}' not found")
        work = work.update(payload)
        return work

    @classmethod
    def delete_work(cls, work_id: int):
        """Delete work by id."""
        work = Work.find_by_id(work_id)
        work.is_deleted = True
        Work.commit()
        return True

    @classmethod
    def generate_workplan(
        cls, work_id: int, phase_id: int
    ):  # pylint: disable=unsupported-assignment-operation,unsubscriptable-object
        """Generate the workplan excel file for given work and phase"""
        milestone_events = EventService.find_milestone_events_by_work_phase(
            work_id, phase_id
        )
        task_events = TaskService.find_task_events(work_id, phase_id)

        work_plan_schema = WorkPlanSchema(many=True)
        work_plan_schema.context["type"] = "Milestone"
        milestones_json = work_plan_schema.dump(milestone_events)
        work_plan_schema.context["type"] = "Task"
        tasks_json = work_plan_schema.dump(task_events)

        data = pd.DataFrame(milestones_json + tasks_json)
        data["start_date"] = pd.to_datetime(data["start_date"])
        data = data.sort_values(by="start_date")

        data["start_date"] = data["start_date"].dt.strftime("%b. %d %Y")  # pylint: disable=unsubscriptable-object,
        # unsupported-assignment-operation
        data["end_date"] = data["end_date"].dt.strftime("%b. %d %Y")  # pylint: disable=unsubscriptable-object,
        # unsupported-assignment-operation

        file_buffer = BytesIO()
        columns = [
            "name",
            "type",
            "start_date",
            "end_date",
            "days",
            "assigned",
            "responsibility",
            "notes",
            "progress",
        ]
        headers = [
            "Name",
            "Type",
            "Start Date",
            "End Date",
            "Days",
            "Assigned",
            "Responsibility",
            "Notes",
            "Progress",
        ]
        data.to_excel(file_buffer, index=False, columns=columns, header=headers)
        file_buffer.seek(0, 0)
        return file_buffer.getvalue()
