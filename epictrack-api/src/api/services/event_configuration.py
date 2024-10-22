# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage Event Configuration."""
from typing import Iterable, List
from sqlalchemy import or_

from api.models import EventConfiguration, WorkPhase, db
from api.models.event_category import EventCategoryEnum
from api.models.event_template import EventTemplateVisibilityEnum
from api.models.queries.event_configuration_queries import EventConfigurationQuery


class EventConfigurationService:  # pylint: disable=dangerous-default-value,too-many-arguments
    """Service to manage event configurations"""

    @classmethod
    def add_configurations(cls, configs: Iterable[EventConfiguration]) -> None:
        """Add multiple event configurations"""
        db.session.add_all(configs)
        db.session.flush()

    @classmethod
    def find_configurations(
        cls,
        work_phase_id: int,
        visibility_modes,
        event_categories: List[EventCategoryEnum] = [],
        _all: bool = False,
    ) -> List[EventConfiguration]:
        """Get all the mandatory configurations for a given phase"""
        configurations = EventConfigurationQuery.find_configurations(
            work_phase_id, visibility_modes, event_categories, _all
        )
        return configurations

    @classmethod
    def find_configurations_for_adding_new_milestone(
        cls,
        work_phase_id: int,
        visibility_modes,
        event_categories: List[EventCategoryEnum] = [],
    ):
        """Return configurations that can be used when adding new milestone"""
        configurations = EventConfigurationQuery.find_configurations(
            work_phase_id, visibility_modes, event_categories
        )
        suggested_active_configurations = (
            EventConfigurationQuery.find_active_suggested_configurations(work_phase_id)
        )
        optional_configurations = [
            config
            for config in configurations
            if config.visibility == EventTemplateVisibilityEnum.OPTIONAL
            or (
                config.visibility == EventTemplateVisibilityEnum.SUGGESTED
                and config not in suggested_active_configurations
            )
        ]
        return optional_configurations

    @classmethod
    def find_all_configurations_by_work(
        cls, work_id: int, event_categories: List[EventCategoryEnum] = []
    ) -> List[EventConfiguration]:
        """Find all the configurations based on the work"""
        query = (
            db.session.query(EventConfiguration)
            .join(WorkPhase, WorkPhase.id == EventConfiguration.work_phase_id)
            .filter(
                EventConfiguration.is_active.is_(True),
                EventConfiguration.is_deleted.is_(False),
                WorkPhase.is_active.is_(True),
                WorkPhase.is_deleted.is_(False),
                WorkPhase.work_id == work_id,
            )
        )
        if len(event_categories) > 0:
            category_ids = list(map(lambda x: x.value, event_categories))
            query = query.filter(EventConfiguration.event_category_id.in_(category_ids))
        configurations = query.all()
        return configurations

    @classmethod
    def find_child_configurations(cls, configuration_id: int) -> List[EventConfiguration]:
        """Get all the child configurations for a given phase"""
        query = db.session.query(EventConfiguration).filter(
            EventConfiguration.parent_id == configuration_id,
            EventConfiguration.is_active.is_(True),
            EventConfiguration.is_deleted.is_(False),
        )
        configurations = query.all()
        return configurations

    @classmethod
    def find_parent_child_configurations(
        cls, configuration_id: int
    ) -> List[EventConfiguration]:
        """Get both parent and child configurations"""
        query = db.session.query(EventConfiguration).filter(
            or_(
                EventConfiguration.id == configuration_id,
                EventConfiguration.parent_id == configuration_id,
            ),
            EventConfiguration.is_active.is_(True),
        )
        configurations = query.all()
        return configurations
