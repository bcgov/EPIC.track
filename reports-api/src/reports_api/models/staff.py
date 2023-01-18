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

from typing import List
from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import column_property, relationship

from reports_api.models.base_model import BaseModel


class Staff(BaseModel):
    """Model class for Staff."""

    __tablename__ = 'staffs'

    id = Column(Integer, primary_key=True, autoincrement=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    phone = Column(String(), nullable=False)
    email = Column(String(), nullable=False)
    is_active = Column(Boolean(), default=True)
    position_id = Column(ForeignKey('positions.id'), nullable=False)
    is_deleted = Column(Boolean(), default=False)

    position = relationship('Position', foreign_keys=[position_id], lazy='select')

    full_name = column_property(first_name + ", " + last_name)

    def as_dict(self):  # pylint: disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': self.full_name,
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
    def find_active_staff_by_positions(cls, position_ids: List[int]):
        """Return active staffs by position ids."""
        return cls.query.filter(Staff.position_id.in_(position_ids), Staff.is_active.is_(True))

    @classmethod
    def find_all_active_staff(cls):
        """Return all active staff."""
        return cls.query.filter_by(is_active=True)
