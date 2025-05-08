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
"""Model to handle all operations related to Position."""

import enum

from sqlalchemy import Column, Integer, String

from .code_table import CodeTableVersioned
from .db import db


class PositionEnum(enum.Enum):
    """Enum for positions."""

    ASSOCIATE_DEPUTY_MINISTER = 1
    ADM = 2
    EXECUTIVE_PROJECT_DIRECTOR = 3
    PROJECT_ASSESSMENT_DIRECTOR = 4
    PROJECT_ASSESSMENT_OFFICER = 5
    PROJECT_ANALYST = 6
    OTHER = 7
    MINISTER = 8


class Position(db.Model, CodeTableVersioned):
    """Model class for Postion."""

    __tablename__ = 'positions'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(), nullable=False)
    sort_order = Column(Integer, nullable=False)

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name
        }
