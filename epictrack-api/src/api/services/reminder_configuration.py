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
"""Service to manage Reminder configuration."""
from api.models import ReminderConfiguration


class ReminderConfigurationService:  # pylint: disable=too-few-public-methods
    """Service to manage reminder configuration related operations."""

    @classmethod
    def check_existence(cls, reminder_type, position_id, reminder_configuration_id):
        """Checks if a reminder configuration exists for given reminder type and position"""
        return ReminderConfiguration.check_existence(
            reminder_type, position_id, reminder_configuration_id
        )
