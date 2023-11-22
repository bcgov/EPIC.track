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
"""Model to handle all operations related to WorkPhase."""

from sqlalchemy import Boolean, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned
from .phase_code import PhaseVisibilityEnum


class WorkPhase(BaseModelVersioned):
    """Model class for WorkPhase."""

    __tablename__ = "work_phases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_deleted = Column(Boolean(), default=False, nullable=False)

    work_id = Column(ForeignKey("works.id"), nullable=False)
    phase_id = Column(ForeignKey("phase_codes.id"), nullable=False)
    name = Column(String(250))
    legislated = Column(Boolean, default=False)
    task_added = Column(
        Boolean,
        default=False,
    )
    number_of_days = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    is_suspended = Column(Boolean, default=False)
    suspended_date = Column(DateTime(timezone=True))
    sort_order = Column(Integer, nullable=False)
    visibility = Column(Enum(PhaseVisibilityEnum), default=PhaseVisibilityEnum.REGULAR)

    work = relationship("Work", foreign_keys=[work_id], lazy="select")
    phase = relationship("PhaseCode", foreign_keys=[phase_id], lazy="select")
