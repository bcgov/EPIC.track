"""Indigenous nation model schema"""
from marshmallow import EXCLUDE, fields

from api.models import IndigenousNation, IndigenousConsultationLevel
from api.models.indigenous_work import IndigenousWork
from api.schemas.base import AutoSchemaBase
from api.schemas.response.pip_org_type import PIPOrgTypeSchema
from api.schemas.staff import StaffSchema


class IndigenousResponseNationSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Indigenous nation schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = IndigenousNation
        include_fk = True
        unknown = EXCLUDE

    relationship_holder = fields.Nested(
        StaffSchema, dump_only=True, exclude=("position",)
    )

    pip_org_type = fields.Nested(
        PIPOrgTypeSchema, dump_only=True
    )


class IndigenousNationConsultationResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work indigenous nation consultation level schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = IndigenousConsultationLevel
        include_fk = True
        unknown = EXCLUDE


class WorkIndigenousNationResponseSchema(
    AutoSchemaBase
):  # pylint: disable=too-many-ancestors,too-few-public-methods
    """Work indigenous nation schema class"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = IndigenousWork
        include_fk = True
        unknown = EXCLUDE

    indigenous_nation = fields.Nested(IndigenousResponseNationSchema, dump_only=True)
    indigenous_consultation_level = fields.Nested(IndigenousNationConsultationResponseSchema, dump_only=True)
