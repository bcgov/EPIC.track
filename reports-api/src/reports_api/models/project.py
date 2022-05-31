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

from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Project(BaseModel):
    """Model class for Project."""

    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String())
    description = Column(String())
    location = Column(String())
    capital_investment = Column(Float())
    epic_guid = Column(String(), nullable=True, default=None)
    is_project_closed = Column(Boolean(), default=False)
    address = Column(Text, nullable=True, default=None)
    ea_certificate = Column(String(255), nullable=True, default=None)
    sub_sector_id = Column(ForeignKey('sub_sectors.id'), nullable=False)
    proponent_id = Column(ForeignKey('proponents.id'), nullable=False)
    region_id_env = Column(ForeignKey('regions.id'), nullable=False)
    region_id_flnro = Column(ForeignKey('regions.id'), nullable=False)

    sub_sector = relationship('SubSector', foreign_keys=[sub_sector_id], lazy='select')
    proponent = relationship('Proponent', foreign_keys=[proponent_id], lazy='select')
    region_env = relationship('Region', foreign_keys=[region_id_env], lazy='select')
    region_flnro = relationship('Region', foreign_keys=[region_id_flnro], lazy='select')
