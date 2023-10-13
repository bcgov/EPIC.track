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
"""Model to handle all operations related to Reminder Configuration."""

from sqlalchemy import Column, Integer, String, Text, func

from .base_model import BaseModelVersioned


class ReminderConfiguration(BaseModelVersioned):
    """Model class for Engagement."""

    __tablename__ = "reminder_configurations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    reminder_type = Column(String(255), nullable=False)
    interval = Column(Text, nullable=False)
    email_addresses = Column(Text, nullable=False)
    reminder_text = Column(Text, nullable=True)
    position_id = Column(Integer, nullable=False)

    def as_dict(self, recursive=False):
        """Return a JSON representation"""
        return super().as_dict(recursive=recursive)

    @classmethod
    def check_existence(cls, reminder_type, position_id, reminder_configuration_id):
        """Checks if a reminder configuration exists for given reminder type and position"""
        query = ReminderConfiguration.query.filter(
            func.lower(ReminderConfiguration.reminder_type) == func.lower(reminder_type),
            ReminderConfiguration.position_id == position_id,
            ReminderConfiguration.is_deleted.is_(False),
        )
        if reminder_configuration_id:
            query = query.filter(ReminderConfiguration.id != reminder_configuration_id)
        if query.count() > 0:
            return True
        return False
