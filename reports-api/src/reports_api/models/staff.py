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
"""Model to handle all operations related to Staff."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTable
from .db import db


class Staff(db.Model, CodeTable):
    """Model class for Staff."""

    __tablename__ = 'staffs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(), nullable=False)
    phone = Column(String(), nullable=False)
    email = Column(String(), nullable=False)
    is_active = Column(Boolean(), default=True)
    position_id = Column(ForeignKey('positions.id'), nullable=False)

    position = relationship('Position', foreign_keys=[position_id], lazy='select')

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name,
            'phone': self.phone,
            'email': self.email,
            'is_active': self.is_active,
            'position': self.position.as_dict()
        }

    @classmethod
    def find_active_staff_by_position(cls, position_id: int):
        """Return active staff by position id."""
        return cls.query.filter_by(position_id=position_id, is_active=True)

    @classmethod
    def find_all_active_staff(cls):
        """Return all active staff."""
        return cls.query.filter_by(is_active=True)
