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

from .base_model import BaseModelVersioned


class ActionTemplate(BaseModelVersioned):
    """Model class for Outcome."""

    __tablename__ = 'action_templates'

    id = Column(Integer, primary_key=True, autoincrement=True)
    outcome_id = Column(ForeignKey('outcome_templates.id'), nullable=False)
    name = Column(String, nullable=False)
    additional_params = Column(JSONB)
    sort_order = Column(Integer, nullable=False)

    outcome = relationship('OutcomeTemplate', foreign_keys=[outcome_id], lazy='select')
