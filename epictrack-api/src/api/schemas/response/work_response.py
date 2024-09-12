"""Work model schema"""
from flask_marshmallow import Schema
from marshmallow import EXCLUDE, fields, pre_dump

from api.models import Staff, Work, WorkIssues, WorkIssueUpdates, WorkPhase, WorkStatus
from api.schemas import PositionSchema, RoleSchema
from api.schemas.base import AutoSchemaBase
from api.schemas.ea_act import EAActSchema
from api.schemas.eao_team import EAOTeamSchema
from api.schemas.federal_involvement import FederalInvolvementSchema
from api.schemas.ministry import MinistrySchema
from api.schemas.response.phase_response import PhaseResponseSchema
from api.schemas.response.project_response import ProjectResponseSchema
from api.schemas.response.staff_response import StaffResponseSchema
from api.schemas.staff import StaffSchema
from api.schemas.substitution_act import SubstitutionActSchema
from api.schemas.work_type import WorkTypeSchema


class WorkPhaseResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work phase model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkPhase
        include_fk = True
        unknown = EXCLUDE

    phase = fields.Nested(PhaseResponseSchema)

    visibility = fields.Method("get_visibility")

    def get_visibility(self, obj: WorkPhase) -> str:
        """Return value for the visibility"""
        return obj.visibility if isinstance(obj.visibility, str) else obj.visibility.value


class IndigenousWorkResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Indigenous Work model schema class"""

    class Meta:
        """Meta information"""

        fields = ['id', 'name']

    name = fields.Method("get_name")

    def get_name(self, obj: WorkPhase) -> str:
        """Return the name of the indigenous nation"""
        return obj.indigenous_nation.name if obj.indigenous_nation else ""


class WorkResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Work
        include_fk = True
        unknown = EXCLUDE
        exclude = ("created_by", "updated_at", "updated_by", "is_deleted")

    project = fields.Nested(
        ProjectResponseSchema(exclude=("created_by", "updated_at", "updated_by", "is_deleted")), dump_only=True)
    ministry = fields.Nested(MinistrySchema, dump_only=True)
    eao_team = fields.Nested(EAOTeamSchema, dump_only=True)
    ea_act = fields.Nested(EAActSchema, dump_only=True)
    federal_involvement = fields.Nested(FederalInvolvementSchema, dump_only=True)
    responsible_epd = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_lead = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_type = fields.Nested(WorkTypeSchema, dump_only=True)
    current_work_phase = fields.Nested(
        WorkPhaseResponseSchema, dump_only=True
    )
    substitution_act = fields.Nested(SubstitutionActSchema, dump_only=True)
    eac_decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    decision_by = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_state = fields.Method("get_work_state")
    indigenous_works = fields.List(fields.Nested(IndigenousWorkResponseSchema, dump_only=True))
    anticipated_referral_date = fields.Method("get_anticipated_referral_date")
    title = fields.Method("get_title")

    def get_work_state(self, obj: Work) -> str:
        """Return the work state"""
        return obj.work_state.value if obj.work_state else None

    def get_title(self, obj: Work) -> str:
        """Return the title"""
        return obj.title

    def get_anticipated_referral_date(self, obj) -> str:
        """Return the referral date"""
        return obj.anticipated_referral_date if obj.anticipated_referral_date else None


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

    project = fields.Nested(ProjectResponseSchema(only=("id", "name")))
    eao_team = fields.Nested(EAOTeamSchema, dump_only=True)
    responsible_epd = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    work_lead = fields.Nested(StaffSchema, exclude=("position",), dump_only=True)
    staff = fields.Nested(WorkStaffRoleReponseSchema(many=True), dump_default=[])
    title = fields.Str()


class WorkPhaseByIdResponseSchema(Schema):
    """Schema for additional work phase details"""

    work_phase = fields.Nested(WorkPhaseResponseSchema, dump_only=True)


class WorkPhaseAdditionalInfoResponseSchema(Schema):
    """Schema for additional work phase details"""

    work_phase = fields.Nested(WorkPhaseResponseSchema, dump_only=True)
    total_number_of_days = fields.Number(
        metadata={"description": "Total number of days in the phase"}, required=True
    )
    current_milestone = fields.Str(metadata={"description": "Current milestone in the phase"})
    next_milestone = fields.Str(metadata={"description": "Next milestone in the phase"})
    next_milestone_date = fields.DateTime(metadata={"description": "Anticipated date of the next milestone"})
    milestone_progress = fields.Number(metadata={"description": "Milestone progress"})
    decision_milestone = fields.Str(metadata={"description": "Last completed decision milestone in the phase"})
    decision = fields.Str(metadata={"description": "Decision taken in the decision milestone"})
    decision_milestone_date = fields.DateTime(
        metadata={"description": "Actual date of last completed decision milestone in the phase"}
    )
    is_last_phase = fields.Number(metadata={"description": "Indicate if this the last phase of the work"})
    days_left = fields.Number(
        metadata={"description": "Number of days left in the phase"}
    )


class WorkPhaseTemplateAvailableResponse(Schema):
    """Schema for work phase template available response"""

    template_available = fields.Boolean(
        metadata={"description": "Is template available"}, required=True
    )
    task_added = fields.Boolean(
        metadata={"description": "Is task added already"}, required=True
    )


class WorkStatusResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work status model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkStatus
        include_fk = True
        unknown = EXCLUDE


class WorkIssueUpdatesResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work Issues model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkIssueUpdates
        include_fk = True
        unknown = EXCLUDE


class WorkIssuesResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work Issues model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkIssues
        include_fk = True
        unknown = EXCLUDE

    updates = fields.Nested(WorkIssueUpdatesResponseSchema(many=True), dump_default=[])


class WorkIssuesLatestUpdateResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work Issues model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = WorkIssues
        include_fk = True
        unknown = EXCLUDE

    latest_update = fields.Nested(WorkIssueUpdatesResponseSchema(), dump_default=[])
