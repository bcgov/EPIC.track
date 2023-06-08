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
"""Model to handle all operations related to Tasks."""

from sqlalchemy import Column, Integer, ForeignKey, String
from sqlalchemy.orm import relationship

from .base_model import BaseModel
from .db import db


class Task(BaseModel):
    """Model class for Tasks."""

    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = Column(String)
    start_at = Column(Integer, default=0, nullable=False)
    duration = Column(Integer, default=1, nullable=False)
    template_id = Column(ForeignKey('task_templates.id'), nullable=False)

    template = relationship('TaskTemplate', foreign_keys=[template_id], lazy='select')
