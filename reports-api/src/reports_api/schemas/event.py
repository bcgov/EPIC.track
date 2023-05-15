"""Event model schema"""
from marshmallow import EXCLUDE

from reports_api.models import Event
from reports_api.models.db import ma


class EventSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Event schema class"""

    class Meta:
        """Meta information"""

        model = Event
        include_fk = True
        unknown = EXCLUDE
