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

import sqlalchemy as sa
from sqlalchemy.orm import relationship
from .base_model import BaseModelVersioned


class TaskTemplate(BaseModelVersioned):
    """Model class for Tasks."""

    __tablename__ = 'task_templates'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    ea_act_id = sa.Column(sa.ForeignKey('ea_acts.id'), nullable=False)
    phase_id = sa.Column(sa.ForeignKey('phase_codes.id'), nullable=False)
    work_type_id = sa.Column(sa.ForeignKey('work_types.id'), nullable=False)

    phase = relationship('PhaseCode', foreign_keys=[phase_id], lazy='select')
    work_type = relationship('WorkType', foreign_keys=[work_type_id], lazy='select')
    ea_act = relationship('EAAct', foreign_keys=[ea_act_id], lazy='select')

    tasks = relationship(
        "Task",
        primaryjoin="TaskTemplate.id==Task.template_id",
        back_populates="template",
    )
