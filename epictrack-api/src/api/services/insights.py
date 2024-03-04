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
"""Service to manage Insight."""
from flask import current_app

from api.insights import get_insight_generator
from api.insights.insight_protocol import InsightGenerator


class InsightService:  # pylint:disable=too-few-public-methods
    """Service to insights related operations"""

    @classmethod
    def fetch_work_insights(cls, group_by: str):
        """Fetch work insights"""
        current_app.logger.debug(f"Fetch work insights {group_by = }")
        insight_generator: InsightGenerator = get_insight_generator(
            resource="works", group_by=group_by
        )
        insights = insight_generator().fetch_data()
        return insights

    @classmethod
    def fetch_assessment_work_insights(cls, group_by: str):
        """Fetch assessment work insights"""
        current_app.logger.debug(f"Fetch assessment work insights {group_by = }")
        insight_generator: InsightGenerator = get_insight_generator(
            resource="works", group_by=f"assessment_by_{group_by}"
        )
        insights = insight_generator().fetch_data()
        return insights

    @classmethod
    def fetch_project_insights(cls, group_by: str, type_id: int = None):
        """Fetch project insights"""
        current_app.logger.debug(f"Fetch project insights {group_by = }")
        insight_generator: InsightGenerator = get_insight_generator(
            resource="projects", group_by=group_by
        )
        if type_id:
            insights = insight_generator().fetch_data(type_id=type_id)
        else:
            insights = insight_generator().fetch_data()
        return insights
