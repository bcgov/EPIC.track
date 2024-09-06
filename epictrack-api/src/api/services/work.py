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
from collections import defaultdict
from datetime import datetime, timedelta
from io import BytesIO
from typing import Dict, List, Optional

import pandas as pd
from flask import current_app
from sqlalchemy import and_
from sqlalchemy import tuple_
from sqlalchemy.orm import aliased

from api.exceptions import (
    ResourceExistsError,
    ResourceNotFoundError,
    UnprocessableEntityError,
)
from api.models import (
    ActionConfiguration,
    ActionTemplate,
    CalendarEvent,
    EAOTeam,
    Event,
    EventConfiguration,
    OutcomeConfiguration,
    Project,
    Role,
    Staff,
    StaffWorkRole,
    Work,
    WorkCalendarEvent,
    WorkPhase,
    WorkStateEnum,
    db,
)
from api.models.dashboard_seach_options import WorkplanDashboardSearchOptions
from api.models.event_category import EventCategoryEnum
from api.models.event_template import EventTemplateVisibilityEnum
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.indigenous_work_queries import find_all_by_project_id
from api.models.pagination_options import PaginationOptions
from api.models.phase_code import PhaseVisibilityEnum
from api.models.special_field import EntityEnum
from api.models.work_status import WorkStatus
from api.models.work_type import WorkType
from api.schemas.request import (
    ActionConfigurationBodyParameterSchema,
    OutcomeConfigurationBodyParameterSchema,
)
from api.schemas.response import (
    ActionTemplateResponseSchema,
    EventTemplateResponseSchema,
    OutcomeTemplateResponseSchema,
    StaffWorkRoleResponseSchema,
    WorkPhaseAdditionalInfoResponseSchema,
    WorkResponseSchema,
    WorkStatusResponseSchema,)
from api.schemas.work_first_nation import WorkFirstNationSchema
from api.schemas.work_plan import WorkPlanSchema
from api.schemas.work_type import WorkTypeSchema
from api.services import authorisation
from api.services.event import EventService
from api.services.event_template import EventTemplateService
from api.services.outcome_configuration import OutcomeConfigurationService
from api.services.outcome_template import OutcomeTemplateService
from api.services.phaseservice import PhaseService
from api.services.task import TaskService
from api.services.work_phase import WorkPhaseService
from api.utils import util
from api.utils.roles import Membership
from api.utils.roles import Role as KeycloakRole


# pylint:disable=not-callable, too-many-lines
class WorkService:  # pylint: disable=too-many-public-methods
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, title, work_id=None):
        """Checks if a work exists for a given title"""
        return Work.check_existence(title=title, work_id=work_id)

    @classmethod
    def find_all_works(cls, is_active=False):
        """Find all non-deleted works"""
        works = Work.find_all(is_active)
        return works

    @classmethod
    def fetch_all_work_plans(
        cls,
        pagination_options: PaginationOptions,
        search_options: WorkplanDashboardSearchOptions,
    ):
        """Fetch all workplans"""
        works, total = Work.fetch_all_works(pagination_options, search_options)
        work_ids = [work.id for work in works]

        serialized_works = []
        work_staffs = WorkService.find_staff_for_works(work_ids, is_active=True)
        works_statuses = WorkStatus.list_latest_approved_statuses_for_work_ids(work_ids)
        work_id_phase_id_dict = {work.id: work.current_work_phase_id for work in works}
        work_phases = WorkPhaseService.find_multiple_works_phases_status(
            work_id_phase_id_dict
        )
        work: Work
        for work in works:
            serialized_work = WorkService._serialize_work(
                work, work_staffs, works_statuses, work_phases.get(work.id)
            )
            serialized_works.append(serialized_work)

        return {"items": serialized_works, "total": total}

    @staticmethod
    def _serialize_work(work, work_staffs, works_statuses, work_phase):
        """Serialize a single work"""
        staff_info = work_staffs.get(work.id, [])
        works_status = works_statuses.get(work.id, None)
        serialized_work = WorkResponseSchema(
            only=(
                "id",
                "work_state",
                "work_type",
                "current_work_phase_id",
                "federal_involvement",
                "eao_team",
                "title",
                "simple_title",
                "is_active",
                "project.name",
            )
        ).dump(work)
        if work_phase and len(work_phase) > 0:
            serialised_phase = WorkPhaseAdditionalInfoResponseSchema(
                only=(
                    "work_phase.name",
                    "total_number_of_days",
                    "current_milestone",
                    "next_milestone",
                    "next_milestone_date",
                    "decision_milestone",
                    "decision",
                    "decision_milestone_date",
                    "milestone_progress",
                    "days_left",
                    "work_phase.id",
                    "work_phase.phase.color",
                    "work_phase.start_date",
                    "work_phase.end_date",
                    "work_phase.is_completed",
                ),
                many=True,
            ).dump(work_phase)

            serialized_work["phase_info"] = serialised_phase
        serialized_work["status_info"] = WorkStatusResponseSchema(many=False).dump(
            works_status
        )
        serialized_work["staff_info"] = StaffWorkRoleResponseSchema(many=True).dump(
            staff_info
        )

        return serialized_work

    @classmethod
    def find_allocated_resources(cls, is_active=None):
        """Find all allocated resources"""
        lead = aliased(Staff)
        epd = aliased(Staff)
        if is_active is None:
            query = (
                Work.query.filter(Work.is_deleted.is_(False))
                .join(Project)
                .filter(Project.is_deleted.is_(False), Project.is_project_closed.is_(False))
                .outerjoin(EAOTeam, Work.eao_team_id == EAOTeam.id)
                .outerjoin(lead, lead.id == Work.work_lead_id)
                .outerjoin(epd, epd.id == Work.responsible_epd_id)
            )
        else:
            query = Work.query.join(
                StaffWorkRole,
                and_(
                    StaffWorkRole.work_id == Work.id,
                    StaffWorkRole.staff_id == Work.work_lead_id,
                ),
            ).filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
                StaffWorkRole.is_active.is_(True),
            )
        work_result = query.all()
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
                StaffWorkRole.work_id.in_(work_ids),
                StaffWorkRole.is_deleted.is_(False),
                StaffWorkRole.is_active.is_(True)
            )
            .join(Role, Role.id == StaffWorkRole.role_id)
            .add_entity(Role)
            .add_columns(StaffWorkRole.work_id)
            .all()
        )
        for work in works:
            staffs = [staff for staff in staff_result if staff.work_id == work["id"]]
            work["staff"] = staffs
        return works

    @classmethod
    def create_work(cls, payload, commit: bool = True):
        # pylint: disable=too-many-locals
        """Create a new work"""
        cls._check_duplicate_title(payload)
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
        work = work.flush()
        cls.create_special_fields(work)
        phase_start_date = work.start_date
        sort_order = 1
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
                "sort_order": sort_order,
                "visibility": phase.visibility,
            }
            phase_event_templates = [
                template
                for template in event_template_json
                if template["phase_id"] == phase.id
            ]
            work_phase = cls.create_events_by_template(
                work_phase, phase_event_templates
            )
            if phase.visibility.value != PhaseVisibilityEnum.HIDDEN.value:
                phase_start_date = end_date + timedelta(days=1)
            if sort_order == 1:
                work.current_work_phase_id = work_phase.id
            sort_order = sort_order + 1
        # dev-note: find_code_values_by_type - we should use RoleService instead of the "code" way

        if commit:
            db.session.commit()
        return work

    @classmethod
    def _check_duplicate_title(cls, payload, work_id=None):
        """Check if the title exists."""
        project = Project.find_by_id(payload.get('project_id'))
        work_type: WorkType = WorkType.find_by_id(payload.get('work_type_id'))

        # Create the temporary title string for the work to check for duplicacy
        title_to_check = util.generate_title(project.name, work_type.name, payload.get('simple_title'))
        if cls.check_existence(title_to_check, work_id):
            raise ResourceExistsError("Work with same title already exists")

    @classmethod
    def create_special_fields(cls, work: Work):
        """Create work special fields"""
        # pylint: disable=import-outside-toplevel,cyclic-import
        from api.services.special_field import SpecialFieldService
        work_epd_special_field_data = {
            "entity": EntityEnum.WORK,
            "entity_id": work.id,
            "field_name": "responsible_epd_id",
            "field_value": work.responsible_epd_id,
            "active_from": work.start_date,
        }
        work_team_lead_special_field_data = {
            "entity": EntityEnum.WORK,
            "entity_id": work.id,
            "field_name": "work_lead_id",
            "field_value": work.work_lead_id,
            "active_from": work.start_date,
        }

        SpecialFieldService.create_special_field_entry(
            work_epd_special_field_data, commit=False
        )
        SpecialFieldService.create_special_field_entry(
            work_team_lead_special_field_data, commit=False
        )

    @classmethod
    def find_staff(cls, work_id: int, is_active) -> List[Staff]:
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
    def find_staff_for_works(
        cls, work_ids: List[int], is_active: Optional[bool] = None
    ) -> Dict[int, List[StaffWorkRole]]:
        """Active staff assigned on multiple works"""
        query = (
            db.session.query(StaffWorkRole, Work)
            .join(Staff, StaffWorkRole.staff_id == Staff.id)
            .join(Role, StaffWorkRole.role_id == Role.id)
            .join(Work, StaffWorkRole.work_id == Work.id)
            .filter(
                StaffWorkRole.is_deleted.is_(False),
                StaffWorkRole.is_active.is_(True),
                Staff.is_active.is_(True),
                Staff.is_deleted.is_(False),
                Work.id.in_(work_ids),
            )
        )
        if is_active is not None:
            query = query.filter(StaffWorkRole.is_active.is_(is_active))

        staff_for_works = defaultdict(list)
        for staff_work_role, work in query.all():
            staff_for_works[work.id].append(staff_work_role)

        return staff_for_works

    @classmethod
    def find_work_staff(cls, work_staff_id: int) -> StaffWorkRole:
        """Get the staff Work"""
        work_staff = (
            db.session.query(StaffWorkRole)
            .filter(StaffWorkRole.id == work_staff_id)
            .scalar()
        )
        if not work_staff:
            raise ResourceNotFoundError("No work staff association found")
        return work_staff

    @classmethod
    def check_work_staff_existence(
        cls, work_id: int, staff_id: int, role_id: int, work_staff_id: int = None
    ) -> bool:
        """Check the existence of staff in work"""
        staff_work_roles = StaffWorkRole.find_by_work_and_staff_and_role(
            work_id, staff_id, role_id, work_staff_id)
        if staff_work_roles:
            return True
        return False

    @classmethod
    def check_work_staff_existence_duplication(
        cls, work_id: int, staff_id: int, role_id: int, work_staff_id: int = None
    ):
        """Check the existence of staff in work"""
        exists = cls.check_work_staff_existence(
            work_id, staff_id, role_id, work_staff_id)
        if exists:
            raise ResourceExistsError("Staff Work association already exists")

    @classmethod
    def create_work_staff(
        cls, work_id: int, data: dict, commit: bool = True
    ) -> StaffWorkRole:
        """Create Staff Work"""
        cls.check_work_staff_existence_duplication(
            work_id, data.get("staff_id"), data.get("role_id")
        )

        cls._check_can_create_or_team_member_auth(work_id)

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
    def update_work_staff(
        cls, work_staff_id: int, data: dict, commit: bool = True
    ) -> StaffWorkRole:
        """Update work staff"""
        work_staff = (
            db.session.query(StaffWorkRole)
            .filter(StaffWorkRole.id == work_staff_id)
            .scalar()
        )
        if not work_staff:
            raise ResourceNotFoundError("No staff work association found")

        cls.check_work_staff_existence_duplication(
            work_staff.work_id, data.get("staff_id"), data.get("role_id"), work_staff_id
        )
        cls._check_can_edit_or_team_member_auth(work_staff.work_id)

        work_staff.is_active = data.get("is_active")
        work_staff.role_id = data.get("role_id")
        work_staff.flush()
        if commit:
            db.session.commit()
        return work_staff

    @classmethod
    def upsert_work_staff(cls, work_id: int, data: dict, commit: bool = True):
        """Upsert work staff"""
        work_staff = StaffWorkRole.find_one_by_work_and_staff_and_role(
            work_id, data.get("staff_id"), data.get("role_id"), work_staff_id=None)
        if work_staff:
            return cls.update_work_staff(work_staff.id, data, commit)
        return cls.create_work_staff(work_id, data, commit)

    @classmethod
    def replace_work_staff(cls, work_id: int, data: dict):
        """Replace work staff"""
        work_staff = StaffWorkRole.find_one_by_role_and_work(
            work_id, data.get("role_id")
        )
        if work_staff:
            update_data = {
                "role_id": work_staff.role_id,
                "staff_id": work_staff.staff_id,
                "is_active": False,
            }
            cls.update_work_staff(work_staff.id, update_data, commit=False)

        upserted_work_staff = cls.upsert_work_staff(work_id, data, commit=False)
        return upserted_work_staff

    @classmethod
    def copy_outcome_and_actions(
            cls, template: dict, config: EventConfiguration, from_template: bool = True
    ) -> None:
        """Copy the outcome and actions"""
        if from_template:
            outcome_params = {"event_template_id": template.get("id")}
            outcomes = OutcomeTemplateService.find_all_outcomes(outcome_params)
            outcome_ids = list(map(lambda x: x.id, outcomes))
            actions = ActionTemplate.find_by_outcome_ids(outcome_ids)
        else:
            outcome_params = {"event_configuration_id": template.get("id")}
            outcomes = OutcomeConfigurationService.find_all_outcomes(outcome_params)
            outcome_ids = list(map(lambda x: x.id, outcomes))
            actions = ActionConfiguration.find_by_outcome_ids(outcome_ids)
        for outcome in outcomes:
            outcome_json = OutcomeTemplateResponseSchema().dump(outcome)
            outcome_json["event_configuration_id"] = config.id
            outcome_json["outcome_template_id"] = (
                outcome.id if from_template else outcome.outcome_template_id
            )

            outcome_result = OutcomeConfiguration(
                **OutcomeConfigurationBodyParameterSchema().load(outcome_json)
            ).flush()
            outcome_actions = list(
                filter(
                    lambda x, _outcome_id=outcome.id: (
                        x.outcome_id == _outcome_id
                        if from_template
                        else x.outcome_configuration_id == _outcome_id
                    ),
                    actions,
                )
            )
            for outcome_action in outcome_actions:
                action_json = ActionTemplateResponseSchema().dump(outcome_action)
                action_json["outcome_configuration_id"] = outcome_result.id
                action_json["action_template_id"] = (
                    outcome_action.id
                    if from_template
                    else outcome_action.action_template_id
                )

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
    def _prepare_configuration(cls, data, from_template) -> dict:
        """Prepare the configuration object"""
        return {
            "name": data["name"],
            "parent_id": data["parent_id"],
            "event_type_id": data["event_type_id"],
            "event_category_id": data["event_category_id"],
            "start_at": data["start_at"],
            "number_of_days": data["number_of_days"],
            "event_position": data["event_position"],
            "multiple_days": data["multiple_days"],
            "sort_order": data["sort_order"],
            "template_id": data["id"] if from_template else data["template_id"],
            "work_phase_id": data["work_phase_id"],
            "visibility": data["visibility"],
            "repeat_count": 1,
        }

    @classmethod
    def find_by_id(cls, work_id, exclude_deleted=False):
        """Find work by id."""
        query = db.session.query(Work).filter(Work.id == work_id)
        if exclude_deleted:
            query = query.filter(Work.is_deleted.is_(False))
        work = query.one_or_none()
        if not work:
            raise ResourceNotFoundError(f"Work with id '{work_id}' not found")
        return work

    @classmethod
    def update_work(cls, work_id: int, payload: dict):
        """Update existing work."""
        cls._check_duplicate_title(payload, work_id)
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
            cls,
            work_phase_id: int,
    ):  # pylint: disable=unsupported-assignment-operation,unsubscriptable-object
        """Generate the workplan excel file for given work and phase"""
        milestone_events = EventService.find_milestone_events_by_work_phase(
            work_phase_id
        )
        task_events = TaskService.find_task_events(work_phase_id)

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
        columns = ["name", "type", "start_date", "end_date", "days", "assigned",
                   "responsibility", "notes", "progress"]
        headers = ["Name", "Type", "Start Date", "End Date", "Days", "Assigned",
                   "Responsibility", "Notes", "Progress"]
        data.to_excel(file_buffer, index=False, columns=columns, header=headers)
        file_buffer.seek(0, 0)
        return file_buffer.getvalue()

    @classmethod
    def find_first_nations(cls, work_id: int, is_active) -> List[IndigenousNation]:
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
    def save_notes(cls, work_id: int, notes_payload: dict) -> Work:
        """Save notes to the given column in the work."""
        # if column name cant map the type in the UI , add it here..
        note_type_mapping = {
            "first_nation": "first_nation_notes",
        }

        work = cls.find_by_id(work_id)
        notes = notes_payload.get("notes")
        note_type = notes_payload.get("note_type")

        if hasattr(work, note_type):
            setattr(work, note_type, notes)
        else:
            mapped_column = note_type_mapping.get(note_type)
            if mapped_column is None:
                raise ResourceExistsError(
                    f"No work note type {note_type} nation association found"
                )
            setattr(work, mapped_column, notes)

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

        cls._check_can_create_or_team_member_auth(work_id)

        indigenous_work = IndigenousWork(
            **{
                "work_id": work_id,
                "indigenous_nation_id": data.get("indigenous_nation_id"),
                "indigenous_category_id": data.get("indigenous_category_id", None),
                "indigenous_consultation_level_id": data.get(
                    "indigenous_consultation_level_id", None
                ),
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

        cls._check_can_edit_or_team_member_auth(work_indigenous_nation.work_id)

        work_indigenous_nation.is_active = data.get("is_active")
        work_indigenous_nation.indigenous_category_id = data.get(
            "indigenous_category_id"
        )
        work_indigenous_nation.indigenous_consultation_level_id = data.get(
            "indigenous_consultation_level_id"
        )
        work_indigenous_nation.flush()
        db.session.commit()
        return work_indigenous_nation

    @classmethod
    def generate_first_nations_excel(
            cls, work_id: int
    ):  # pylint: disable=unsupported-assignment-operation,unsubscriptable-object
        """Generate the workplan excel file for given work and phase"""
        cls._check_can_edit_or_team_member_auth(work_id)
        first_nations = cls.find_first_nations(work_id, None)
        schema = WorkFirstNationSchema(many=True)
        data = schema.dump(first_nations)

        data = pd.DataFrame(data)

        file_buffer = BytesIO()
        columns = [
            "nation",
            "consultation_level",
            "relationship_holder",
            "pip_link",
            "active",
        ]
        headers = [
            "Nation",
            "Consultation Level",
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
        cls._check_can_create_or_team_member_auth(work_id)
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
        existing_first_nations_ids = [nation["indigenous_nation_id"] for nation in existing_first_nations]

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

        work = Work.find_by_id(work_id)
        nations_in_same_project = find_all_by_project_id(work.project_id)

        new_nations_ids = [nation_id for nation_id in indigenous_nation_ids
                           if nation_id not in existing_first_nations_ids]
        selected_nations = [
            nation for nation in nations_in_same_project
            if nation.indigenous_nation_id in new_nations_ids
        ]
        nations_to_insert = [
            {
                'work_id': work.id,
                'indigenous_nation_id': nation.indigenous_nation_id,
                'indigenous_consultation_level_id': nation.indigenous_consultation_level_id,
            }
            for nation in selected_nations
        ]
        db.session.bulk_insert_mappings(IndigenousWork, mappings=nations_to_insert)
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
    def create_events_by_template(
            cls, work_phase: WorkPhase, phase_event_templates: List[dict]
    ) -> int:  # pylint: disable=too-many-locals
        """Create a new work phase and related events and event configuration entries"""
        work_phase = WorkPhase.flush(WorkPhase(**work_phase))
        event_configurations = cls.create_configurations(
            work_phase, phase_event_templates
        )
        cls.create_events_by_configuration(work_phase, event_configurations)
        return work_phase

    @classmethod
    def create_configurations(
        cls,
        work_phase: WorkPhase,
        event_configs: List[dict],
        from_template: bool = True,
    ) -> List[EventConfiguration]:
        """Create event configurations from existing configurations/templates"""
        event_configurations: List[EventConfiguration] = []
        for parent_config in list(filter(lambda x: not x["parent_id"], event_configs)):
            parent_config["work_phase_id"] = work_phase.id
            p_result = EventConfiguration(
                **cls._prepare_configuration(parent_config, from_template)
            )
            p_result.flush()
            event_configurations.append(p_result)
            cls.copy_outcome_and_actions(parent_config, p_result, from_template)
            child_configs = [
                child
                for child in event_configs
                if child["parent_id"] == parent_config["id"]
            ]
            for child in child_configs:
                child["parent_id"] = p_result.id
                child["work_phase_id"] = work_phase.id
                c_result = EventConfiguration.flush(
                    EventConfiguration(
                        **cls._prepare_configuration(child, from_template)
                    )
                )
                event_configurations.append(c_result)
                cls.copy_outcome_and_actions(child, c_result, from_template)
        return event_configurations

    @classmethod
    def create_events_by_configuration(
        cls, work_phase: WorkPhase, event_configurations: List[EventConfiguration]
    ) -> None:
        """Create events by given event configurations"""
        if work_phase.visibility.value == PhaseVisibilityEnum.REGULAR.value:
            parent_event_configs = [
                parent_config
                for parent_config in event_configurations
                if parent_config.visibility
                in [
                    EventTemplateVisibilityEnum.MANDATORY.value,
                    EventTemplateVisibilityEnum.SUGGESTED.value,
                ]
                and parent_config.work_phase_id == work_phase.id
                and parent_config.parent_id is None
            ]
            for p_event_conf in parent_event_configs:
                days = cls._find_start_at_value(p_event_conf.start_at, 0)
                p_event_start_date = datetime.fromisoformat(
                    work_phase.start_date
                ) + timedelta(days=days)
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
                c_events = [
                    c_event
                    for c_event in event_configurations
                    if c_event.visibility
                    in [
                        EventTemplateVisibilityEnum.MANDATORY.value,
                        EventTemplateVisibilityEnum.SUGGESTED.value,
                    ]
                    and c_event.work_phase_id == work_phase.id
                    and c_event.parent_id == p_event_conf.id
                ]
                for c_event_conf in c_events:
                    c_event_start_date = p_event_start_date + timedelta(
                        days=cls._find_start_at_value(c_event_conf.start_at, 0)
                    )
                    if (
                        c_event_conf.event_category_id
                        == EventCategoryEnum.CALENDAR.value
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
                                    c_event_conf.work_phase.work.id,
                                    p_event.id,
                                )
                            )
                        )

    @classmethod
    def find_all_work_types(cls):
        """Get all work types"""
        work_types = WorkType.find_all()
        return WorkTypeSchema(many=True).dump(work_types)

    @classmethod
    def _check_can_edit_or_team_member_auth(cls, work_id: int):
        """Check if user has edit role or is team member"""
        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

    @classmethod
    def _check_can_create_or_team_member_auth(cls, work_id: int):
        """Check if user has create role or is team member"""
        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)
