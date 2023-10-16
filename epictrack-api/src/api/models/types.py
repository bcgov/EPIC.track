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
"""Model to handle all operations related to Types."""

from sqlalchemy import Column, Integer, String

from .code_table import CodeTableVersioned
from .db import db


class Type(db.Model, CodeTableVersioned):
    """Model class for Types."""

    __tablename__ = 'types'

    id = Column(Integer, primary_key=True, autoincrement=True)
    short_name = Column(String())
    sort_order = Column(Integer, nullable=False)

    def as_dict(self):
        """Return JSON Representation."""
        result = CodeTableVersioned.as_dict(self)
        result['short_name'] = self.short_name
        return result
