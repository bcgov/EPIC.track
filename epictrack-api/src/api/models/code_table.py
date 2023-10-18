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
"""Base class for code model."""
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from api.models.history import Versioned

from api.utils.utcnow import utcnow

from .db import db


class CodeTable():  # pylint: disable=too-few-public-methods
    """This class provides base methods for Code Table."""

    id = Column(Integer(), primary_key=True, autoincrement=True)
    name = Column(String(250))

    created_by = Column(String(255), default=None, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=utcnow())
    updated_by = Column(String(255), default=None, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=utcnow())
    is_active = Column(Boolean, default=True, server_default='t', nullable=False)
    is_deleted = Column(Boolean, default=False, server_default='f', nullable=False)

    # @declared_attr
    # def id(cls):  # pylint:disable=no-self-argument,function-redefined # noqa: N805
    #     """Return code."""
    #     return Column(Integer)

    # @declared_attr
    # def name(cls):  # pylint:disable=no-self-argument,function-redefined # noqa: N805
    #     """Return code name."""
    #     return Column(String)

    @classmethod
    def find_by_id(cls, _id):
        """Given a id, this will return code master details."""
        code_table = cls.query.filter_by(id=_id).one_or_none()  # pylint: disable=no-member
        return code_table

    @classmethod
    def find_all(cls, default_filters=True):
        """Return all of the code master details."""
        query = {}
        if default_filters and hasattr(cls, 'is_active'):
            query['is_active'] = True
        if hasattr(cls, 'is_deleted'):
            query['is_deleted'] = False
        if hasattr(cls, 'sort_order'):
            codes = cls.query.filter_by(**query).order_by(cls.sort_order).all()  # pylint: disable=no-member
        else:
            codes = cls.query.filter_by(**query).order_by(cls.id).all()  # pylint: disable=no-member
        return codes

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
        rows = cls.query.filter_by(**query).all()  # pylint: disable=no-member
        return rows

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

    def update(self, payload: dict, commit=True):
        """Update and commit."""
        for key, value in payload.items():
            if hasattr(self, key):
                setattr(self, key, value)
        if commit:
            self.commit()
        return self

    def delete(self):
        """Delete and commit."""
        db.session.delete(self)
        db.session.commit()

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name
        }


class CodeTableVersioned(Versioned, CodeTable):
    """This class creates history tables."""
