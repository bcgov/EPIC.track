"""Phase model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import PhaseCode
from reports_api.schemas.base import AutoSchemaBase
from reports_api.schemas.ea_act import EAActSchema
from reports_api.schemas.work_type import WorkTypeSchema


class PhaseResponseSchema(
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
