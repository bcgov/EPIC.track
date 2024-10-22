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
"""Model to handle all operations related to Region."""

from sqlalchemy import Column, Integer, String

from .code_table import CodeTableVersioned
from .db import db


class Region(db.Model, CodeTableVersioned):
    """Model class for Region."""

    __tablename__ = 'regions'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    entity = Column(String())
    sort_order = Column(Integer, nullable=False)

    @classmethod
    def find_all_by_region_type(cls, region_type: str):
        """Find all regions by region type."""
        return cls.query.filter_by(entity=region_type).all()

    def as_dict(self):
        """Return Json representation."""
        result = CodeTableVersioned.as_dict(self)
        result['entity'] = self.entity
        return result
