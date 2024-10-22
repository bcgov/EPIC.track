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
"""Model to handle all operations related to Outcome Configuration."""

from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned, db


class OutcomeConfiguration(BaseModelVersioned):
    """Model class for Outcome."""

    __tablename__ = 'outcome_configurations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    event_configuration_id = Column(ForeignKey('event_configurations.id'), nullable=False)
    outcome_template_id = Column(ForeignKey('outcome_templates.id'), nullable=True)
    sort_order = Column(Integer, nullable=False)

    event_configuration = relationship('EventConfiguration', foreign_keys=[event_configuration_id], lazy='select')
    outcome_template = relationship('OutcomeTemplate', foreign_keys=[outcome_template_id])

    @classmethod
    def find_by_configuration_ids(cls, configuration_ids):
        """Returns the event configurations based on phase ids"""
        outcomes = db.session.query(
            OutcomeConfiguration
        ).filter(
            OutcomeConfiguration.event_template_id.in_(configuration_ids),
            OutcomeConfiguration.is_active.is_(True)
        ).all()  # pylint: disable=no-member
        return outcomes
