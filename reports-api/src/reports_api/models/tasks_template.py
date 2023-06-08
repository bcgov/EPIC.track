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
"""Model to handle all operations related to Task Templates."""

from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .db import db


class Task_Template(BaseModel):
    """Model class for Tasks."""

    __tablename__ = 'task_templates'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = Column(String)
    phase_id = Column(ForeignKey('phase_codes.id'), nullable=False)
    work_type_id = Column(ForeignKey('work_types.id'), nullable=False)
    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')

    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
