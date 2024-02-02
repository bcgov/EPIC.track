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

from api.config import get_named_config
from api.models import Staff
from api.models import Work as WorkModel
from api.models import WorkIssues, WorkIssueUpdates, WorkStatus
from api.models.project import Project as ProjectModel
from api.models.project import ProjectStateEnum
from api.models.proponent import Proponent
from tests.utilities.factory_scenarios import (
    TestProjectInfo, TestProponent, TestStaffInfo, TestStatus, TestWorkInfo, TestWorkIssuesInfo,
    TestWorkIssueUpdatesInfo)


CONFIG = get_named_config('testing')

JWT_HEADER = {
    'typ': 'JWT',
    'kid': 'epictrack'
}


def factory_project_model(project_data: dict = TestProjectInfo.project1.value):
    """Produce a participant model."""
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
        project_state=ProjectStateEnum.PRE_WORK.value
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
        approved_date=datetime.fromisoformat(status_data["approved_date"]) if status_data["approved_date"] else None,
    )
    status.save()
    return status


def factory_work_model(work_data: dict = TestWorkInfo.work1.value):
    """Produce a work model."""
    project = factory_project_model()
    epd = factory_staff_model()
    work = WorkModel(
        title=work_data["title"],
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
        work_lead_id=epd.id,
        work_type_id=work_data["work_type_id"],
        substitution_act_id=work_data["substitution_act_id"],
        decision_by_id=epd.id
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
        position_id=1
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
        'Authorization': 'Bearer ' + jwt.create_jwt(claims=claims, header=JWT_HEADER)
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
