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
from sqlalchemy import func

from reports_api.models import ReminderConfiguration


class ReminderConfigurationService:  # pylint: disable=too-few-public-methods
    """Service to manage reminder configuration related operations."""

    @classmethod
    def check_existence(cls, reminder_type, position_id, instance_id):
        """Checks if a reminder configuration exists for given reminder type and position"""
        query = ReminderConfiguration.query.filter(
                func.lower(ReminderConfiguration.reminder_type) == func.lower(reminder_type),
                ReminderConfiguration.position_id == position_id,
                ReminderConfiguration.is_deleted.is_(False))
        if instance_id:
            query = query.filter(ReminderConfiguration.id != instance_id)
        if query.count() > 0:
            return {"exists": True}
        return {"exists": False}
