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

    SET_EVENT_DATE = 1
    ADD_EVENT = 2
    SET_PHASES_STATUS = 3
    SET_EVENTS_STATUS = 4
    SET_WORK_STATE = 5
    SET_PROJECT_STATUS = 6
    LOCK_WORK_START_DATE = 7
    SET_WORK_DECISION_MAKER = 8
    ADD_PHASE = 9
    CREATE_WORK = 10
    CHANGE_PHASE_END_EVENT = 11
    SET_FEDERAL_INVOLVEMENT = 12
    SET_PROJECT_STATE = 13


class Action(db.Model, CodeTableVersioned):
    """Model class for Actions."""

    __tablename__ = 'actions'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    description = sa.Column(sa.String)
