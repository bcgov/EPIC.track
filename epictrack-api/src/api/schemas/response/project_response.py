"""Project model schema"""
from flask_marshmallow import Schema
from marshmallow import EXCLUDE, fields

from api.models import Project
from api.schemas.base import AutoSchemaBase
from api.schemas.proponent import ProponentSchema
from api.schemas.region import RegionSchema
from api.schemas.types import SubTypeSchema, TypeSchema
from .list_type_response import ListTypeResponseSchema
from .project_state_response import ProjectStateResponseSchema


class ProjectResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Project model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Project
        include_fk = True
        unknown = EXCLUDE
        exclude = ("created_by", "updated_at", "updated_by", "is_deleted")

    sub_type = fields.Nested(SubTypeSchema, dump_only=True, exclude=("type", "type_id"))
    type = fields.Nested(TypeSchema, dump_only=True)
    proponent = fields.Nested(ProponentSchema, dump_only=True, exclude=("relationship_holder",))
    region_env = fields.Nested(RegionSchema, dump_only=True)
    region_flnro = fields.Nested(RegionSchema, dump_only=True)
    project_state = fields.Nested(ProjectStateResponseSchema)


class ProjectSummaryResponseSchema(Schema):
    """An active project, without the internal fields the full project response carries"""

    id = fields.Int(metadata={"description": "The id of the project."})
    name = fields.Str(metadata={"description": "Name of the project."})
    description = fields.Str(metadata={"description": "Description of the project."})
    latitude = fields.Str(metadata={"description": "Latitude of the project, as free text."})
    longitude = fields.Str(metadata={"description": "Longitude of the project, as free text."})
    ea_certificate = fields.Str(
        metadata={"description": "EA certificate number, or the status recorded in its place."}
    )
    epic_guid = fields.Str(metadata={"description": "The id of the project on the EPIC public site."})
    type = fields.Nested(ListTypeResponseSchema, metadata={"description": "Type of the project."})
    proponent = fields.Nested(ListTypeResponseSchema, metadata={"description": "Proponent of the project."})
    region_env = fields.Nested(ListTypeResponseSchema, metadata={"description": "ENV region of the project."})
    has_works_in_progress = fields.Bool(
        metadata={"description": "Whether any of the project's works is in progress, active or not."}
    )


class ProjectTeamMemberSchema(Schema):
    """A staff member holding at least one role on a project's works"""

    staff_id = fields.Int(metadata={"description": "The id of the staff member."})
    idir_user_id = fields.Str(metadata={"description": "The IDIR GUID of the staff member."})
    email = fields.Str(metadata={"description": "Email address of the staff member."})
    roles = fields.List(
        fields.Str(), metadata={"description": "Distinct role names held across the project's works."}
    )
    work_ids = fields.List(
        fields.Int(), metadata={"description": "Ids of the works the staff member is assigned to."}
    )


class ProjectTeamResponseSchema(Schema):
    """Team members of a single project"""

    project_id = fields.Int(metadata={"description": "The id of the project."})
    staff = fields.List(fields.Nested(ProjectTeamMemberSchema))
