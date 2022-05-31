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
"""Model to handle all operations related to Indigenous Group."""

from sqlalchemy import Boolean, Column, Integer, String

from .code_table import CodeTable
from .db import db


class IndigenousNation(db.Model, CodeTable):
    """Model class for IndigenousNation."""

    __tablename__ = 'indigenous_nations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name,
            'is_active': self.is_active
        }

    @classmethod
    def find_all_active_groups(cls):
        """Find all active groups."""
        return cls.query.filter_by(is_active=True).all()
