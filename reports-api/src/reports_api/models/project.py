# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Model to manage Project."""

from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import TSTZRANGE

from .base_model import BaseModel, BaseModelVersioned


class Project(BaseModelVersioned):
    """Model class for Project."""

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String())
    project_tracking_number = Column(String(), nullable=True, default=None)
    description = Column(String())
    latitude = Column(String(), nullable=False)
    longitude = Column(String(), nullable=False)
    capital_investment = Column(Float())
    epic_guid = Column(String(), nullable=True, default=None)
    is_project_closed = Column(Boolean(), default=False, nullable=False)
    address = Column(Text, nullable=True, default=None)

    ea_certificate = Column(String(255), nullable=True, default=None)
    sub_type_id = Column(ForeignKey("sub_types.id"), nullable=False)
    type_id = Column(ForeignKey("types.id"), nullable=False)
    proponent_id = Column(ForeignKey("proponents.id"), nullable=False)
    region_id_env = Column(ForeignKey("regions.id"), nullable=False)
    region_id_flnro = Column(ForeignKey("regions.id"), nullable=False)
    abbreviation = Column(String(10), nullable=True)
    sub_type = relationship("SubType", foreign_keys=[sub_type_id], lazy="select")
    type = relationship("Type", foreign_keys=[type_id], lazy="select")
    proponent = relationship("Proponent", foreign_keys=[proponent_id], lazy="select")
    region_env = relationship("Region", foreign_keys=[region_id_env], lazy="select")
    region_flnro = relationship("Region", foreign_keys=[region_id_flnro], lazy="select")

    @classmethod
    def check_existence(cls, name, project_id=None):
        """Checks if a project exists with given name"""
        query = Project.query.filter(
            func.lower(Project.name) == func.lower(name), Project.is_deleted.is_(False)
        )
        if project_id:
            query = query.filter(Project.id != project_id)
        if query.count() > 0:
            return True
        return False


class ProjectSpecialFields(BaseModel):
    """Model class for tracking project special field values."""

    __tablename__ = "project_special_fields"

    id = Column(Integer, primary_key=True, autoincrement=True)
    field_name = Column(String(100), nullable=False)
    field_value = Column(String, nullable=False)
    time_range = Column(TSTZRANGE, nullable=False)

    project_id = Column(ForeignKey("projects.id"), nullable=False)
    project = relationship("Project", foreign_keys=[project_id], lazy="select")
