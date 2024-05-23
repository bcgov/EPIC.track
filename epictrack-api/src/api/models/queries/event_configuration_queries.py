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
"""Model to handle all complex operations related to Event Configurations."""
from typing import List
from sqlalchemy import and_

from api.models import EventConfiguration, Event, db
from api.models.event_category import EventCategoryEnum
from api.models.event_template import EventTemplateVisibilityEnum


class EventConfigurationQuery:  # pylint: disable=dangerous-default-value,too-many-arguments
    """Complex queries related to event configurations"""

    @classmethod
    def find_configurations(
        cls,
        work_phase_id: int,
        visibility_modes,
        event_categories: List[EventCategoryEnum] = [],
        _all: bool = False,
    ) -> List[EventConfiguration]:
        """Get all the mandatory configurations for a given phase"""
        query = db.session.query(EventConfiguration).filter(
            EventConfiguration.work_phase_id == work_phase_id,
            EventConfiguration.is_active.is_(True),
            EventConfiguration.is_deleted.is_(False),
        )
        if len(event_categories) > 0:
            category_ids = list(map(lambda x: x.value, event_categories))
            query = query.filter(EventConfiguration.event_category_id.in_(category_ids))
        query = query.filter(
            EventConfiguration.visibility.in_(visibility_modes)
        )
        if not _all:
            query = query.filter(EventConfiguration.parent_id.is_(None))
        configurations = query.all()
        return configurations

    @classmethod
    def find_active_suggested_configurations(cls, work_phase_id):
        """Find the SUGGESTED configurations for which the events are deleted"""
        return (
            db.session.query(EventConfiguration)
            .outerjoin(Event, EventConfiguration.id == Event.event_configuration_id)
            .filter(
                and_(
                    Event.is_deleted.is_(False),
                    Event.is_active.is_(True),
                    EventConfiguration.visibility
                    == EventTemplateVisibilityEnum.SUGGESTED.value,
                    EventConfiguration.work_phase_id == work_phase_id,
                )
            )
            .all()
        )
