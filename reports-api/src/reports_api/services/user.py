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
""""User service"""
from .keycloak import KeycloakService

class UserService:
    """User Service"""

    @staticmethod
    def get_all_users():
        """Get all users"""
        return KeycloakService.get_groups(briefRepresentation=False)
    

    def get_groups():
        """Get all groups"""
        groups = KeycloakService.get_groups(briefRepresentation=False)
        filtered_groups = list(filter((lambda g: 'level' in g['attributes']), groups))
        return filtered_groups