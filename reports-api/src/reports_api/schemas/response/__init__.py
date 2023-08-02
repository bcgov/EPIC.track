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
"""Exposes all the response validation schemas"""
from .event_configuration_response import EventConfigurationResponseSchema
from .event_template_response import EventTemplateResponseSchema
from .indigenous_nation_response import IndigenousResponseNationSchema
from .outcome_response import OutcomeResponseSchema
from .phase_response import PhaseResponseSchema
from .project_response import ProjectResponseSchema
from .proponent_response import ProponentResponseSchema
from .staff_response import StaffResponseSchema
from .task_response import TaskResponseSchema, TaskTemplateResponseSchema
from .types_response import SubTypeResponseSchema, TypeResponseSchema
from .user_group_response import UserGroupResponseSchema
from .user_response import UserResponseSchema
from .work_response import (
    WorkPhaseResponseSchema, WorkResourceResponseSchema, WorkResponseSchema, WorkStaffRoleReponseSchema)
