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
"""Exposes all of the Services used in the API."""

from .act_section import ActSectionService
from .action_template import ActionTemplateService
from .code import CodeService
from .eao_team_service import EAOTeamService
from .event import EventService
from .event_configuration import EventConfigurationService
from .event_template import EventTemplateService
from .indigenous_consultation_level_service import IndigenousConsultationLevelService
from .indigenous_nation import IndigenousNationService
from .inspection import InspectionService
from .lookups import LookupService
from .outcome_template import OutcomeTemplateService
from .phaseservice import PhaseService
from .position import PositionService
from .project import ProjectService
from .proponent import ProponentService
from .region import RegionService
from .reminder_configuration import ReminderConfigurationService
from .report import ReportService
from .responsibility import ResponsibilityService
from .staff import StaffService
from .sub_type import SubTypeService
from .task import TaskService
from .task_template import TaskTemplateService
from .types import TypeService
from .user import UserService
from .work import WorkService
from .work_issues import WorkIssuesService
from .work_phase import WorkPhaseService
from .work_status import WorkStatusService
from .project_state import ProjectStateService
