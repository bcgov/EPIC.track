# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Test Utils.

Test Utility for creating model factory.
"""
from datetime import datetime

from psycopg2.extras import DateTimeTZRange

from api.config import get_named_config
from api.models import Staff
from api.models import Work as WorkModel
from api.models import WorkIssues, WorkIssueUpdates, WorkStatus
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.pip_org_type import PIPOrgType
from api.models.project import Project as ProjectModel
from api.models.project import ProjectStateEnum
from api.models.proponent import Proponent
from api.models.special_field import SpecialField
from api.models.staff_work_role import StaffWorkRole
from api.models.task_event import TaskEvent
from api.models.task_template import TaskTemplate
from api.models.work_phase import WorkPhase
from tests.utilities.factory_scenarios import (
    TestFirstNation, TestPipOrgType, TestProjectInfo, TestProponent, TestRoleEnum, TestSpecialField, TestStaffInfo,
    TestStatus, TestTaskEnum, TestTaskTemplateEnum, TestWorkFirstNationEnum, TestWorkInfo, TestWorkIssuesInfo,
    TestWorkIssueUpdatesInfo, WorkPhaseEnum)


CONFIG = get_named_config("testing")

JWT_HEADER = {"typ": "JWT", "kid": "epictrack"}


def factory_project_model(project_data: dict = TestProjectInfo.project1.value):
    """Produce a participant model."""
    project_result = ProjectModel.find_by_params({"name": project_data["name"]})
    project = project_result[0] if project_result else None
    if not project:
        project = ProjectModel(
            name=project_data["name"],
            description=project_data["description"],
            address=project_data["address"],
            type_id=project_data["type_id"],
            sub_type_id=project_data["sub_type_id"],
            proponent_id=project_data["proponent_id"],
            region_id_env=project_data["region_id_env"],
            region_id_flnro=project_data["region_id_flnro"],
            latitude=project_data["latitude"],
            longitude=project_data["longitude"],
            abbreviation=project_data["abbreviation"],
            project_state_id=ProjectStateEnum.PRE_WORK.value,
        )
        project.save()
    return project


def factory_work_status_model(work_id, status_data: dict = TestStatus.status1.value):
    """Create and return a WorkStatus model instance."""
    status = WorkStatus(
        description=status_data["description"],
        posted_date=status_data["posted_date"],
        work_id=work_id,
        is_approved=status_data["is_approved"],
        approved_by=status_data["approved_by"],
        approved_date=(
            datetime.fromisoformat(status_data["approved_date"])
            if status_data["approved_date"]
            else None
        ),
    )
    status.save()
    return status


def factory_work_model(work_data: dict = TestWorkInfo.work1.value):
    """Produce a work model."""
    project = factory_project_model()
    epd = factory_staff_model()
    work_lead = factory_staff_model()
    decision_maker = factory_staff_model()
    work = WorkModel(
        report_description=work_data["report_description"],
        epic_description=work_data["epic_description"],
        is_active=work_data["is_active"],
        start_date=work_data["start_date"],
        project_id=project.id,
        ministry_id=work_data["ministry_id"],
        ea_act_id=work_data["ea_act_id"],
        eao_team_id=work_data["eao_team_id"],
        federal_involvement_id=work_data["federal_involvement_id"],
        responsible_epd_id=epd.id,
        work_lead_id=work_lead.id,
        work_type_id=work_data["work_type_id"],
        substitution_act_id=work_data["substitution_act_id"],
        decision_by_id=decision_maker.id,
    )
    work.save()
    return work


def factory_staff_model(staff_data: dict = TestStaffInfo.staff1.value):
    """Produce a staff model."""
    staff = Staff(
        first_name=staff_data["first_name"],
        last_name=staff_data["last_name"],
        phone=staff_data["phone"],
        email=staff_data["email"],
        is_active=staff_data["is_active"],
        position_id=1,
    )
    staff.save()
    return staff


def factory_work_issues_model(work_id, issue_data=None):
    """Produce a WorkIssues model."""
    if issue_data is None:
        issue_data = TestWorkIssuesInfo.issue1.value

    work_issue = WorkIssues(
        title=issue_data["title"],
        is_active=issue_data["is_active"],
        is_high_priority=issue_data["is_high_priority"],
        start_date=issue_data["start_date"],
        expected_resolution_date=issue_data["expected_resolution_date"],
        work_id=work_id,
    )
    work_issue.save()
    return work_issue


def factory_work_issue_updates_model(work_issue_id, update_data=None):
    """Produce a WorkIssueUpdates model."""
    if update_data is None:
        update_data = TestWorkIssueUpdatesInfo.update1.value

    work_issue_update = WorkIssueUpdates(
        description=update_data["description"],
        posted_date=update_data["posted_date"],
        is_approved=update_data["is_approved"],
        approved_by=update_data["approved_by"],
        work_issue_id=work_issue_id,
    )
    work_issue_update.save()
    return work_issue_update


def factory_auth_header(jwt, claims):
    """Produce JWT tokens for use in tests."""
    return {
        "Authorization": "Bearer " + jwt.create_jwt(claims=claims, header=JWT_HEADER)
    }


def factory_proponent_model(proponent_data=TestProponent.proponent1.value):
    """Produce a Proponent model."""
    relationship_holder = factory_staff_model()
    proponent = Proponent(
        name=proponent_data["name"],
        relationship_holder_id=relationship_holder.id,
    )
    proponent.save()
    return proponent


def factory_pip_org_type_model(org_type_data=TestPipOrgType.pip_org_type1.value):
    """Produce a PIP OrgType model."""
    pip_org_type = PIPOrgType(name=org_type_data["name"])
    pip_org_type.save()
    return pip_org_type


def factory_first_nation_model(first_nation_data=TestFirstNation.first_nation1.value):
    """Produce a First nation model."""
    pip_org_type = factory_pip_org_type_model()
    relationship_holder = factory_staff_model()
    first_nation = IndigenousNation(
        name=first_nation_data["name"],
        notes=first_nation_data["notes"],
        pip_link=first_nation_data["pip_link"],
        pip_org_type_id=pip_org_type.id,
        relationship_holder_id=relationship_holder.id,
        is_active=first_nation_data["is_active"],
    )
    first_nation.save()
    return first_nation


def factory_special_field_model(
    special_field_data=TestSpecialField.proponent_entity.value,
):
    """Produce a special field model."""
    time_range = DateTimeTZRange(
        special_field_data.get("active_from"), None, bounds="[)"
    )
    special_field = SpecialField(
        entity=special_field_data["entity"],
        field_name=special_field_data["field_name"],
        field_value=special_field_data["field_value"],
        entity_id=special_field_data.get("entity_id") if special_field_data.get("entity_id") else 1,
        time_range=time_range,
    )
    special_field.save()
    return special_field


def factory_staff_work_role_model(
    work_id=None, role_id=TestRoleEnum.OFFICER_ANALYST.value
):
    """Produce a Staff work role model"""
    if work_id is None:
        work_id = factory_work_model().id
    staff_work_role = StaffWorkRole(
        staff_id=factory_staff_model().id, work_id=work_id, role_id=role_id
    )
    staff_work_role.save()
    return staff_work_role


def factory_work_first_nation_model(
    work_id=None,
    work_first_nation_data=TestWorkFirstNationEnum.work_first_nation1.value,
):
    """Produce a work first nation model"""
    if work_id is None:
        work_id = factory_work_model().id
    work_first_nation = IndigenousWork(
        work_id=work_id,
        indigenous_nation_id=factory_first_nation_model(
            TestFirstNation.first_nation2.value
        ).id,
        indigenous_category_id=work_first_nation_data["indigenous_category_id"],
        indigenous_consultation_level_id=work_first_nation_data[
            "indigenous_consultation_level_id"
        ],
        is_active=work_first_nation_data["is_active"],
    )
    work_first_nation.save()
    return work_first_nation


def factory_task_template_model(data=TestTaskTemplateEnum.task_template1.value):
    """Produce a task template model"""
    task_template = TaskTemplate(
        name=data["name"],
        ea_act_id=data["ea_act_id"],
        work_type_id=data["work_type_id"],
        phase_id=data["phase_id"],
    )
    task_template.save()
    return task_template


def factory_work_phase_model(data=WorkPhaseEnum.work_phase1.value, work_id=None):
    """Produce a work phase model"""
    if work_id is None:
        work = factory_work_model()
        work_id = work.id
    work_phase = WorkPhase(
        work_id=work_id,
        phase_id=data["phase_id"],
        start_date=data["start_date"],
        end_date=data["end_date"],
        sort_order=data["sort_order"]
    )
    work_phase.save()
    return work_phase


def factory_task_model(data=TestTaskEnum.task1.value, work_id: int = None):
    """Produce a task model"""
    work_phase = factory_work_phase_model(work_id=work_id)
    data["work_phase_id"] = work_phase.id
    task_event = TaskEvent(
        work_phase_id=data["work_phase_id"],
        start_date=data["start_date"],
        status=data["status"],
        name=data["name"]
    )
    task_event.save()
    return task_event
