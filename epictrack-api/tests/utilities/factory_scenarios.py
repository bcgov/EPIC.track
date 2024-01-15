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

fake = Faker()
CONFIG = get_named_config('testing')


class TestProjectInfo(Enum):
    """Test scenarios of Project Creation."""

    project1 = {
        "name": fake.word(),
        "description": fake.sentence(),
        "address": fake.address(),
        "type_id": fake.random_int(min=1, max=10),
        "sub_type_id": fake.random_int(min=1, max=10),
        "proponent_id": fake.random_int(min=1, max=10),
        "region_id_env": fake.random_int(min=1, max=10),
        "region_id_flnro": fake.random_int(min=1, max=10),
        "latitude": fake.latitude(),
        "longitude": fake.longitude(),
        "abbreviation": fake.word().upper()[:10]

    }


class TestWorkInfo(Enum):
    """Test scenarios of Project Creation."""

    work1 = {
        "title": fake.word(),
        "report_description": fake.sentence(),
        "epic_description": fake.paragraph(),
        "is_active": True,
        "start_date": "2024-01-11T00:00:00-08:00",
        "project_id": 1,
        "ministry_id": 1,
        "ea_act_id": 3,
        "eao_team_id": 1,
        "federal_involvement_id": 1,
        "responsible_epd_id": 55,
        "work_lead_id": 30,
        "work_type_id": 1,
        "substitution_act_id": 1,
        "decision_by_id": 171
    }


class TestStaffInfo(Enum):
    """Test scenarios of Staff Creation."""

    staff1 = {
        "first_name": fake.first_name(),
        "last_name": fake.last_name(),
        "phone": fake.phone_number(),
        "email": fake.email(),
        "is_active": True
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
                'create'
            ]
        }
    }
