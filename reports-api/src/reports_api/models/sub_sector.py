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
"""Model to handle all operations related to SubSector."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTable
from .db import db


class SubSector(db.Model, CodeTable):
    """Model class for SubSector."""

    __tablename__ = 'sub_sectors'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    short_name = Column(String())
    sector_id = Column(ForeignKey('sectors.id'), nullable=False)
    sector = relationship('Sector', foreign_keys=[sector_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        result = CodeTable.as_dict(self)
        result['short_name'] = self.short_name
        result['sector'] = self.sector.as_dict()
        return result

    @classmethod
    def find_by_sector_id(cls, sector_id):
        """Find all sub sectors by sector_id"""
        return cls.query.filter_by(sector_id=sector_id).all()
