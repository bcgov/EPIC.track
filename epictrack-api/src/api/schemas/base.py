"""Representation of a base schema"""
from api.models.db import ma


class AutoSchemaBase(ma.SQLAlchemyAutoSchema):  # pylint: disable=too-many-ancestors
    """Representation of a base SQL alchemy auto schema with basic functions"""

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta information applicable to all schemas"""

        exclude = ("created_at", "created_by", "updated_at", "updated_by", "is_deleted")
        # abstract=True
