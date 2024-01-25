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
"""Model to handle all operations related to Indigenous Work."""

import enum

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class PinEnum(enum.Enum):
    """Pin enum"""

    YES = 'Yes'
    NO = 'No'


class IndigenousWork(BaseModelVersioned):
    """Model class for IndigenousWork."""

    __tablename__ = "indigenous_works"

    id = Column(Integer, primary_key=True, autoincrement=True)
    work_id = Column(ForeignKey("works.id"), nullable=False)
    indigenous_nation_id = Column(ForeignKey("indigenous_nations.id"), nullable=False)
    indigenous_category_id = Column(
        ForeignKey("indigenous_categories.id"), nullable=True, default=None
    )
    indigenous_consultation_level_id = Column(
        ForeignKey("indigenous_consultation_levels.id"), nullable=False, default=None
    )
    is_deleted = Column(Boolean(), default=False, nullable=False)

    work = relationship("Work", foreign_keys=[work_id], lazy="select")
    indigenous_nation = relationship(
        "IndigenousNation", foreign_keys=[indigenous_nation_id], lazy="select"
    )
    indigenous_category = relationship(
        "IndigenousCategory", foreign_keys=[indigenous_category_id], lazy="select"
    )
    indigenous_consultation_level = relationship(
        "IndigenousConsultationLevel", foreign_keys=[indigenous_consultation_level_id], lazy="select"
    )

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            "id": self.id,
            "work_id": self.work_id,
            "indigenous_nation": self.indigenous_nation.as_dict(),
            "indigenous_category": self.indigenous_category.as_dict(),
            "indigenous_consultation_level": self.indigenous_consultation_level.as_dict(),
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)
