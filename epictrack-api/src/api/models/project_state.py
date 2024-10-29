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
"""Model to manage Project State."""
import enum
from sqlalchemy import Column, Integer, String, Enum, or_, any_
from sqlalchemy.dialects.postgresql import ARRAY
from .base_model import BaseModelVersioned


class ProjectStateComponentEnum(enum.Enum):
    """Enum for project state component"""

    COMPLIANCE = "COMPLIANCE"
    TRACK = "TRACK"
    SUBMIT = "SUBMIT"


class ProjectState(BaseModelVersioned):
    """ProjectState."""

    __tablename__ = "project_states"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(), nullable=False)
    component = Column(
        ARRAY(Enum("COMPLIANCE", "TRACK", "SUBMIT", name="projectstatecomponentenum")),
        nullable=False,
    )
    sort_order = Column(Integer, nullable=False)

    @classmethod
    def find_by_components(cls, components: [str]):
        """Get project states by component"""
        return cls.query.filter(
            or_(*(comp == any_(cls.component) for comp in components))
        ).all()
