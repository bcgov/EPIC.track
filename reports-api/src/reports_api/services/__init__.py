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

from .code import CodeService
from .inspection import InspectionService
from .lookups import LookupService
from .milestone import MilestoneService
from .outcome import OutcomeService
from .project import ProjectService
from .report import ReportService
from .staff import StaffService
from .sub_type import SubTypeService
from .work import WorkService
from .indigenous_nation import IndigenousNationService
from .proponent import ProponentService
