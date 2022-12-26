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

"""This exports all of the models and schemas used by the application."""
from sqlalchemy import event  # noqa: I001
from sqlalchemy.engine import Engine  # noqa: I001, I003, I004

# Import signal for it to register itself
from reports_api.signals import before_commit

from .code_table import CodeTable
from .db import db  # noqa: I001
from .ea_act import EAAct
from .eao_team import EAOTeam
from .engagement import Engagement, WorkEngagement
from .event import Event
from .federal_involvement import FederalInvolvement
from .indigenous_category import IndigenousCategory
from .indigenous_nation import IndigenousNation
from .indigenous_work import IndigenousWork
from .inspection import Inspection
from .inspection_attachment import InspectionAttachment
from .inspection_attendee import InspectionAttendee
from .inspection_detail import InspectionDetail
from .issue import Issue
from .milestone import Milestone
from .milestone_type import MilestoneType
from .ministry import Ministry
from .organization import Organization
from .outcome import Outcome
from .phase_code import PhaseCode
from .position import Position
from .project import Project
from .proponent import Proponent
from .region import Region
from .role import Role
from .sector import Sector
from .staff import Staff
from .staff_work_role import StaffWorkRole
from .sub_sector import SubSector
from .work import Work
from .work_phase import WorkPhase
from .work_status import WorkStatus
from .work_type import WorkType
