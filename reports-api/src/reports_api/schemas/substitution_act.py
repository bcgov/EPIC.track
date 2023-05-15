"""Ministry model schema"""
from marshmallow import EXCLUDE

from reports_api.models import SubstitutionAct
from reports_api.models.db import ma


class SubstitutionActSchema(
    ma.SQLAlchemyAutoSchema
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """SubstitutionAct model schema class"""

    class Meta:
        """Meta information"""

        model = SubstitutionAct
        include_fk = True
        unknown = EXCLUDE
