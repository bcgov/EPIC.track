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
"""Model to handle all operations related to Actions."""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from .base_model import BaseModelVersioned, db


class ActionTemplate(BaseModelVersioned):
    """Model class for Outcome."""

    __tablename__ = 'action_templates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    outcome_id = Column(ForeignKey('outcome_templates.id'), nullable=False)
    action_id = Column(ForeignKey('actions.id'), nullable=False)
    additional_params = Column(JSONB)
    description = Column(String, nullable=True)
    sort_order = Column(Integer, nullable=False)

    outcome = relationship('OutcomeTemplate', foreign_keys=[outcome_id], lazy='select')
    action = relationship('Action', foreign_keys=[action_id], lazy='select')

    @classmethod
    def find_by_outcome_ids(cls, outcome_ids):
        """Returns the event configurations based on phase ids"""
        actions = db.session.query(
            ActionTemplate
        ).filter(
            ActionTemplate.outcome_id.in_(outcome_ids),
            ActionTemplate.is_active.is_(True)
        ).all()  # pylint: disable=no-member
        return actions
