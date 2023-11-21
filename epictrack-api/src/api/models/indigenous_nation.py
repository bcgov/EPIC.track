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

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .code_table import CodeTableVersioned
from .db import db


class IndigenousNation(db.Model, CodeTableVersioned):
    """Model class for IndigenousNation."""

    __tablename__ = 'indigenous_nations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    pip_link = Column(String, default=None, nullable=True)
    notes = Column(String)
    bcigid = Column(String)

    relationship_holder_id = Column(
        ForeignKey("staffs.id"), nullable=True, default=None
    )
    relationship_holder = relationship(
        "Staff", foreign_keys=[relationship_holder_id], lazy="select"
    )

    pip_org_type_id = Column(ForeignKey("pip_org_types.id"))
    pip_org_type = relationship(
        "PIPOrgType", foreign_keys=[pip_org_type_id], lazy="select"
    )

    def as_dict(self):
        """Return JSON Representation."""
        result = CodeTableVersioned.as_dict(self)
        result["is_active"] = self.is_active
        result["pip_link"] = self.pip_link
        result["relationship_holder_id"] = self.relationship_holder_id
        result["relationship_holder"] = (
            self.relationship_holder.as_dict() if self.relationship_holder else None
        )
        return result

    @classmethod
    def find_all_active_groups(cls):
        """Find all active groups."""
        return cls.query.filter_by(is_active=True).all()

    @classmethod
    def check_existence(cls, name, indigenous_nation_id=None):
        """Checks if an indigenous nation exists with given name"""
        query = IndigenousNation.query.filter(
            func.lower(IndigenousNation.name) == func.lower(name),
            IndigenousNation.is_deleted.is_(False),
        )
        if indigenous_nation_id:
            query = query.filter(IndigenousNation.id != indigenous_nation_id)
        if query.count() > 0:
            return True
        return False
