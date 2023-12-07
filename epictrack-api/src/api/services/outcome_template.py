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
"""Service to manage Outcome."""
from flask import current_app

from api.models import OutcomeTemplate


class OutcomeTemplateService:
    """Service to manage outcome related operations"""

    @classmethod
    def find_by_milestone_id(cls, milestone_id: int):
        """Find outcomes by milestone_id"""
        current_app.logger.debug(f"Find outcomes by milestone_id {milestone_id}")
        outcomes = OutcomeTemplate.find_by_milestone_id(milestone_id)
        return outcomes

    @classmethod
    def find_all_active_milestones(cls):
        """Find all active outcomes"""
        current_app.logger.debug("Find all active outcomes")
        outcomes = OutcomeTemplate.find_all()
        return outcomes

    @classmethod
    def find_all_outcomes(cls, params: dict) -> [OutcomeTemplate]:
        """Return all active outcomes"""
        outcomes = OutcomeTemplate.find_by_params(
            {"event_template_id": params.get("event_template_id")}
        )
        return outcomes
