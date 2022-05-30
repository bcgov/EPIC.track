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
"""Model to handle all operations related to Inspection."""

from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .base_model import BaseModel


class Inspection(BaseModel):
    """Model class for Inspection."""

    __tablename__ = 'inspections'

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_status = Column(String(255), nullable=False)
    inspection_status = Column(String(255), nullable=False)
    ea_certificate = Column(String(255), nullable=False)
    inspection_no = Column(String(255), nullable=False, unique=True)
    utm = Column(String(255), nullable=True, default=None)
    trigger = Column(String(255), nullable=False)
    inspection_type = Column(String(255), nullable=False)
    action_required_by = Column(String(255), nullable=True, default=None)
    action_company = Column(String(255), nullable=True, default=None)
    action_mailaddress = Column(String(255), nullable=True, default=None)
    action_contact_person = Column(String(255), nullable=True, default=None)
    action_phone_number = Column(String(255), nullable=True, default=None)
    action_email = Column(String(255), nullable=True, default=None)
    location_description = Column(Text, nullable=False)
    inspection_summary = Column(Text, nullable=True)
    enforcement_summary = Column(Text, nullable=True)
    regulatory_considerations = Column(Text, nullable=True)
    appendices = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    response_date = Column(Date, nullable=True)
    date_finalized = Column(Date, nullable=True)

    project_id = Column(ForeignKey('projects.id'), nullable=False)
    project = relationship('Project', foreign_keys=[project_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return super().as_dict(recursive=False)

    @classmethod
    def find_by_project_id(cls, _project_id):
        """Returns collection of inspections by project_id"""
        inspections = cls.query.filter_by(project_id=_project_id).all()
        return inspections

    @classmethod
    def find_count(cls):
        """Returns the total number of inspections"""
        return cls.query.count()
