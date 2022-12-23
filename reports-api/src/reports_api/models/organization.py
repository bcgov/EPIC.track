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
"""Model to handle all operations related to Organization."""

from sqlalchemy import BOOLEAN, Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from reports_api.models.base_model import BaseModel

from .code_table import CodeTable
from .db import db


class Organization(db.Model, CodeTable):
    """Model class for Organization."""

    __tablename__ = 'organizations'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    is_active = Column(BOOLEAN(), default=True)
    is_deleted = Column(Boolean(), default=False)

    responsible_epd_id = Column(ForeignKey('staffs.id'), nullable=True, default=None)
    responsible_epd = relationship('Staff', foreign_keys=[responsible_epd_id], lazy='select')

    def as_dict(self):
        """Return JSON Representation."""
        result = BaseModel.as_dict(self)
        result['is_active'] = self.is_active
        return result
