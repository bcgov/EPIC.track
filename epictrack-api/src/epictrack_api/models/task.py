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

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class Task(BaseModelVersioned):
    """Model class for Tasks."""

    __tablename__ = 'tasks'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    start_at = sa.Column(sa.Integer, default=0, nullable=False)
    number_of_days = sa.Column(sa.Integer, default=1, nullable=False)
    template_id = sa.Column(sa.ForeignKey('task_templates.id'), nullable=False)
    responsibility_id = sa.Column(sa.Integer, sa.ForeignKey('responsibilities.id'), nullable=False)
    tips = sa.Column(sa.String)

    template = relationship('TaskTemplate', foreign_keys=[template_id], lazy='select')
    responsibility = relationship('Responsibility', foreign_keys=[responsibility_id], lazy='select')
