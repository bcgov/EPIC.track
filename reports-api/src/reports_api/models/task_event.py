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
"""Model to handle all operations related to Task Events."""

import enum
import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class ResponsibleEntityEnum(enum.Enum):
    """Enum for responsible entity"""

    # pylint: disable=C0103
    Proponent = 1
    PIN = 2
    EAO = 3
    # pylint: disable=C0103
    FederalAgencies = 3


class TaskEvent(BaseModel):
    """Model class for Tasks."""

    __tablename__ = 'task_events'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    work_id = sa.Column(sa.Integer, sa.ForeignKey('works.id'), nullable=False)
    phase_id = sa.Column(sa.Integer, sa.ForeignKey('phase_codes.id'), nullable=False)
    anticipated_date = sa.Column(sa.DateTime(timezone=True), nullable=False)
    actual_date = sa.Column(sa.DateTime(timezone=True))
    start_at = sa.Column(sa.Integer, default=0, nullable=False)
    number_of_days = sa.Column(sa.Integer, default=1, nullable=False)
    tips = sa.Column(sa.String)
    notes = sa.Column(sa.String)
    responsible_entity = sa.Column(sa.Enum(ResponsibleEntityEnum))
    is_completed = sa.Column(sa.Boolean, default=False)

    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    work = relationship('Work', foreign_keys=[work_id], lazy='select')
