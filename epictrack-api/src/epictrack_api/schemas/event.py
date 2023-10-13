"""Event model schema"""
from marshmallow import EXCLUDE

from epictrack_api.models import Event
from epictrack_api.schemas.base import AutoSchemaBase


class EventSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Event schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = Event
        include_fk = True
        unknown = EXCLUDE
