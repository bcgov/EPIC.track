"""Work model schema"""
from marshmallow import EXCLUDE, fields

from api.models import Work, WorkPhase
from api.schemas.base import AutoSchemaBase
from api.schemas.ea_act import EAActSchema
from api.schemas.eao_team import EAOTeamSchema
from api.schemas.federal_involvement import FederalInvolvementSchema
from api.schemas.ministry import MinistrySchema
from api.schemas.project import ProjectSchema
from api.schemas.staff import StaffSchema
from api.schemas.substitution_act import SubstitutionActSchema
from api.schemas.work_type import WorkTypeSchema


class WorkPhaseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work phase model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkPhase
        include_fk = True
        unknown = EXCLUDE


class WorkSchemaV2(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods, duplicate-code
    """Work model schema class"""

    # TODO: DEPRECATED. TO BE REMOVED

    class Meta(AutoSchemaBase.Meta):
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
    current_work_phase = fields.Nested(
        WorkPhaseSchema, exclude=("milestones", "ea_act", "work_type"), dump_only=True
    )
    substitution_act = fields.Nested(SubstitutionActSchema, dump_only=True)
    eac_decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
