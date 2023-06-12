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
"""Model to handle all operations related to Event Field Values."""

import sqlalchemy as sa
from sqlalchemy.orm import relationship
from .base_model import BaseModel


class EventFieldValue(BaseModel):
    """Model class for Event Field Values."""

    __tablename__ = 'event_field_values'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String, nullable=False)
    field_id = sa.Column(sa.ForeignKey('event_fields.id'), nullable=False)
    event_id = sa.Column(sa.ForeignKey('events.id'), nullable=False)
    value = sa.Column(sa.String)

    field = relationship('EventField', foreign_keys=[field_id], lazy='select')
    event = relationship('Event', foreign_keys=[event_id], lazy='select')
