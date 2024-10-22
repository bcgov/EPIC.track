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
"""Exposes all the request validation schemas"""
from api.schemas.request.region_request import RegionTypePathParameterSchema

from .act_section_request import ActSectionQueryParameterSchema
from .action_configuration_request import ActionConfigurationBodyParameterSchema
from .action_template_request import ActionTemplateBodyParameterSchema
from .base import BasicRequestQueryParameterSchema
from .event_configuration_request import (
    EventConfigurationBodyParamSchema,
    EventConfigurationQueryParamSchema,
)
from .event_request import (
    MilestoneEventBodyParameterSchema,
    MilestoneEventBulkDeleteQueryParamSchema,
    MilestoneEventCheckQueryParameterSchema,
    MilestoneEventPathParameterSchema,
    MilestoneEventPushEventQueryParameterSchema,
)
from .event_template_request import EventTemplateBodyParameterSchema
from .indigenous_nation_request import (
    IndigenousNationBodyParameterSchema,
    IndigenousNationExistenceQueryParamSchema,
    IndigenousNationIdPathParameterSchema,
    IndigenousWorkBodyParameterSchema,
    WorkIndigenousNationIdPathParameterSchema,
    WorkNationExistenceCheckQueryParamSchema,
)
from .insight_request import (
    ProjectInsightRequestQueryParameterSchema,
    WorkInsightRequestQueryParameterSchema,
)
from .outcome_configuration_request import (
    OutcomeConfigurationBodyParameterSchema,
    OutcomeConfigurationQueryParameterSchema,
)
from .outcome_template_request import OutcomeTemplateBodyParameterSchema
from .phase_request import PhaseBodyParameterSchema
from .project_request import (
    ProjectAbbreviationParameterSchema,
    ProjectBodyParameterSchema,
    ProjectExistenceQueryParamSchema,
    ProjectFirstNationsQueryParamSchema,
    ProjectIdPathParameterSchema,
)
from .proponent_request import (
    ProponentBodyParameterSchema,
    ProponentExistenceQueryParamSchema,
    ProponentIdPathParameterSchema,
)
from .reminder_configuration_request import (
    ReminderConfigurationExistenceQueryParamSchema,
)
from .special_field_request import (
    SpecialFieldBodyParameterSchema,
    SpecialFieldIdPathParameterSchema,
    SpecialFieldQueryParamSchema,
)
from .staff_request import (
    StaffBodyParameterSchema,
    StaffByPositionsQueryParamSchema,
    StaffEmailPathParameterSchema,
    StaffExistanceQueryParamSchema,
    StaffIdPathParameterSchema,
)
from .staff_work_role_request import (
    StaffWorkBodyParamSchema,
    StaffWorkExistenceCheckQueryParamSchema,
    StaffWorkPathParamSchema,
)
from .task_request import (
    TaskTemplateBodyParameterSchema,
    TaskTemplateIdPathParameterSchema,
    TaskTemplateImportEventsBodyParamSchema,
    TaskBodyParameterSchema,
    CopyTaskEventBodyParameterSchema,
    TaskEventBodyParamSchema,
    TaskEventBulkUpdateBodyParamSchema,
    TaskEventIdPathParameterSchema,
    TaskEventQueryParamSchema,
    TasksBulkDeleteQueryParamSchema,
    TaskTemplateQueryParamSchema,
    TaskEventByStaffQueryParamSchema,
)
from .type_request import TypeIdPathParameterSchema
from .user_group_request import UserGroupBodyParamSchema, UserGroupPathParamSchema
from .work_request import (
    WorkBodyParameterSchema,
    WorkExistenceQueryParamSchema,
    WorkFirstNationImportBodyParamSchema,
    WorkFirstNationNotesBodySchema,
    WorkIdPathParameterSchema,
    WorkIdPhaseIdPathParameterSchema,
    WorkIssuesCreateParameterSchema,
    WorkIssuesParameterSchema,
    WorkIssuesUpdateCloneSchema,
    WorkIssuesUpdateEditSchema,
    WorkNotesBodySchema,
    WorkPlanDownloadQueryParamSchema,
    WorkStatusParameterSchema,
    WorkTypeIdQueryParamSchema,
    WorkQueryParameterSchema,
)
