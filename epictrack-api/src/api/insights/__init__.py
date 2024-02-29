"""Contains all insight generator related resources"""

from typing import Dict

from api.insights.insight_protocol import InsightGenerator
from api.insights.work_lead_insight import WorkLeadInsightGenerator
from api.insights.work_team_insight import WorkTeamInsightGenerator


def get_insight_generator(resource: str, group_by: str) -> InsightGenerator:
    """Returns the insight generator for the given insight type"""
    insight_generator_classes = {
        "works": {
            "team": WorkTeamInsightGenerator,
            "lead": WorkLeadInsightGenerator,
        }
    }

    return insight_generator_classes[resource][group_by]
