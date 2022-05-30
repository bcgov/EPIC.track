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
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declared_attr


class CodeTable():  # pylint: disable=too-few-public-methods
    """This class provides base methods for Code Table."""

    id = Column(Integer(), primary_key=True, autoincrement=True)
    name = Column(String(250))

    @declared_attr
    def id(cls):  # pylint:disable=no-self-argument,function-redefined # noqa: N805
        """Return code."""
        return Column(Integer)

    @declared_attr
    def name(cls):  # pylint:disable=no-self-argument,function-redefined # noqa: N805
        """Return code name."""
        return Column(String)

    @classmethod
    def find_by_id(cls, _id):
        """Given a id, this will return code master details."""
        code_table = cls.query.filter_by(id=_id).one_or_none()  # pylint: disable=no-member
        return code_table

    @classmethod
    def find_all(cls):
        """Return all of the code master details."""
        codes = cls.query.all()  # pylint: disable=no-member
        return codes

    def as_dict(self):
        """Return Json representation."""
        return {
            'id': self.id,
            'name': self.name
        }
