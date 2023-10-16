"""SubstitutionAct model schema"""
from marshmallow import EXCLUDE

from api.models import SubstitutionAct
from api.schemas.base import AutoSchemaBase


class SubstitutionActSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """SubstitutionAct model schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = SubstitutionAct
        include_fk = True
        unknown = EXCLUDE
