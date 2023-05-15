"""Project model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import Project
from reports_api.models.db import ma
from reports_api.schemas.region import RegionSchema
from reports_api.schemas.types import SubTypeSchema
from reports_api.schemas.proponent import ProponentSchema


class ProjectSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Project model schema class"""

    class Meta:
        """Meta information"""

        model = Project
        include_fk = True
        unknown = EXCLUDE

    sub_type = fields.Nested(SubTypeSchema, dump_only=True)
    proponent = fields.Nested(ProponentSchema, dump_only=True)
    region_env = fields.Nested(RegionSchema, dump_only=True)
    region_flnro = fields.Nested(RegionSchema, dump_only=True)
