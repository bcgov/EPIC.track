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
"""Model to handle all operations related to act sections."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTableVersioned
from .db import db


class ActSection(db.Model, CodeTableVersioned):
    """Model class for ActSection."""

    __tablename__ = 'act_sections'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String())
    ea_act_id = Column(ForeignKey('ea_acts.id'), nullable=False)
    sort_order = Column(Integer, nullable=False)

    ea_act = relationship('EAAct', foreign_keys=[ea_act_id], lazy='select')
