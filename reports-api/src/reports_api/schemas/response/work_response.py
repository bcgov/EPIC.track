"""Work model schema"""
from datetime import datetime

from flask_marshmallow import Schema
from marshmallow import EXCLUDE, fields, pre_dump

from reports_api.models import Staff, Work, WorkPhase
from reports_api.schemas import PositionSchema, RoleSchema
from reports_api.schemas.base import AutoSchemaBase
from reports_api.schemas.ea_act import EAActSchema
from reports_api.schemas.eao_team import EAOTeamSchema
from reports_api.schemas.federal_involvement import FederalInvolvementSchema
from reports_api.schemas.ministry import MinistrySchema
from reports_api.schemas.phase import PhaseSchema
from reports_api.schemas.project import ProjectSchema
from reports_api.schemas.response.staff_response import StaffResponseSchema
from reports_api.schemas.staff import StaffSchema
from reports_api.schemas.substitution_act import SubstitutionActSchema
from reports_api.schemas.work_type import WorkTypeSchema
from reports_api.services.event import EventService


class WorkResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work model schema class"""

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
    current_phase = fields.Nested(
        PhaseSchema, exclude=("ea_act", "work_type"), dump_only=True
    )
    substitution_act = fields.Nested(SubstitutionActSchema, dump_only=True)
    eac_decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)


class WorkPhaseResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work phase model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkPhase
        include_fk = True
        unknown = EXCLUDE


class WorkStaffRoleReponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Schema for allocated staff for work"""

    class Meta(
        AutoSchemaBase.Meta
    ):  # pylint: disable=too-many-ancestors,too-few-public-methods
        """Meta information"""

        model = Staff
        include_fk = True
        unknown = EXCLUDE

    full_name = fields.Method("get_full_name", dump_only=True)
    position = fields.Nested(PositionSchema(), dump_only=True)

    def get_full_name(self, instance):
        """Get the full name"""
        return f"{instance['last_name']}, {instance['first_name']}"

    role = fields.Nested(RoleSchema)

    @pre_dump()
    def convert(self, instance, many):  # pylint: disable=unused-argument
        """Convert the incoming object in to json"""
        staff = StaffResponseSchema().dump(instance.Staff)
        if staff:
            staff["role"] = instance.Role
        return staff


class WorkResourceResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Schema for work"""

    class Meta(
        AutoSchemaBase.Meta
    ):  # pylint: disable=too-many-ancestors,too-few-public-methods
        """Meta information"""

        model = Work
        include_fk = False
        unknown = EXCLUDE

    project = fields.Nested(ProjectSchema(only=("id", "name")))
    eao_team = fields.Nested(EAOTeamSchema, dump_only=True)
    responsible_epd = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_lead = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    staff = fields.Nested(WorkStaffRoleReponseSchema(many=True), dump_default=[])


class WorkPhaseSkeletonResponseSchema(Schema):
    """Schema for work phase skeleton details"""

    phase = fields.Method("get_phase_name")
    phase_id = fields.Method("get_phase_id")
    start_date = fields.Method("get_start_date")
    end_date = fields.Method("get_end_date")
    next_milestone = fields.Method("get_next_milestone")
    milestone_progress = fields.Method("get_milestone_progress")

    def get_phase_name(self, instance: WorkPhase) -> str:
        """Returns the phase name"""
        return instance.phase.name

    def get_phase_id(self, instance: WorkPhase) -> int:
        """Returns the phase's id"""
        return instance.phase_id

    def get_start_date(self, instance: WorkPhase) -> datetime:
        """Returns the phase start date"""
        return instance.start_date

    def get_end_date(self, instance: WorkPhase) -> datetime:
        """Returns the phase end date"""
        return instance.end_date

    def get_next_milestone(self, instance: WorkPhase) -> str:
        """Returns the next milestone event name"""
        event = EventService.find_next_milestone_event_by_work_id(instance.work_id)
        return event.name

    def get_milestone_progress(self, instance: WorkPhase) -> float:
        """Returns the percentage of milestones completed"""
        return EventService.find_milestone_progress_by_work_id(instance.work_id)


class WorkPhaseTemplateAvailableResponse(Schema):
    """Schema for work phase template available response"""

    template_available = fields.Boolean(
        metadata={"description": "Is template available"},
        required=True
    )
    task_added = fields.Boolean(
        metadata={"description": "Is task added already"},
        required=True
    )
