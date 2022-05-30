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
"""Model to handle all operations related to Inspection Details."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class InspectionDetail(BaseModel):
    """Model class for Inspection Details."""

    __tablename__ = 'inspection_details'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    title_summary = Column(Text, nullable=False)
    findings = Column(Text, nullable=False)
    compliance_status = Column(String(255), nullable=False)
    requirement = Column(String(255), nullable=False)
    reference_number = Column(String(255), nullable=False)

    inspection_id = Column(ForeignKey('inspections.id'), nullable=False)
    inspection = relationship('Inspection', foreign_keys=[inspection_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return super().as_dict(recursive=False)

    @classmethod
    def find_by_inspection_id(cls, _inspection_id):
        """Returns collection of inspection_details by inspection_id"""
        inspection_details = cls.query.filter_by(inspection_id=_inspection_id).all()
        return inspection_details
