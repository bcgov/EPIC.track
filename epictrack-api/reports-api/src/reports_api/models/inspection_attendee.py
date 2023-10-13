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
"""Model to handle all operations related to InspectionAttendee."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.mutable import MutableList

from .base_model import BaseModelVersioned


class InspectionAttendee(BaseModelVersioned):
    """Model class for InspectionAttendee."""

    __tablename__ = 'inspection_attendees'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    attended_on = Column(MutableList.as_mutable(JSONB), nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)

    inspection_id = Column(ForeignKey('inspections.id'), nullable=False)
    inspection = relationship('Inspection', foreign_keys=[inspection_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return super().as_dict(recursive=False)

    @classmethod
    def find_by_inspection_id(cls, inspection_id: int):
        """Return by inspection id."""
        return cls.query.filter_by(inspection_id=inspection_id)
