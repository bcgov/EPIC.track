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

from .base_model import BaseModelVersioned


# class ResponsibleEntityEnum(enum.Enum):
#     """Enum for responsible entity"""

#     # pylint: disable=C0103
#     Proponent = 1
#     PIN = 2
#     EAO = 3
#     # pylint: disable=C0103
#     FederalAgencies = 3


class StatusEnum(enum.Enum):
    """Enum for responsible entity"""

    NOT_STARTED = "NOT_STARTED"
    INPROGRESS = "INPROGRESS"
    COMPLETED = "COMPLETED"


class TaskEvent(BaseModelVersioned):
    """Model class for Tasks."""

    __tablename__ = "task_events"

    id = sa.Column(
        sa.Integer, primary_key=True, autoincrement=True
    )  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    work_phase_id = sa.Column(sa.ForeignKey('work_phases.id'), nullable=True)

    start_date = sa.Column(sa.DateTime(timezone=True))
    number_of_days = sa.Column(sa.Integer, default=1, nullable=False)
    tips = sa.Column(sa.String)
    notes = sa.Column(sa.String)
    status = sa.Column(sa.Enum(StatusEnum), default=StatusEnum.NOT_STARTED)

    work_phase = relationship('WorkPhase', foreign_keys=[work_phase_id], lazy='select')

    assignees = relationship(
        "TaskEventAssignee",
        primaryjoin="and_(TaskEvent.id==TaskEventAssignee.task_event_id,\
          TaskEventAssignee.is_active.is_(True), \
          TaskEventAssignee.is_deleted.is_(False))",
        back_populates="task_event",
    )

    responsibilities = relationship(
        "TaskEventResponsibility",
        primaryjoin="and_(TaskEvent.id==TaskEventResponsibility.task_event_id,\
          TaskEventResponsibility.is_active.is_(True), \
          TaskEventResponsibility.is_deleted.is_(False))",
        back_populates="task_event",
    )

    @classmethod
    def find_by_work_phase(cls, work_id: int, phase_id: int):
        """Find task events by work id and phase id"""
        return cls.query.filter_by(work_id=work_id, phase_id=phase_id).all()
