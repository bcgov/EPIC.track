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
"""A milestone in a template version."""
import enum
import uuid

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .event_template import EventPositionEnum, EventTemplateVisibilityEnum


class AnchorPoint(enum.Enum):
    """Which end of its anchor a milestone counts its offset from."""

    START = "START"
    END = "END"


class TemplateEvent(BaseModel):
    """A milestone of a template phase. MANDATORY visibility means it's required and can't be deleted."""

    __tablename__ = "template_events"
    __table_args__ = (
        sa.UniqueConstraint("template_version_id", "key", name="uq_template_events_key"),
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    template_version_id = sa.Column(sa.ForeignKey("work_template_versions.id"), nullable=False)
    template_phase_id = sa.Column(sa.ForeignKey("template_phases.id"), nullable=False, index=True)
    # The same milestone keeps its key from one version to the next.
    key = sa.Column(sa.Uuid, nullable=False, default=uuid.uuid4)
    name = sa.Column(sa.String(255), nullable=False)
    event_type_id = sa.Column(sa.ForeignKey("event_types.id"), nullable=False)
    event_category_id = sa.Column(sa.ForeignKey("event_categories.id"), nullable=False)
    event_position = sa.Column(
        sa.Enum(EventPositionEnum), nullable=False, default=EventPositionEnum.INTERMEDIATE
    )
    # Varchar, not a native enum, so a rule set can add its own roles.
    role = sa.Column(sa.String(50))
    visibility = sa.Column(sa.Enum(EventTemplateVisibilityEnum), nullable=False)
    # Empty means the phase's START.
    anchor_template_event_id = sa.Column(sa.ForeignKey("template_events.id"), nullable=True)
    anchor_point = sa.Column(sa.Enum(AnchorPoint, name="anchor_point_enum"), nullable=False, default=AnchorPoint.START)
    offset_days = sa.Column(sa.Integer, nullable=False, default=0)
    number_of_days = sa.Column(sa.Integer, nullable=False, default=0)
    multiple_days = sa.Column(sa.Boolean, nullable=False, default=False)
    repeatable = sa.Column(sa.Boolean, nullable=False, default=False)
    sets_work_start = sa.Column(sa.Boolean, nullable=False, default=False)
    sets_official_start = sa.Column(sa.Boolean, nullable=False, default=False)
    sort_order = sa.Column(sa.Integer, nullable=False)
    legacy_event_template_id = sa.Column(sa.ForeignKey("event_templates.id"), nullable=True)

    phase = relationship("TemplatePhase", back_populates="events")
    anchor = relationship("TemplateEvent", remote_side=[id], foreign_keys=[anchor_template_event_id])
    outcomes = relationship("TemplateOutcome", back_populates="event", order_by="TemplateOutcome.sort_order")
