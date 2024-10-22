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
"""Model to handle all operations related to Event Template."""

import sqlalchemy as sa
from sqlalchemy.orm import relationship

from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum

from .base_model import BaseModelVersioned
from .db import db


class EventConfiguration(BaseModelVersioned):
    """Model class for Event Template."""

    __tablename__ = 'event_configurations'

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    name = sa.Column(sa.String)
    parent_id = sa.Column(sa.Integer, nullable=True)
    template_id = sa.Column(sa.ForeignKey('event_templates.id'), nullable=False)
    event_type_id = sa.Column(sa.ForeignKey('event_types.id'), nullable=False)
    event_position = sa.Column(sa.Enum(EventPositionEnum))
    multiple_days = sa.Column(sa.Boolean, default=False)
    event_category_id = sa.Column(sa.ForeignKey('event_categories.id'), nullable=False)
    start_at = sa.Column(sa.String, nullable=True)
    number_of_days = sa.Column(sa.Integer, default=0, nullable=False)
    sort_order = sa.Column(sa.Integer, nullable=False)
    work_phase_id = sa.Column(sa.ForeignKey('work_phases.id'), nullable=True)
    visibility = sa.Column(sa.Enum(EventTemplateVisibilityEnum), nullable=False)
    repeat_count = sa.Column(sa.Integer, nullable=False, default=0)

    event_type = relationship('EventType', foreign_keys=[event_type_id], lazy='select')
    event_category = relationship('EventCategory', foreign_keys=[event_category_id], lazy='select')
    event_template = relationship('EventTemplate', foreign_keys=[template_id], lazy='select')
    work_phase = relationship('WorkPhase', foreign_keys=[work_phase_id], lazy='select')

    @classmethod
    def find_by_work_phase_id(cls, _work_phase_id):
        """Returns the event configurations based on phase id"""
        events = db.session.query(
            EventConfiguration
        ).filter_by(
            work_phase_id=_work_phase_id,
            is_active=True
        ).order_by(
            EventConfiguration.sort_order.asc()
        ).all()  # pylint: disable=no-member
        return events
