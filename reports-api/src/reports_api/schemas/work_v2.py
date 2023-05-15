"""Work model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Work, WorkPhase
from reports_api.models.db import ma
from reports_api.schemas.ea_act import EAActSchema
from reports_api.schemas.eao_team import EAOTeamSchema
from reports_api.schemas.federal_involvement import FederalInvolvementSchema
from reports_api.schemas.ministry import MinistrySchema
from reports_api.schemas.phase import PhaseSchema
from reports_api.schemas.project import ProjectSchema
from reports_api.schemas.staff import StaffSchema
from reports_api.schemas.substitution_act import SubstitutionActSchema
from reports_api.schemas.work_type import WorkTypeSchema


class WorkSchemaV2(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work model schema class"""

    class Meta:
        """Meta information"""

        model = Work
        include_fk = True
        unknown = EXCLUDE

    project = fields.Nested(
        ProjectSchema(exclude=("region_env", "region_flnro", "sub_type")),
        dump_only=True,
    )
    ministry = fields.Nested(MinistrySchema, dump_only=True)
    eao_team = fields.Nested(EAOTeamSchema, dump_only=True)
    ea_act = fields.Nested(EAActSchema, dump_only=True)
    federal_involvement = fields.Nested(FederalInvolvementSchema, dump_only=True)
    responsible_epd = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_lead = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_type = fields.Nested(WorkTypeSchema, dump_only=True)
    current_phase = fields.Nested(
        PhaseSchema, exclude=("milestones", "ea_act", "work_type"), dump_only=True
    )
    substitution_act = fields.Nested(SubstitutionActSchema, dump_only=True)
    eac_decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)


class WorkPhaseSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work phase model schema class"""

    class Meta:
        """Meta information"""

        model = WorkPhase
        include_fk = True
        unknown = EXCLUDE
