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
"""Model to handle all operations related to Work Calendar Events."""

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class WorkCalendarEvent(BaseModelVersioned):
    """Model class for Work Calendar Events."""

    __tablename__ = 'work_calendar_events'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    calendar_event_id = sa.Column(sa.ForeignKey('calendar_events.id'), nullable=False)
    source_event_id = sa.Column(sa.Integer, nullable=True)
    event_configuration_id = sa.Column(sa.ForeignKey('event_configurations.id'), nullable=False)

    event_configuration = relationship('EventConfiguration', foreign_keys=[event_configuration_id], lazy='select')
    calendar_event = relationship('CalendarEvent', foreign_keys=[calendar_event_id], lazy='select')
