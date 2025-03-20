"""Staleness Settings Role response schema"""
from marshmallow import EXCLUDE, fields

from api.schemas.base import AutoSchemaBase
from api.models.staleness_settings import StalenessSettings


class StalenessSettingsResponseSchema(
    AutoSchemaBase
): # pylint: disable=too-many-ancestors,too-few-public-methods
    """Staleness Settings response schema"""

    class Meta(AutoSchemaBase.Meta):
        """Meta information"""

        model = StalenessSettings
        include_fk = True
        unknown = EXCLUDE

    staleness_type = fields.Method("get_staleness_type")

    def get_staleness_type(self, obj: StalenessSettings) -> str:
        """Return the staleness type"""
        return obj.staleness_type if isinstance(obj.staleness_type, str) else obj.staleness_type.value
