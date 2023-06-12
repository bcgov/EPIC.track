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

from .base_model import BaseModel


class WorkCalendarEvent(BaseModel):
    """Model class for Work Calendar Events."""

    __tablename__ = 'work_calendar_events'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    work_id = sa.Column(sa.ForeignKey('works.id'), nullable=False)
    phase_id = sa.Column(sa.ForeignKey('phase_codes.id'), nullable=False)
    calendar_event_id = sa.Column(sa.ForeignKey('calendar_events.id'), nullable=False)

    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    calendar_event = relationship('CalendarEvent', foreign_keys=[calendar_event_id], lazy='select')
