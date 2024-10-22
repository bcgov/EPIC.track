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
"""Service to manage Outcome Configuration."""
from typing import List

from flask import current_app

from api.models import OutcomeConfiguration


class OutcomeConfigurationService:  # pylint: disable=too-few-public-methods
    """Service to manage outcome related operations"""

    @classmethod
    def find_by_configuration_id(
        cls, configuration_id: int
    ) -> List[OutcomeConfiguration]:
        """Find outcomes by configuration_id"""
        current_app.logger.debug(
            f"Find outcomes by configuration id {configuration_id}"
        )
        outcome_configurations = OutcomeConfiguration.find_by_params(
            {"event_configuration_id": configuration_id}
        )
        return outcome_configurations

    @classmethod
    def find_all_outcomes(cls, params: dict) -> [OutcomeConfiguration]:
        """Return all active outcomes"""
        outcomes = OutcomeConfiguration.find_by_params(
            {"event_configuration_id": params.get("event_configuration_id")}
        )
        return outcomes
