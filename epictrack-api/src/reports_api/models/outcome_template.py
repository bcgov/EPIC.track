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
"""Model to handle all operations related to Outcome."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned, db


class OutcomeTemplate(BaseModelVersioned):
    """Model class for Outcome."""

    __tablename__ = 'outcome_templates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    event_template_id = Column(ForeignKey("event_templates.id"), nullable=False)
    sort_order = Column(Integer, nullable=False)

    event_template = relationship('EventTemplate', foreign_keys=[event_template_id], lazy='select')

    @classmethod
    def find_by_criteria(cls, criteria: dict):
        """Returns collection of outcomes by milestone_id"""
        outcomes = cls.query.filter_by(**criteria).all()
        return outcomes

    @classmethod
    def find_by_template_ids(cls, template_ids):
        """Returns the event configurations based on phase ids"""
        outcomes = db.session.query(
            OutcomeTemplate
        ).filter(
            OutcomeTemplate.event_template_id.in_(template_ids),
            OutcomeTemplate.is_active.is_(True)
        ).all()  # pylint: disable=no-member
        return outcomes
