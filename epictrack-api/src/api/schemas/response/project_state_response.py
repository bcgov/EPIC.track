"""Project State model schema"""
from marshmallow import EXCLUDE

from api.models import ProjectState
from api.schemas.base import AutoSchemaBase


class ProjectStateResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Project State model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = ProjectState
        include_fk = True
        unknown = EXCLUDE
