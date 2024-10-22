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
"""Model to handle all operations related to Event Categories."""

import enum
import sqlalchemy as sa
from .base_model import BaseModelVersioned


class EventCategoryEnum(enum.Enum):
    """Enum for EventCategory"""

    # pylint: disable=C0103
    MILESTONE = 1
    EXTENSION = 2
    SUSPENSION = 3
    DECISION = 4
    PCP = 5
    CALENDAR = 6
    FINANCE = 7
    SPECIAL_EXTENSION = 8


class EventCategory(BaseModelVersioned):
    """Model class for Event Categories."""

    __tablename__ = 'event_categories'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String, nullable=False)
    sort_order = sa.Column(sa.Integer, nullable=False)


PRIMARY_CATEGORIES = [EventCategoryEnum.MILESTONE,
                      EventCategoryEnum.DECISION,
                      EventCategoryEnum.EXTENSION,
                      EventCategoryEnum.SUSPENSION,
                      EventCategoryEnum.PCP,
                      EventCategoryEnum.FINANCE]
