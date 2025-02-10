# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Model to manage Special fields."""
import enum

from sqlalchemy import Column, Enum, Index, Integer, String
from sqlalchemy.dialects.postgresql import TSTZRANGE

from .base_model import BaseModelVersioned


class FieldTypeEnum(enum.Enum):
    """Enum for field types"""

    STRING = "STRING"
    INTEGER = "INTEGER"
    BOOLEAN = "BOOLEAN"


class EntityEnum(enum.Enum):
    """Enum for enities"""

    PROJECT = "PROJECT"
    PROPONENT = "PROPONENT"
    WORK = "WORK"
    ISSUE = "ISSUE"


class SpecialField(BaseModelVersioned):
    """Model class for tracking special field values."""

    __tablename__ = "special_fields"

    id = Column(Integer, primary_key=True, autoincrement=True)
    entity = Column(Enum(EntityEnum), nullable=False)
    entity_id = Column(Integer, nullable=False)
    field_name = Column(String(100), nullable=False)
    field_value = Column(String, nullable=False)
    field_type = Column(Enum(FieldTypeEnum), default=FieldTypeEnum.STRING.value)
    time_range = Column(TSTZRANGE, nullable=False)

    __table_args__ = (Index('entity_field_index', "entity", "entity_id", "field_name", "time_range"), )

    @classmethod
    def find_by_params(cls, params: dict, default_filters=True):
        """Returns based on the params"""
        query = {}
        for key, value in params.items():
            query[key] = value
        if default_filters and hasattr(cls, 'is_active'):
            query['is_active'] = True
        if hasattr(cls, 'is_deleted'):
            query['is_deleted'] = False
        rows = cls.query.filter_by(**query).order_by(SpecialField.time_range.desc()).all()

        return rows
