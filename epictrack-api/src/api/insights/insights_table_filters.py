"""Generate filters from front end for insights"""
from operator import and_
from typing import List, Dict, Any

# Import your models
from api.models.work import Work
from api.models.project import Project
from api.models.work_type import WorkType
from api.models.work_phase import WorkPhase
from api.models.eao_team import EAOTeam
from api.models.staff import Staff
from api.models.ministry import Ministry
from api.models.indigenous_nation import IndigenousNation
from api.models.federal_involvement import FederalInvolvement
from api.models.types import Type
from api.models.sub_types import SubType
from api.models.proponent import Proponent
from api.models.region import Region
from sqlalchemy import extract


def build_insights_filters(filters: List[Dict[str, Any]]) -> List[Any]:
    """
    Adds filter expressions for WorkInsights queries based on front end filters from table.

    Example filter:
    [
        {"id": "title", "value": "Mine"},
        {"id": "project.name", "value": ["Angus", "Ajax Mine"]},
        {"id": "work_type.name", "value": ["Assessment"]},
        {"id": "current_work_phase.name", "value": ["Initial Contact"]}
    ]
    """
    filter_exprs = []
    for f in filters:
        filter_id = f.get('id')
        value = f.get('value')
        if filter_id == "title" and value:
            filter_exprs.append(Work.title.ilike(f"%{value}%"))
        elif filter_id == "project.name" and value:
            filter_exprs.append(Work.project.has(Project.name.in_(value)))
        elif filter_id == "work_type.name" and value:
            filter_exprs.append(Work.work_type.has(WorkType.name.in_(value)))
        elif filter_id == "current_work_phase.name" and value:
            filter_exprs.append(Work.current_work_phase.has(WorkPhase.name.in_(value)))
        elif filter_id == "eao_team.name" and value:
            filter_exprs.append(Work.eao_team.has(EAOTeam.name.in_(value)))
        elif filter_id == "work_lead.full_name" and value:
            filter_exprs.append(Work.work_lead.has(Staff.full_name.in_(value)))
        elif filter_id == "staff" and value:
            filter_exprs.append(Staff.full_name.ilike(f"%{value}%"))
        elif filter_id == "ministry.name" and value:
            filter_exprs.append(Work.ministry.has(Ministry.name.in_(value)))
        elif filter_id == "federal_involvement.name" and value:
            filter_exprs.append(Work.federal_involvement.has(FederalInvolvement.name.in_(value)))
        elif filter_id == "indigenous_works.name" and value:
            filter_exprs.append(Work.indigenous_works.any(IndigenousNation.name.in_(value)))
        elif filter_id == "start_date" and value:
            filter_exprs.append(extract('year', Work.start_date).in_(value))
        elif filter_id == "work_decision_date" and value:
            filter_exprs.append(extract('year', Work.work_decision_date).in_(value))
        elif filter_id == "work_state" and value:
            filter_exprs.append(Work.work_state.in_(value))
        elif filter_id == "type.name" and value:
            filter_exprs.append(Project.type.has(Type.name.in_(value)))
        elif filter_id == "sub_type.name" and value:
            filter_exprs.append(Project.sub_type.has(SubType.name.in_(value)))
        elif filter_id == "proponent.name" and value:
            filter_exprs.append(Project.proponent.has(Proponent.name.in_(value)))
        elif filter_id == "Region ENV" and value:
            filter_exprs.append(Project.region_env.has(and_(Region.name.in_(value), Region.entity == 'ENV')))
        elif filter_id == "Region NRS" and value:
            filter_exprs.append(Project.region_flnro.has(and_(Region.name.in_(value), Region.entity == 'FLNR')))
        elif filter_id == "name" and value:
            filter_exprs.append(Project.name.ilike(f"%{value}%"))
    return filter_exprs
