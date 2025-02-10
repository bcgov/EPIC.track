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

Test Utility for creating test scenarios.
"""
from enum import Enum

from faker import Faker

from api.config import get_named_config
from api.models.special_field import EntityEnum, FieldTypeEnum
from api.models.task_event import StatusEnum
from api.utils.constants import CANADA_TIMEZONE
from tests.constants import ASSESSMENT_WORK_TYPE
from tests.utilities.providers import FormattedPhoneNumberProvider


fake = Faker()
fake.add_provider(FormattedPhoneNumberProvider)

CONFIG = get_named_config('testing')


class TestProjectInfo(Enum):
    """Test scenarios of Project Creation."""

    project1 = {
        "name": fake.word(),
        "description": fake.sentence(),
        "address": fake.address(),
        "type_id": fake.random_int(min=1, max=9),
        "sub_type_id": fake.random_int(min=1, max=10),
        "proponent_id": fake.random_int(min=1, max=10),
        "region_id_env": fake.random_int(min=1, max=10),
        "region_id_flnro": fake.random_int(min=1, max=10),
        "latitude": fake.latitude(),
        "longitude": fake.longitude(),
        "abbreviation": fake.word().upper()[:10]

    }

    project2 = {
        "name": fake.word(),
    }


class TestWorkInfo(Enum):
    """Test scenarios of Project Creation."""

    work1 = {
        "report_description": fake.sentence(),
        "epic_description": fake.paragraph(),
        "is_active": True,
        "start_date": fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE).isoformat(),
        "ministry_id": 1,
        "ea_act_id": 3,
        "eao_team_id": 1,
        "federal_involvement_id": 1,
        "work_type_id": 1,
        "substitution_act_id": 1,
        "simple_title": fake.word()
    }

    work_in_active = {
        "report_description": fake.sentence(),
        "epic_description": fake.paragraph(),
        "is_active": False,
        "start_date": fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE).isoformat(),
        "ministry_id": 1,
        "ea_act_id": 3,
        "eao_team_id": 1,
        "federal_involvement_id": 1,
        "work_type_id": 1,
        "substitution_act_id": 1,
        "simple_title": fake.word()
    }

    validation_work = {
        "title": fake.word(),
    }

    assessment_work = {
        "title": f"{fake.word()}-Assessment",
        "report_description": fake.sentence(),
        "epic_description": fake.paragraph(),
        "is_active": True,
        "start_date": "2024-01-01T00:00:00-08:00",
        "project_id": 1,
        "ministry_id": 1,
        "ea_act_id": 3,
        "eao_team_id": 1,
        "federal_involvement_id": 1,
        "responsible_epd_id": 55,
        "work_lead_id": 30,
        "work_type_id": ASSESSMENT_WORK_TYPE,
        "substitution_act_id": 1,
        "decision_by_id": 171,
        "simple_title": fake.word()
    }


class TestStaffInfo(Enum):
    """Test scenarios of Staff Creation."""

    staff1 = {
        "first_name": fake.first_name(),
        "last_name": fake.last_name(),
        "phone": fake.formatted_phone_number(),
        "email": fake.email(),
        "is_active": True,
        "position_id": fake.random_int(min=1, max=12)
    }

    update_staff = {
        "first_name": fake.first_name(),
        "last_name": fake.last_name(),
        "email": fake.email(),
        "is_active": True,
        "position_id": fake.random_int(min=1, max=12)
    }

    validate_staff = {
        "email": fake.email()
    }


class TestIssues(Enum):
    """Test scenarios of Issues Creation."""

    issue2 = {
        "title": fake.word(),
        "description": fake.sentence(),
        "start_date": fake.date_time_this_decade(tzinfo=None).isoformat(),
        "expected_resolution_date": fake.date_time_between(start_date='now', end_date='+10d', tzinfo=None).isoformat(),
        "is_active": True,
        "is_high_priority": True,
        "updates": [fake.sentence()]
    }


class TestWorkIssuesInfo(Enum):
    """Test scenarios for WorkIssues."""

    issue1 = {
        "title": fake.word(),
        "is_active": True,
        "is_high_priority": False,
        "start_date": fake.date_time_this_decade(tzinfo=None),
        "expected_resolution_date": fake.date_time_this_decade(tzinfo=None),
    }


class TestStatus(Enum):
    """Test scenarios of WorkStatus."""

    status1 = {
        "description": fake.sentence(),
        "posted_date": fake.date_time_this_decade(tzinfo=None).isoformat(),
        "is_approved": False,
        "approved_by": None,
        "approved_date": None,
    }


class TestWorkIssueUpdatesInfo(Enum):
    """Test scenarios for WorkIssueUpdates."""

    update1 = {
        "description": fake.sentence(),
        "posted_date": fake.date_time_this_decade(tzinfo=None).isoformat(),
        "is_approved": False,
        "approved_by": None,
    }


class TestJwtClaims(dict, Enum):
    """Test scenarios of jwt claims."""

    staff_admin_role = {
        'iss': CONFIG.JWT_OIDC_TEST_ISSUER,
        'sub': 'f7a4a1d3-73a8-4cbc-a40f-bb1145302064',
        'idp_userid': 'f7a4a1d3-73a8-4cbc-a40f-bb1145302064',
        'preferred_username': f'{fake.user_name()}@idir',
        'given_name': fake.first_name(),
        'family_name': fake.last_name(),
        'tenant_id': 1,
        'email': 'staff@gov.bc.ca',
        'realm_access': {
            'roles': [
                'staff',
                'create',
                'edit',
                'extended_edit'

            ]
        }
    }


class TestProponent(Enum):
    """Test scenarios for proponents"""

    proponent1 = {
        "name": fake.word()
    }

    proponent2 = {
        "name": fake.word()
    }


class TestFirstNation(Enum):
    """Test scenarios for first nations"""

    first_nation1 = {
        "name": fake.word(),
        "is_active": False,
        "notes": fake.sentence(),
        "pip_link": fake.domain_word(),
    }

    first_nation2 = {
        "name": fake.word(),
        "is_active": True,
        "notes": fake.sentence(),
        "pip_link": fake.domain_word(),
    }


class TestPipOrgType(Enum):
    """Test scenarios for PIP Org Types"""

    pip_org_type1 = {
        "name": fake.word()
    }


class TestSpecialField(Enum):
    """Test scenarios for Special fields"""

    proponent_entity = {
        "entity": EntityEnum.PROPONENT.value,
        "field_name": "name",
        "field_value": fake.word(),
        "active_from": fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE).isoformat(),
        "field_type": FieldTypeEnum.STRING.value
    }

    work_entity = {
        "entity": EntityEnum.WORK.value,
        "field_name": "work_lead_id",
        "field_value": fake.word(),
        "active_from": fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE).isoformat(),
        "field_type": FieldTypeEnum.INTEGER.value
    }


class TestRoleEnum(Enum):
    """Test scenarios for roles"""

    RESPONSIBLE_EPD = 1
    TEAM_LEAD = 2
    OFFICER_ANALYST = 3
    FN_CAIRT = 4
    OTHER = 5


class TestWorkFirstNationEnum(Enum):
    """Test scenarios for work first nation"""

    work_first_nation1 = {
        "indigenous_category_id": fake.random_int(min=1, max=8),
        "indigenous_consultation_level_id": fake.random_int(min=1, max=4),
        "is_active": True
    }


class TestWorkNotesEnum(Enum):
    """Test scenarios for work notes"""

    work_notes1 = {
        "notes": fake.sentence(),
        "note_type": "status_notes"
    }

    work_notes2 = {
        "notes": fake.sentence(),
        "note_type": "issue_notes"
    }


class TestTaskTemplateEnum(Enum):
    """Test scenarios for task templates"""

    task_template1 = {
        "name": fake.word(),
        "ea_act_id": 3,
        "work_type_id": 1,
        "phase_id": 1,
    }


class WorkPhaseEnum(Enum):
    """Test scenarios for work phase"""

    work_phase1 = {
        "start_date": (start_date := fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE)).isoformat(),
        "end_date": fake.date_time_between_dates(datetime_start=start_date, tzinfo=CANADA_TIMEZONE).isoformat(),
        "phase_id": 1,
        "sort_order": 1
    }


class TestTaskEnum(Enum):
    """Test scenarios for tasks"""

    task1 = {
        "name": fake.word(),
        "responsibility_ids": fake.random_elements(elements=(
            1, 2, 3, 4, 5, 6, 7, 8, 9
        ), unique=True),
        "start_date": fake.date_time_this_decade(tzinfo=CANADA_TIMEZONE).isoformat(),
        "status": StatusEnum.NOT_STARTED.value
    }
