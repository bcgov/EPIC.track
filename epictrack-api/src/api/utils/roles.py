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
"""Role definitions."""
from enum import Enum


class Role(Enum):
    """User Role."""

    # Keycloak Based roles
    CREATE_ENTITIES = 'CREATE_ENTITIES'
    EDIT_ENTITIES = 'EDIT_ENTITIES'


class Membership(Enum):
    """User Position in EAO"""

    EPD = 1
    LEAD = 2
    OTHER = 3
    FNCAIRT = 4
    ANALYST = 5
    TEAM_MEMBER = 'TEAM_MEMBER'
