"""Phase model schema"""
from marshmallow import EXCLUDE, fields

from reports_api.models import OutcomeTemplate
from reports_api.schemas.base import AutoSchemaBase
from reports_api.schemas.response.event_template_response import EventTemplateResponseSchema


class OutcomeResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """PhaseCode model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = OutcomeTemplate
        include_fk = True
        unknown = EXCLUDE

    ea_act = fields.Nested(EventTemplateResponseSchema, dump_only=True)
