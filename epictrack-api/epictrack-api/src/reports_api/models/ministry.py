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
"""Model to handle all operations related to Ministry."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTableVersioned
from .db import db


class Ministry(db.Model, CodeTableVersioned):
    """Model class for Ministry."""

    __tablename__ = 'ministries'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    abbreviation = Column(String())
    minister_id = Column(ForeignKey('staffs.id'), nullable=True)
    sort_order = Column(Integer, nullable=False)

    minister = relationship('Staff', foreign_keys=[minister_id], lazy='select')

    def as_dict(self):
        """Return JSON representation."""
        result = CodeTableVersioned.as_dict(self)
        result['abbreviation'] = self.abbreviation
        result['combined'] = "-".join([self.name, self.abbreviation])
        result['minister'] = self.minister.as_dict() if self.minister else None
        return result
