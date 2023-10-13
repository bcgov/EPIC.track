"""Phase model schema"""
from marshmallow import EXCLUDE, fields

from epictrack_api.models import PhaseCode
from epictrack_api.schemas.base import AutoSchemaBase
from epictrack_api.schemas.ea_act import EAActSchema
from epictrack_api.schemas.work_type import WorkTypeSchema


class PhaseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """PhaseCode model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = PhaseCode
        include_fk = True
        unknown = EXCLUDE

    ea_act = fields.Nested(EAActSchema, dump_only=True)
    work_type = fields.Nested(WorkTypeSchema, dump_only=True)
