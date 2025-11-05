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

from datetime import date
import enum
import sqlalchemy as sa
from sqlalchemy import cast, Date, literal_column, select
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


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
    )  # TODO check how it can be inherited from parent TRACK-532
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

    @classmethod
    def find_by_work_ids_and_year(cls, work_ids: list[int], year: int):
        """Return all task events matching any of the given work IDs that overlap with the given year."""
        start_of_year = date(year, 1, 1)
        end_of_year = date(year, 12, 31)

        # Build the subquery: SELECT id FROM work_phases WHERE work_id IN (work_ids)
        subquery = (
            select(sa.column("id"))
            .select_from(sa.table("work_phases"))
            .where(sa.column("work_id").in_(work_ids))
            .scalar_subquery()
        )

        start_date = cls.start_date
        interval_expr = literal_column("INTERVAL '1 day'") * cls.number_of_days
        end_date = start_date + interval_expr

        # Build the main query filtering on work_phase_id in the subquery
        query = (
            cls.query
            .filter(
                cls.work_phase_id.in_(subquery),
                cls.is_deleted.is_(False),
                start_date <= cast(end_of_year, Date),
                end_date >= cast(start_of_year, Date),
            )
        )

        return query.all()
