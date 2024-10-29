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
from api.signals import before_commit

from .act_section import ActSection
from .action import Action, ActionEnum
from .action_configuration import ActionConfiguration
from .action_template import ActionTemplate
from .calendar_event import CalendarEvent
from .code_table import CodeTableVersioned
from .db import db  # noqa: I001
from .ea_act import EAAct
from .eao_team import EAOTeam
from .event import Event
from .event_category import PRIMARY_CATEGORIES, EventCategory, EventCategoryEnum
from .event_configuration import EventConfiguration
from .event_template import EventTemplate
from .event_type import EventType, EventTypeEnum
from .federal_involvement import FederalInvolvement, FederalInvolvementEnum
from .indigenous_category import IndigenousCategory
from .indigenous_nation import IndigenousNation
from .indigenous_work import IndigenousWork
from .inspection import Inspection
from .inspection_attachment import InspectionAttachment
from .inspection_attendee import InspectionAttendee
from .inspection_detail import InspectionDetail
from .milestone_type import MilestoneType
from .ministry import Ministry
from .outcome_configuration import OutcomeConfiguration
from .outcome_template import OutcomeTemplate
from .phase_code import PhaseCode
from .pip_org_type import PIPOrgType
from .position import Position
from .project import Project
from .proponent import Proponent
from .region import Region
from .reminder_configuration import ReminderConfiguration
from .responsibility import Responsibility
from .role import Role
from .special_field import SpecialField
from .staff import Staff
from .staff_work_role import StaffWorkRole
from .sub_types import SubType
from .substitution_acts import SubstitutionAct
from .task import Task
from .task_event import StatusEnum, TaskEvent
from .task_event_assignee import TaskEventAssignee
from .task_event_responsibility import TaskEventResponsibility
from .task_template import TaskTemplate
from .types import Type
from .work import Work, WorkStateEnum, EndingWorkStateEnum
from .work_calendar_event import WorkCalendarEvent
from .work_issue_updates import WorkIssueUpdates
from .work_issues import WorkIssues
from .work_phase import WorkPhase
from .work_status import WorkStatus
from .work_type import WorkType
from .indigenous_consultation_levels import IndigenousConsultationLevel
from .linked_work import LinkedWork
from .project_state import ProjectState
