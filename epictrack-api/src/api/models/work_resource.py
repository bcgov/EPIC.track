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
"""Model to manage work resources."""

from sqlalchemy import Column, Integer, String, Text, ForeignKey
from .base_model import BaseModelVersioned


class WorkResource(BaseModelVersioned):
    """Model class for work specific resources."""

    __tablename__ = "work_resources"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(), nullable=False)
    link = Column(Text, nullable=False)

    work_id = Column(ForeignKey("works.id"), nullable=False)
