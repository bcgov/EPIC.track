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
"""Model to handle all operations related to Payment Disbursement status code."""

import enum

from sqlalchemy import Column, Integer, String

from .code_table import CodeTableVersioned
from .db import db


class WorkTypeEnum(enum.Enum):
    """Enum for work type"""

    # pylint: disable=C0103
    PROJECT_NOTIFICATION = 1
    MINISTERS_DESIGNATION = 2
    CEAOS_DESIGNATION = 3
    INTAKE_PRE_EA = 4
    EXEMPTION_ORDER = 5
    ASSESSMENT = 6
    AMENDMENT = 7
    POST_EAC_DOCUMENT_REVIEW = 8
    EAC_EXTENSION = 9
    SUBSTANTIAL_START_DECISION = 10
    EAC_ORDER_TRANSFER = 11
    EAC_ORDER_SUSPENSION = 12
    EAC_ORDER_CANCELLATION = 13
    OTHER = 14


class WorkType(db.Model, CodeTableVersioned):
    """Model class for WorkType."""

    __tablename__ = 'work_types'

    id = Column(Integer, primary_key=True, autoincrement=True)  # TODO check how it can be inherited from parent
    sort_order = Column(Integer())
    report_title = Column(String())

    def as_dict(self):
        """Return Json representation."""
        result = CodeTableVersioned.as_dict(self)
        result['sort_order'] = self.sort_order
        result['report_title'] = self.report_title
        return result
