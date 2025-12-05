"""Generate filters from front end for insights"""
from typing import List, Dict, Any

from api.models.work import Work
from api.models.project import Project
from api.models.work_type import WorkType
from api.models.work_phase import WorkPhase
from api.models.eao_team import EAOTeam
from api.models.staff import Staff
from api.models.ministry import Ministry
from api.models.indigenous_nation import IndigenousNation
from api.models.federal_involvement import FederalInvolvement
from api.models.phase_overage_responsibility import OverageResponsibilityEnum, PhaseOverageResponsibility
from api.models.types import Type
from api.models.sub_types import SubType
from api.models.proponent import Proponent
from api.models.region import Region
from api.models.ea_act import EAAct
from sqlalchemy import extract
from sqlalchemy.sql import exists, and_


# The keys in the filter map correspond to the id values from the front end table filters
work_table_filter_map = {
    "title": lambda v: Work.title.ilike(f"%{v}%"),
    "project.name": lambda v: Work.project.has(Project.name.in_(v)),
    "work_type.name": lambda v: Work.work_type.has(WorkType.name.in_(v)),
    "current_work_phase.name": lambda v: Work.current_work_phase.has(WorkPhase.name.in_(v)),
    "eao_team.name": lambda v: Work.eao_team.has(EAOTeam.name.in_(v)),
    "work_lead.full_name": lambda v: Work.work_lead.has(Staff.full_name.in_(v)),
    "staff": lambda v: Staff.full_name.ilike(f"%{v}%"),
    "ministry.name": lambda v: Work.ministry.has(Ministry.name.in_(v)),
    "federal_involvement.name": lambda v: Work.federal_involvement.has(FederalInvolvement.name.in_(v)),
    "indigenous_works.name": lambda v: Work.indigenous_works.any(IndigenousNation.name.in_(v)),
    "start_date": lambda v: extract('year', Work.start_date).in_(v),
    "work_decision_date": lambda v: extract('year', Work.work_decision_date).in_(v),
    "work_state": Work.work_state.in_,
    "is_active": lambda v: Work.is_active.is_(v[0]),
}

project_table_filter_map = {
    "type.name": lambda v: Project.type.has(Type.name.in_(v)),
    "sub_type.name": lambda v: Project.sub_type.has(SubType.name.in_(v)),
    "proponent.name": lambda v: Project.proponent.has(Proponent.name.in_(v)),
    "Region ENV": lambda v: Project.region_env.has(and_(Region.name.in_(v), Region.entity == 'ENV')),
    "Region NRS": lambda v: Project.region_flnro.has(and_(Region.name.in_(v), Region.entity == 'FLNR')),
    "name": lambda v: Project.name.ilike(f"%{v}%"),
}

phase_table_filter_map = {
    "work_title": lambda v: Work.title.ilike(f"%{v}%"),
    "work_type_name": lambda v: Work.work_type.has(WorkType.name.in_(v)),
    "phase_name": WorkPhase.name.in_,
    "overage_responsibility": lambda v: exists().where(
        and_(
            PhaseOverageResponsibility.work_phase_id == WorkPhase.id,
            PhaseOverageResponsibility.responsibility.in_(v),
            PhaseOverageResponsibility.is_active.is_(True),
            PhaseOverageResponsibility.is_deleted.is_(False),
        )
    ).correlate(WorkPhase),
    "ea_act_name": lambda v: Work.ea_act.has(EAAct.name.in_(v)),
    "work_phase_end_date": lambda v: extract('year', WorkPhase.end_date).in_(v),
}

WORKS = "works"
PROJECTS = "projects"
PHASES = "phases"

filter_maps = {
    WORKS: work_table_filter_map,
    PROJECTS: project_table_filter_map,
    PHASES: phase_table_filter_map,
}


def build_insights_filters(filters: List[Dict[str, Any]], insight_type: str) -> List[Any]:
    """Adds filter expressions for insights queries based on front end filters from table. Selects the appropriate filter map using insight_type ("works", "projects", or "phases")."""
    filter_map = filter_maps.get(insight_type)
    if filter_map is None:
        raise ValueError(f"Unknown insight_type: {insight_type}")
    result = []
    for f in filters:
        filter_id = f.get('id')
        value = f.get('value')

        if filter_id in filter_map and value:
            # Handle enum conversion automatically for overage_responsibility
            if filter_id == "overage_responsibility":
                value = [OverageResponsibilityEnum.from_string(v) for v in value]
            result.append(filter_map[filter_id](value))
    return result
