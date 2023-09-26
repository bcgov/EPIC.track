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
import enum
import sqlalchemy as sa

from .code_table import CodeTableVersioned
from .db import db


class ActionEnum(enum.Enum):
    """Action enum"""

    COMPLETE_CURRENT_PHASE = 1
    DISABLE_WORK_START_DATE = 2
    CLOSE_EVERYTHING = 3
    DUPLICATE_PHASE = 4
    DEACTIVATE_ALL_EVENTS = 5
    DELETE_ALL_EVENTS = 6
    CLOSE_WORK = 7
    CREATE_NEW_WORK = 8


class Action(db.Model, CodeTableVersioned):
    """Model class for Actions."""

    __tablename__ = 'actions'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    description = sa.Column(sa.String)
