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

from .db import db


class BaseModel(db.Model):
    """This class manages all of the base model functions."""

    __abstract__ = True

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
    def find_all(cls):
        """Return all entries."""
        rows = cls.query.all()  # pylint: disable=no-member
        return rows

    def update(self, payload: dict):
        """Update and commit."""
        for key, value in payload.items():
            setattr(self, key, value)
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
