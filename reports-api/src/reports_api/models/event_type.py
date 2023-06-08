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
"""Model to handle all operations related to Event Types."""

from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship

from .code_table import CodeTable
from .db import db


class Event_Type(db.Model, CodeTable):
    """Model class for Event Types."""

    __tablename__ = 'event_types'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    event_category_id = Column(ForeignKey('event_categories.id'), nullable=False)
    sort_order = Column(Integer, nullable=False)

    event_category = relationship('EventCategory', foreign_keys=[event_category_id], lazy='select')
