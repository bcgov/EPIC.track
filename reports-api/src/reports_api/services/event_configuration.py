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
from typing import Iterable

from reports_api.models import EventConfiguration, db
from reports_api.models.event_category import EventCategoryEnum


class EventConfigurationService:
    """Service to manage event configurations"""

    @classmethod
    def add_configurations(cls, configs: Iterable[EventConfiguration]) -> None:
        """Add multiple event configurations"""
        db.session.add_all(configs)
        db.session.flush()

    @classmethod
    def find_mandatory_configurations(cls, phase_id: int,
                                      event_categories: [EventCategoryEnum] = []) -> [EventConfiguration]:
        # pylint: disable=dangerous-default-value
        """Get all the mandatory configurations for a given phase"""
        query = db.session.query(EventConfiguration).filter(EventConfiguration.phase_id == phase_id,
                                                            EventConfiguration.mandatory.is_(True),
                                                            EventConfiguration.is_active.is_(True))
        if len(event_categories) > 0:
            query.filter(EventConfiguration.event_category_id.in_(event_categories))
        configurations = query.all()
        return configurations
