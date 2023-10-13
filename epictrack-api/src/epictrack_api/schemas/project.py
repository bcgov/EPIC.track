"""Project model schema"""
from marshmallow import EXCLUDE, fields

from epictrack_api.models import Project
from epictrack_api.schemas.base import AutoSchemaBase
from epictrack_api.schemas.proponent import ProponentSchema
from epictrack_api.schemas.region import RegionSchema
from epictrack_api.schemas.types import SubTypeSchema, TypeSchema


class ProjectSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Project model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Project
        include_fk = True
        unknown = EXCLUDE

    sub_type = fields.Nested(SubTypeSchema, dump_only=True, exclude=("type", "type_id"))
    type = fields.Nested(TypeSchema, dump_only=True)
    proponent = fields.Nested(ProponentSchema, dump_only=True, exclude=("relationship_holder",))
    region_env = fields.Nested(RegionSchema, dump_only=True)
    region_flnro = fields.Nested(RegionSchema, dump_only=True)
