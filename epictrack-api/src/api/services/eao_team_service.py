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
"""EAO Team service"""

from api.models.eao_team import EAOTeam


class EAOTeamService:
    """Service to manage EAO Team related operations."""

    @staticmethod
    def find_team_by_id(team_id: int):
        """Get team by id."""
        return EAOTeam.find_by_id(team_id)

    @staticmethod
    def find_all_teams():
        """Get all teams."""
        return EAOTeam.find_all()
