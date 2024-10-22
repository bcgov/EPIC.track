"""ActSection model schema"""
from marshmallow import EXCLUDE

from api.models import ActSection
from api.schemas.base import AutoSchemaBase


class ActSectionResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Type model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = ActSection
        unknown = EXCLUDE
