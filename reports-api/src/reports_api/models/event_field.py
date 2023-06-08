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
"""Model to handle all operations related to Event Fields."""

from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .db import db


class Event_Field(BaseModel):
    """Model class for Event Fields."""

    __tablename__ = 'event_fields'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = Column(String)
    event_category_id = Column(ForeignKey('event_categories.id'), nullable=False)
    event_type_id = Column(ForeignKey('event_types.id'), nullable=False)
    field_type = Column(String)
    reference = Column(String)
    control_label = Column(String)
    validations = Column(String)

    event_category = relationship('EventCategory', foreign_keys=[event_category_id], lazy='select')
    event_type = relationship('EventType', foreign_keys=[event_type_id], lazy='select')
