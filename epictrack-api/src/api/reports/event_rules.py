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
"""The referral and decision events the reports show, chosen by work type and event name.

They keep today's selection, including the gaps raised with the product owners, until they become template settings.
"""
from sqlalchemy import and_, BooleanClauseList, or_

from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.work import Work
from api.models.work_type import WorkTypeEnum


def thirty_sixty_ninety_referrals() -> BooleanClauseList:
    """Return the referrals the 30-60-90 shows; the query must join Work and EventConfiguration."""
    return or_(
        and_(
            Work.work_type_id == WorkTypeEnum.PROJECT_NOTIFICATION.value,
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
            EventConfiguration.name == "Project Notification Report referred to Decision Maker",
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.MINISTERS_DESIGNATION.value,
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
            EventConfiguration.name != "Minister's Designation Report referred to Decision Maker",
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.EXEMPTION_ORDER.value,
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
            EventConfiguration.name != "Exemption Request Package Referred to Minister",
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.ASSESSMENT.value,
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
            EventConfiguration.name.in_(["EAC Referral Package sent to Ministers", "Termination Package Referred to Minister"])
        ),
        and_(
            or_(Work.work_type_id == WorkTypeEnum.AMENDMENT.value, Work.work_type_id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
            EventConfiguration.name == "Amendment Decision Package Referred to Decision Maker"
        ),
    )


def anticipated_schedule_referrals_and_decisions() -> BooleanClauseList:
    """Return the referrals and decisions the anticipated schedule shows; the query must join Work and EventConfiguration."""
    return or_(
        and_(
            EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
            EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value
        ),
        and_(
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.event_type_id == EventTypeEnum.MINISTER_DECISION.value
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.EXEMPTION_ORDER.value,
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
            EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.ASSESSMENT.value,
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.name.notin_([
                "IPD/EP Approval Decision (Day Zero)",
                "Revised EAC Application Acceptance Decision (Day Zero)"
            ]),
            EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
        ),
        and_(
            or_(Work.work_type_id == WorkTypeEnum.AMENDMENT.value,
                Work.work_type_id == WorkTypeEnum.JOINT_COMPLEX_AMENDMENT.value),
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.name != "Delegation of Amendment Decision",
            EventConfiguration.event_type_id.in_([
                EventTypeEnum.CEAO_DECISION.value,
                EventTypeEnum.ADM.value
            ])
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.EAC_EXTENSION.value,
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.event_type_id == EventTypeEnum.ADM.value
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.SUBSTANTIAL_START_DECISION.value,
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.name != "Delegation of SubStart Decision to Minister",
            EventConfiguration.event_type_id == EventTypeEnum.ADM.value
        ),
        and_(
            Work.work_type_id == WorkTypeEnum.EAC_ORDER_TRANSFER.value,
            EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            EventConfiguration.name != "Delegation of Transfer Decision to Minister",
            EventConfiguration.event_type_id.in_([
                EventTypeEnum.CEAO_DECISION.value,
                EventTypeEnum.ADM.value
            ])
        )
    )
