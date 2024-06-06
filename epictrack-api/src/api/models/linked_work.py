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
"""Model for linked works"""

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship
from .base_model import BaseModel


class LinkedWork(BaseModel):
    """Model for linked works"""

    __tablename__ = "linked_works"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source_work_id = Column(ForeignKey("works.id"), nullable=False)
    linked_work_id = Column(ForeignKey("works.id"), nullable=False)
    source_event_id = Column(ForeignKey("events.id"), nullable=False)

    source_work = relationship('Work', foreign_keys=[source_work_id], lazy="select")
    linked_work = relationship('Work', foreign_keys=[linked_work_id], lazy="select")
    event = relationship('Event', foreign_keys=[source_event_id], lazy="select")
