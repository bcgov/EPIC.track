"""Phase model schema"""
from marshmallow import EXCLUDE, fields

from api.models import PhaseCode
from api.schemas.base import AutoSchemaBase
from api.schemas.ea_act import EAActSchema
from api.schemas.work_type import WorkTypeSchema


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
