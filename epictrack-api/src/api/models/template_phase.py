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
"""A phase in a template version."""
import enum

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .phase_code import PhaseVisibilityEnum


class TimeLimitKind(enum.Enum):
    """What kind of time limit a phase has; the work type's rule set decides what each means."""

    FREE = "FREE"
    SET = "SET"
    LEGISLATED = "LEGISLATED"


class DayBasis(enum.Enum):
    """Whether a phase counts its start day as day 1 or day 0."""

    ZERO = "ZERO"
    ONE = "ONE"


class BoundarySide(enum.Enum):
    """Which side of the boundary before a phase users usually enter."""

    PREVIOUS_END = "PREVIOUS_END"
    OWN_START = "OWN_START"


class TemplatePhase(BaseModel):
    """A phase of a template version, identified across versions by its phase code."""

    __tablename__ = "template_phases"
    __table_args__ = (
        sa.UniqueConstraint("template_version_id", "phase_code_id", name="uq_template_phases_phase_code"),
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    template_version_id = sa.Column(sa.ForeignKey("work_template_versions.id"), nullable=False)
    phase_code_id = sa.Column(sa.ForeignKey("phase_codes.id"), nullable=False)
    name = sa.Column(sa.String(250), nullable=False)
    sort_order = sa.Column(sa.Integer, nullable=False)
    time_limit_kind = sa.Column(
        sa.Enum(TimeLimitKind, name="time_limit_kind_enum"), nullable=False, default=TimeLimitKind.FREE
    )
    number_of_days = sa.Column(sa.Integer, nullable=False, default=0)
    day_basis = sa.Column(sa.Enum(DayBasis, name="day_basis_enum"), nullable=False, default=DayBasis.ONE)
    # Only a hint for the work plan: both sides of a boundary stay editable.
    start_usually_set_by = sa.Column(
        sa.Enum(BoundarySide, name="boundary_side_enum"), nullable=False, default=BoundarySide.PREVIOUS_END
    )
    visibility = sa.Column(sa.Enum(PhaseVisibilityEnum), nullable=False, default=PhaseVisibilityEnum.REGULAR)
    # False means only an outcome adds the phase.
    in_default_sequence = sa.Column(sa.Boolean, nullable=False, default=True)
    is_intake = sa.Column(sa.Boolean, nullable=False, default=False)
    requires_overage_responsibility = sa.Column(sa.Boolean, nullable=False, default=False)

    version = relationship("WorkTemplateVersion", back_populates="phases")
    events = relationship("TemplateEvent", back_populates="phase", order_by="TemplateEvent.sort_order")
