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
"""Model to handle all operations related to Event Template."""

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class EventTemplate(BaseModel):
    """Model class for Event Template."""

    __tablename__ = 'event_templates'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    phase_id = sa.Column(sa.ForeignKey('phase_codes.id'), nullable=False)
    event_type_id = sa.Column(sa.ForeignKey('event_types.id'), nullable=False)
    start_at = sa.Column(sa.Integer, nullable=False)
    number_of_days = sa.Column(sa.Integer, default=1, nullable=False)
    mandatory = sa.Column(sa.Boolean, default=False)

    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    event_type = relationship('EventType', foreign_keys=[event_type_id], lazy='select')
