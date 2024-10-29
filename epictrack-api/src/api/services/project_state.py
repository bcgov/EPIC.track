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
"""Project State service"""

from api.models.project_state import ProjectState


class ProjectStateService:  # pylint: disable=too-few-public-methods
    """Service to manage Project State related operations."""

    @staticmethod
    def find_by_component(components):
        """Get Project States by components"""
        return ProjectState.find_by_components(components)

    @staticmethod
    def find_all():
        """Get all Project States."""
        return ProjectState.find_all()
