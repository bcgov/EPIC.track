"""Representation of a base schema"""
from dataclasses import dataclass, fields
from datetime import datetime

from api.models.db import ma


@dataclass
class BaseSchema(object):  # pylint: disable=useless-object-inheritance
    """Representation of a schema with basic functions"""

    def __init__(self, **kwargs: dict):
        """Create a valid Schema."""
        schema_fields = set(fields(self))
        for field in schema_fields:
            value = kwargs.get(field.name, None)
            if value is not None:
                if field.type == datetime and not isinstance(value, datetime):
                    value = datetime.strptime(
                        value, self.dateformat  # pylint: disable=no-member
                    )
                setattr(self, field.name, value)


class AutoSchemaBase(ma.SQLAlchemyAutoSchema):  # pylint: disable=too-many-ancestors
    """Representation of a base SQL alchemy auto schema with basic functions"""

    class Meta:  # pylint: disable=too-few-public-methods
        """Meta information applicable to all schemas"""

        exclude = ("created_at", "created_by", "updated_at", "updated_by", "is_deleted")
        # abstract=True
