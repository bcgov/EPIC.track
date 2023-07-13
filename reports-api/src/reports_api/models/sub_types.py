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
"""Model to handle all operations related to SubTypes."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .code_table import CodeTableVersioned
from .db import db


class SubType(db.Model, CodeTableVersioned):
    """Model class for SubTypes."""

    __tablename__ = "sub_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    short_name = Column(String())
    type_id = Column(ForeignKey("types.id"), nullable=False)
    type = relationship("Type", foreign_keys=[type_id], lazy="select")
    sort_order = Column(Integer, nullable=False)

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        result = CodeTableVersioned.as_dict(self)
        result["short_name"] = self.short_name
        result["type"] = self.type.as_dict()
        return result

    @classmethod
    def find_by_type_id(cls, type_id):
        """Find all sub types by type_id"""
        return cls.query.filter_by(type_id=type_id).all()
