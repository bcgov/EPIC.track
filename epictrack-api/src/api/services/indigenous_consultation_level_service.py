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
"""Service to manage IndigenousConsultationLevel."""

from api.models import IndigenousConsultationLevel


class IndigenousConsultationLevelService:
    """Service to manage indigenous consultation level related operations."""

    @classmethod
    def find_consultation_levels(cls, consultation_id: int):
        """Find all active consultation levels"""
        consultation_level = IndigenousConsultationLevel.find_by_id(consultation_id)

        return consultation_level

    @classmethod
    def find_all_consultation_levels(cls, is_active):
        """Find all active consultation levels"""
        consultation_levels = IndigenousConsultationLevel.find_all(default_filters=is_active)

        return consultation_levels
