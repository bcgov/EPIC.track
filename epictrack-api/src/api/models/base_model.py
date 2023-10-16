# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Super class to handle all operations related to base model."""
from sqlalchemy import Boolean, Column, DateTime, String, asc
from api.models.history import Versioned

from api.utils.utcnow import utcnow

from .db import db


class BaseModel(db.Model):
    """This class manages all of the base model functions."""

    __abstract__ = True

    created_by = Column(String(255), default=None, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=utcnow())
    updated_by = Column(String(255), default=None, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=utcnow())
    is_active = Column(Boolean, default=True, server_default='t', nullable=False)
    is_deleted = Column(Boolean, default=False, server_default='f', nullable=False)

    @staticmethod
    def commit():
        """Commit the session."""
        db.session.commit()

    def flush(self):
        """Save and flush."""
        db.session.add(self)
        db.session.flush()
        return self

    def save(self):
        """Save and commit."""
        db.session.add(self)
        db.session.commit()
        return self

    @staticmethod
    def rollback():
        """RollBack."""
        db.session.rollback()

    @classmethod
    def find_by_id(cls, identifier: int):
        """Return model by id."""
        return cls.query.get(identifier)

    @classmethod
    def find_all(cls, default_filters=True):
        """Return all entries."""
        query = {}
        if default_filters and hasattr(cls, 'is_active'):
            query['is_active'] = True
        if hasattr(cls, 'is_deleted'):
            query['is_deleted'] = False
        rows = cls.query.filter_by(**query).all()  # pylint: disable=no-member
        return rows

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
        rows = cls.query.filter_by(**query).order_by(asc("id")).all()
        return rows

    def update(self, payload: dict, commit=True):
        """Update and commit."""
        for key, value in payload.items():
            if key != "id":
                setattr(self, key, value)
        if commit:
            self.commit()
        return self

    def delete(self):
        """Delete and commit."""
        db.session.delete(self)
        db.session.commit()

    def as_dict(self, recursive=True):
        """Return JSON Representation."""
        mapper = self.__mapper__
        columns = mapper.columns
        result = {c: getattr(self, c) for c in dict(columns).keys()}
        if recursive:
            for rel in mapper.relationships:
                relationship = rel.key
                relational_data = getattr(self, relationship, None)
                result[relationship] = relational_data.as_dict() if relational_data else None
        return result


class BaseModelVersioned(Versioned, BaseModel):
    """This class creates a history table to track changes."""

    __abstract__ = True
