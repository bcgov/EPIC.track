"""Project model schema"""
from marshmallow import EXCLUDE, fields

from api.models import Project
from api.schemas.base import AutoSchemaBase
from api.schemas.proponent import ProponentSchema
from api.schemas.region import RegionSchema
from api.schemas.types import SubTypeSchema, TypeSchema
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
