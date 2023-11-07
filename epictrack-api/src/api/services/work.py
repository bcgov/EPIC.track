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
from datetime import datetime, timedelta
from io import BytesIO
from itertools import product

import pandas as pd
from flask import current_app
from sqlalchemy import exc, tuple_
from sqlalchemy.orm import aliased

from api.exceptions import ResourceExistsError, ResourceNotFoundError, UnprocessableEntityError
from api.models import (
    ActionConfiguration, ActionTemplate, CalendarEvent, EAOTeam, Event, EventConfiguration, OutcomeConfiguration,
    Project, Role, Staff, StaffWorkRole, Work, WorkCalendarEvent, WorkPhase, WorkStateEnum, db)
from api.models.event_category import EventCategoryEnum
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.schemas.request import ActionConfigurationBodyParameterSchema, OutcomeConfigurationBodyParameterSchema
from api.schemas.response import (
    ActionTemplateResponseSchema, EventTemplateResponseSchema, OutcomeTemplateResponseSchema)
from api.schemas.work_first_nation import WorkFirstNationSchema
from api.schemas.work_plan import WorkPlanSchema
from api.services.event import EventService
from api.services.event_template import EventTemplateService
from api.services.outcome_template import OutcomeTemplateService
from api.services.phaseservice import PhaseService
from api.utils.datetime_helper import get_start_of_day


class WorkService:  # pylint: disable=too-many-public-methods
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
            Work.query.filter(Work.is_deleted.is_(False))
            .join(Project)
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
            payload["start_date"] = get_start_of_day(payload["start_date"])
            if cls.check_existence(payload["title"]):
                raise ResourceExistsError("Work with same title already exists")
            work = Work(**payload)
            work.work_state = WorkStateEnum.IN_PROGRESS
            phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(
                work.ea_act_id, work.work_type_id
            )
            if not phases:
                raise UnprocessableEntityError("No configuration found")
            phase_ids = list(map(lambda x: x.id, phases))
            event_templates = EventTemplateService.find_by_phase_ids(phase_ids)
            event_template_json = EventTemplateResponseSchema(many=True).dump(
                event_templates
            )
            work.current_phase_id = phases[0].id
            work = work.flush()
            phase_start_date = work.start_date
            for phase in phases:
                end_date = phase_start_date + timedelta(days=phase.number_of_days)
                work_phase = {
                    "work_id": work.id,
                    "phase_id": phase.id,
                    "name": phase.name,
                    "start_date": f"{phase_start_date}",
                    "end_date": f"{end_date}",
                    "legislated": phase.legislated,
                    "number_of_days": phase.number_of_days,
                }
                phase_event_templates = list(
                    filter(
                        lambda x, _phase_id=phase.id: x["phase_id"] == _phase_id,
                        event_template_json,
                    )
                )
                cls.handle_phase(
                    work_phase, phase_event_templates
                )
                phase_start_date = end_date + timedelta(days=1)
            db.session.commit()
        except exc.IntegrityError as exception:
            db.session.rollback()
            raise exception
        return work

    @classmethod
    def find_staff(cls, work_id: int, is_active) -> [Staff]:
        """Active staff assigned on a work"""
        query = (
            db.session.query(StaffWorkRole)
            .join(Staff, StaffWorkRole.staff_id == Staff.id)
            .join(Role, StaffWorkRole.role_id == Role.id)
            .filter(
                StaffWorkRole.is_deleted.is_(False),
                StaffWorkRole.work_id == work_id,
                Staff.is_active.is_(True),
                Staff.is_deleted.is_(False),
            )
        )
        if is_active is not None:
            query = query.filter(StaffWorkRole.is_active.is_(is_active))
        return query.all()

    @classmethod
    def find_work_staff(cls, work_staff_id: int) -> StaffWorkRole:
        """Get the staff Work"""
        work_staff = (
            db.session.query(StaffWorkRole)
            .filter(StaffWorkRole.id == work_staff_id)
            .scalar()
        )
        if not work_staff:
            raise ResourceExistsError("No work staff association found")
        return work_staff

    @classmethod
    def check_work_staff_existence(
        cls, work_id: int, staff_id: int, role_id: int, work_staff_id: int = None
    ) -> bool:
        """Check the existence of staff in work"""
        query = db.session.query(StaffWorkRole).filter(
            StaffWorkRole.work_id == work_id,
            StaffWorkRole.staff_id == staff_id,
            StaffWorkRole.is_deleted.is_(False),
            StaffWorkRole.role_id == role_id,
        )
        if work_staff_id:
            query = query.filter(StaffWorkRole.id != work_staff_id)
        if query.count() > 0:
            return True
        return False

    @classmethod
    def create_work_staff(
        cls, work_id: int, data: dict, commit: bool = True
    ) -> StaffWorkRole:
        """Create Staff Work"""
        if cls.check_work_staff_existence(
            work_id, data.get("staff_id"), data.get("role_id")
        ):
            raise ResourceExistsError("Staff Work association already exists")
        work_staff = StaffWorkRole(
            **{
                "work_id": work_id,
                "staff_id": data.get("staff_id"),
                "role_id": data.get("role_id"),
                "is_active": data.get("is_active"),
            }
        )
        work_staff.flush()
        if commit:
            db.session.commit()
        return work_staff

    @classmethod
    def update_work_staff(cls, work_staff_id: int, data: dict) -> StaffWorkRole:
        """Update work staff"""
        work_staff = (
            db.session.query(StaffWorkRole)
            .filter(StaffWorkRole.id == work_staff_id)
            .scalar()
        )
        if not work_staff:
            raise ResourceNotFoundError("No staff work association found")
        if cls.check_work_staff_existence(
            work_staff.work_id, data.get("staff_id"), data.get("role_id"), work_staff_id
        ):
            raise ResourceExistsError("Staff Work association already exists")
        work_staff.is_active = data.get("is_active")
        work_staff.role_id = data.get("role_id")
        work_staff.flush()
        db.session.commit()
        return work_staff

    @classmethod
    def copy_outcome_and_actions(
        cls, template: dict, config: EventConfiguration
    ) -> None:
        """Copy the outcome and actions"""
        outcome_params = {"event_template_id": template.get("id")}
        outcomes = OutcomeTemplateService.find_all_outcomes(outcome_params)
        outcome_ids = list(map(lambda x: x.id, outcomes))
        actions = ActionTemplate.find_by_outcome_ids(outcome_ids)
        for outcome in outcomes:
            outcome_json = OutcomeTemplateResponseSchema().dump(outcome)
            outcome_json["event_configuration_id"] = config.id
            outcome_result = OutcomeConfiguration(
                **OutcomeConfigurationBodyParameterSchema().load(outcome_json)
            ).flush()
            outcome_actions = list(
                filter(
                    lambda x, _outcome_id=outcome.id: x.outcome_id == _outcome_id,
                    actions,
                )
            )
            for outcome_action in outcome_actions:
                action_json = ActionTemplateResponseSchema().dump(outcome_action)
                action_json["outcome_configuration_id"] = outcome_result.id
                ActionConfiguration(
                    **ActionConfigurationBodyParameterSchema().load(action_json)
                ).flush()

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
        work_id: int,
        source_e_id: int = None,
    ) -> dict:
        """Prepare the event object"""
        return {
            "name": name,
            "anticipated_date": f"{start_date}",
            "number_of_days": number_of_days,
            "event_configuration_id": ev_config_id,
            "source_event_id": source_e_id,
            "work_id": work_id,
        }

    @classmethod
    def _prepare_configuration(cls, data) -> dict:
        """Prepare the configuration object"""
        return {
            "name": data["name"],
            "parent_id": data["parent_id"],
            "event_type_id": data["event_type_id"],
            "event_category_id": data["event_category_id"],
            "start_at": data["start_at"],
            "number_of_days": data["number_of_days"],
            "mandatory": data["mandatory"],
            "event_position": data["event_position"],
            "multiple_days": data["multiple_days"],
            "sort_order": data["sort_order"],
            "template_id": data["id"],
            "work_phase_id": data["work_phase_id"],
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
        cls, work_phase_id: int
    ):  # pylint: disable=unsupported-assignment-operation,unsubscriptable-object
        """Generate the workplan excel file for given work and phase"""
        milestone_events = EventService.find_milestone_events_by_work_phase(
            work_phase_id
        )
        task_events = []  # TaskService.find_task_events(work_id, phase_id)

        work_plan_schema = WorkPlanSchema(many=True)
        work_plan_schema.context["type"] = "Milestone"
        milestones_json = work_plan_schema.dump(milestone_events)
        work_plan_schema.context["type"] = "Task"
        tasks_json = work_plan_schema.dump(task_events)

        data = pd.DataFrame(milestones_json + tasks_json)
        data["start_date"] = pd.to_datetime(data["start_date"])
        data = data.sort_values(by="start_date")

        data["start_date"] = data["start_date"].dt.strftime(
            "%b. %d %Y"
        )  # pylint: disable=unsubscriptable-object,
        # unsupported-assignment-operation
        data["end_date"] = data["end_date"].dt.strftime(
            "%b. %d %Y"
        )  # pylint: disable=unsubscriptable-object,
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

    @classmethod
    def find_first_nations(cls, work_id: int, is_active) -> [IndigenousNation]:
        """Active first nations assigned on a work"""
        query = (
            db.session.query(IndigenousWork)
            .join(
                IndigenousNation,
                IndigenousWork.indigenous_nation_id == IndigenousNation.id,
            )
            .filter(
                IndigenousWork.is_deleted.is_(False),
                IndigenousWork.work_id == work_id,
                IndigenousNation.is_active.is_(True),
                IndigenousNation.is_deleted.is_(False),
            )
            .order_by(IndigenousNation.name)
        )
        if is_active is not None:
            query = query.filter(IndigenousWork.is_active.is_(is_active))
        return query.all()

    @classmethod
    def save_first_nation_notes(cls, work_id: int, notes: str) -> Work:
        """Save first nation note to given work"""
        work = cls.find_by_id(work_id)
        work.first_nation_notes = notes
        work.save()
        return work

    @classmethod
    def find_work_first_nation(cls, work_nation_id: int) -> IndigenousWork:
        """Find work indigenous nation by id"""
        work_indigenous_nation = (
            db.session.query(IndigenousWork)
            .filter(IndigenousWork.id == work_nation_id)
            .scalar()
        )
        if not work_indigenous_nation:
            raise ResourceExistsError("No work first nation association found")
        return work_indigenous_nation

    @classmethod
    def create_work_indigenous_nation(
        cls, work_id: int, data: dict, commit: bool = True
    ) -> IndigenousWork:
        """Create Indigenous Work"""
        if cls.check_work_nation_existence(work_id, data.get("indigenous_nation_id")):
            raise ResourceExistsError("First nation Work association already exists")
        indigenous_work = IndigenousWork(
            **{
                "work_id": work_id,
                "indigenous_nation_id": data.get("indigenous_nation_id"),
                "indigenous_category_id": data.get("indigenous_category_id", None),
                "pin": data.get("pin", None),
                "is_active": data.get("is_active"),
            }
        )
        indigenous_work.flush()
        if commit:
            db.session.commit()
        return indigenous_work

    @classmethod
    def update_work_indigenous_nation(
        cls, work_indigenous_nation_id: int, data: dict
    ) -> IndigenousWork:
        """Update work indigenous nation"""
        work_indigenous_nation = (
            db.session.query(IndigenousWork)
            .filter(IndigenousWork.id == work_indigenous_nation_id)
            .scalar()
        )
        if not work_indigenous_nation:
            raise ResourceNotFoundError("No first nation work association found")
        if cls.check_work_nation_existence(
            work_indigenous_nation.work_id,
            data.get("indigenous_nation_id"),
            work_indigenous_nation_id,
        ):
            raise ResourceExistsError("First nation Work association already exists")
        work_indigenous_nation.is_active = data.get("is_active")
        work_indigenous_nation.indigenous_category_id = data.get(
            "indigenous_category_id"
        )
        work_indigenous_nation.pin = data.get("pin")
        work_indigenous_nation.flush()
        db.session.commit()
        return work_indigenous_nation

    @classmethod
    def generate_first_nations_excel(
        cls, work_id: int
    ):  # pylint: disable=unsupported-assignment-operation,unsubscriptable-object
        """Generate the workplan excel file for given work and phase"""
        first_nations = cls.find_first_nations(work_id, None)

        schema = WorkFirstNationSchema(many=True)
        data = schema.dump(first_nations)

        data = pd.DataFrame(data)

        file_buffer = BytesIO()
        columns = [
            "nation",
            "pin",
            "relationship_holder",
            "pip_link",
            "active",
        ]
        headers = [
            "Nation",
            "PIN",
            "Relationship Holder",
            "PIP Link",
            "Active",
        ]
        data.to_excel(file_buffer, index=False, columns=columns, header=headers)
        file_buffer.seek(0, 0)
        return file_buffer.getvalue()

    @classmethod
    def import_first_nations(cls, work_id: int, indigenous_nation_ids: [int]):
        """Create associations for given work and first nations"""
        existing_first_nations_qry = db.session.query(IndigenousWork).filter(
            IndigenousWork.work_id == work_id,
            IndigenousWork.is_deleted.is_(False),
        )

        existing_first_nations = list(
            map(
                lambda x: {
                    "work_id": x.work_id,
                    "indigenous_nation_id": x.indigenous_nation_id,
                },
                existing_first_nations_qry.filter(
                    IndigenousWork.indigenous_nation_id.in_(indigenous_nation_ids),
                ).all(),
            )
        )

        # Mark removed entries as inactive
        disabled_count = existing_first_nations_qry.filter(
            IndigenousWork.is_active.is_(True),
            IndigenousWork.indigenous_nation_id.notin_(indigenous_nation_ids),
        ).update({"is_active": False})
        current_app.logger.info(f"Disabled {disabled_count} IndigenousWork")

        # Update existing entries to be active
        enabled_count = existing_first_nations_qry.filter(
            tuple_(IndigenousWork.work_id, IndigenousWork.indigenous_nation_id).in_(
                [
                    (x["work_id"], x["indigenous_nation_id"])
                    for x in existing_first_nations
                    if x["indigenous_nation_id"] in indigenous_nation_ids
                ]
            )
        ).update({"is_active": True})
        current_app.logger.info(f"Enabled {enabled_count} IndigenousWorks")

        keys = ("work_id", "indigenous_nation_id")
        indigenous_works = [
            task_assignee
            for i, j in product([work_id], indigenous_nation_ids)
            if (task_assignee := dict(zip(keys, (i, j)))) not in existing_first_nations
        ]
        db.session.bulk_insert_mappings(IndigenousWork, mappings=indigenous_works)
        db.session.commit()
        return "Imported successfully"

    @classmethod
    def check_work_nation_existence(
        cls, work_id: int, nation_id: int, work_nation_id: int = None
    ) -> bool:
        """Check the existence of first nation in work"""
        query = db.session.query(IndigenousWork).filter(
            IndigenousWork.work_id == work_id,
            IndigenousWork.indigenous_nation_id == nation_id,
            IndigenousWork.is_deleted.is_(False),
        )
        if work_nation_id:
            query = query.filter(IndigenousWork.id != work_nation_id)
        if query.count() > 0:
            return True
        return False

    @classmethod
    def handle_phase(cls, work_phase, phase_event_templates):  # pylint: disable=too-many-locals
        """Create a new work phase and related events and event configuration entries"""
        work_phase = WorkPhase.flush(WorkPhase(**work_phase))
        event_configurations = []
        for parent_config in list(
            filter(lambda x: not x["parent_id"], phase_event_templates)
        ):
            parent_config["work_phase_id"] = work_phase.id
            p_result = EventConfiguration(**cls._prepare_configuration(parent_config))
            p_result.flush()
            event_configurations.append(p_result)
            cls.copy_outcome_and_actions(parent_config, p_result)
            for child in list(
                filter(
                    lambda x, _parent_config_id=parent_config["id"]: x["parent_id"] == _parent_config_id,
                    phase_event_templates,
                )
            ):
                child["parent_id"] = p_result.id
                child["work_phase_id"] = work_phase.id
                c_result = EventConfiguration.flush(
                    EventConfiguration(**cls._prepare_configuration(child))
                )
                event_configurations.append(c_result)
                cls.copy_outcome_and_actions(child, c_result)
        parent_event_configs = list(
            filter(
                lambda x, _work_phase_id=work_phase.id: not x.parent_id and
                x.mandatory and x.work_phase_id == _work_phase_id,
                event_configurations,
            )
        )
        for p_event_conf in parent_event_configs:
            days = cls._find_start_at_value(p_event_conf.start_at, 0)
            p_event_start_date = datetime.fromisoformat(work_phase.start_date) + timedelta(
                days=days
            )
            p_event = Event.flush(
                Event(
                    **cls._prepare_regular_event(
                        p_event_conf.name,
                        str(p_event_start_date),
                        p_event_conf.number_of_days,
                        p_event_conf.id,
                        p_event_conf.work_phase.work.id,
                    )
                )
            )
            c_events = list(
                filter(
                    lambda x, _parent_id=p_event_conf.id, _work_phase_id=work_phase.id: x.parent_id == _parent_id and
                    x.mandatory and x.work_phase_id == _work_phase_id,  # noqa: W503
                    event_configurations,
                )
            )
            for c_event_conf in c_events:
                c_event_start_date = p_event_start_date + timedelta(
                    days=cls._find_start_at_value(c_event_conf.start_at, 0)
                )
                if c_event_conf.event_category_id == EventCategoryEnum.CALENDAR.value:
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
                                c_event_conf.work_phase.work.id,
                                p_event.id,
                            )
                        )
                    )
