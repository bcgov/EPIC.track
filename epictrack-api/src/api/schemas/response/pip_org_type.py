"""PIP Organization Type model schema"""
from marshmallow import EXCLUDE, ValidationError, fields, validate, validates

from api.models import PIPOrgType
from api.schemas.base import AutoSchemaBase


class PIPOrgTypeSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staff model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = PIPOrgType
        include_fk = True
        unknown = EXCLUDE