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
"""A work type's template under one EA Act, and its versions."""
import enum

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class WorkTemplateVersionStatus(enum.Enum):
    """Where a template version is in its life."""

    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    RETIRED = "RETIRED"


class WorkTemplate(BaseModel):
    """One template per work type and EA Act."""

    __tablename__ = "work_templates"
    __table_args__ = (
        sa.UniqueConstraint("work_type_id", "ea_act_id", name="uq_work_templates_work_type_ea_act"),
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    work_type_id = sa.Column(sa.ForeignKey("work_types.id"), nullable=False)
    ea_act_id = sa.Column(sa.ForeignKey("ea_acts.id"), nullable=False)
    name = sa.Column(sa.String(250), nullable=False)

    versions = relationship(
        "WorkTemplateVersion", back_populates="work_template", order_by="WorkTemplateVersion.version"
    )


class WorkTemplateVersion(BaseModel):
    """A version of a template. Once published, its rows never change."""

    __tablename__ = "work_template_versions"
    __table_args__ = (
        sa.UniqueConstraint("work_template_id", "version", name="uq_work_template_versions_version"),
        sa.Index(
            "uq_work_template_versions_one_draft", "work_template_id",
            unique=True, postgresql_where=sa.text("status = 'DRAFT'"),
        ),
    )

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    work_template_id = sa.Column(sa.ForeignKey("work_templates.id"), nullable=False)
    version = sa.Column(sa.Integer, nullable=False)
    status = sa.Column(
        sa.Enum(WorkTemplateVersionStatus, name="work_template_version_status_enum"),
        nullable=False, default=WorkTemplateVersionStatus.DRAFT,
    )
    change_note = sa.Column(sa.Text)
    based_on_version_id = sa.Column(sa.ForeignKey("work_template_versions.id"), nullable=True)
    published_at = sa.Column(sa.DateTime(timezone=True))
    published_by = sa.Column(sa.String(255))

    work_template = relationship("WorkTemplate", back_populates="versions")
    phases = relationship("TemplatePhase", back_populates="version", order_by="TemplatePhase.sort_order")
