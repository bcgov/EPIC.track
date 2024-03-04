"""Contains all insight generator related resources"""

from api.insights.insight_protocol import InsightGenerator
from api.insights.project_region_insight import ProjectByRegionInsightGenerator
from api.insights.project_subtype_insight import ProjectBySubTypeInsightGenerator
from api.insights.project_type_insight import ProjectByTypeInsightGenerator
from api.insights.work_assessment_phase_insight import AssessmentWorksByPhaseInsightGenerator
from api.insights.work_federal_involvement_insight import WorkFederalInvolvementInsightGenerator
from api.insights.work_first_nation_insight import WorkFirstNationInsightGenerator
from api.insights.work_lead_insight import WorkLeadInsightGenerator
from api.insights.work_ministry_insight import WorkMinistryInsightGenerator
from api.insights.work_staff_insight import WorkStaffInsightGenerator
from api.insights.work_team_insight import WorkTeamInsightGenerator
from api.insights.work_type_insight import WorkByTypeInsightGenerator


def get_insight_generator(resource: str, group_by: str) -> InsightGenerator:
    """Returns the insight generator for the given insight type"""
    insight_generator_classes = {
        "works": {
            "team": WorkTeamInsightGenerator,
            "lead": WorkLeadInsightGenerator,
            "staff": WorkStaffInsightGenerator,
            "ministry": WorkMinistryInsightGenerator,
            "federal_involvement": WorkFederalInvolvementInsightGenerator,
            "first_nation": WorkFirstNationInsightGenerator,
            "type": WorkByTypeInsightGenerator,
            "assessment_by_phase": AssessmentWorksByPhaseInsightGenerator,
        },
        "projects": {
            "region": ProjectByRegionInsightGenerator,
            "type": ProjectByTypeInsightGenerator,
            "subtype": ProjectBySubTypeInsightGenerator,
        }
    }

    return insight_generator_classes[resource][group_by]
