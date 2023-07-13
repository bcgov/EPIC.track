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
"""Model to handle all operations related to Proponent."""

from sqlalchemy import BOOLEAN, Boolean, Column, ForeignKey, Integer, func
from sqlalchemy.orm import relationship

from .code_table import CodeTableVersioned
from .db import db


class Proponent(db.Model, CodeTableVersioned):
    """Model class for Proponent."""

    __tablename__ = "proponents"

    id = Column(
        Integer, primary_key=True, autoincrement=True
    )  # TODO check how it can be inherited from parent
    is_active = Column(BOOLEAN(), default=True, nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)

    relationship_holder_id = Column(
        ForeignKey("staffs.id"), nullable=True, default=None
    )
    relationship_holder = relationship(
        "Staff", foreign_keys=[relationship_holder_id], lazy="select"
    )

    def as_dict(self):
        """Return JSON Representation."""
        result = CodeTableVersioned.as_dict(self)
        result["is_active"] = self.is_active
        result["relationship_holder_id"] = self.relationship_holder_id
        result["relationship_holder"] = (
            self.relationship_holder.as_dict() if self.relationship_holder else None
        )
        return result

    @classmethod
    def check_existence(cls, name, proponent_id):
        """Checks if a proponent exists with given name"""
        query = Proponent.query.filter(
            func.lower(Proponent.name) == func.lower(name),
            Proponent.is_deleted.is_(False),
        )
        if proponent_id:
            query = query.filter(Proponent.id != proponent_id)
        if query.count() > 0:
            return True
        return False
