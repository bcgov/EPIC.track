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
"""Writes the work-level fields the engine decides. Works are moving to DEMI, so only this module writes them."""
from datetime import timedelta

from api.models import Work, db
from api.models.work import WorkStateEnum
from api.workplan.core.change import Changeset


class WorkGateway:  # pylint: disable=too-few-public-methods
    """Works in Track's tables."""

    @staticmethod
    def apply(work_id: int, changes: Changeset) -> None:
        """Set the work's current phase, state and start date as the change decided."""
        work = db.session.get(Work, work_id)
        if changes.current_phase_id is not None:
            work.current_work_phase_id = changes.current_phase_id
            work.work_state = WorkStateEnum.IN_PROGRESS
        if changes.work_completed:
            work.work_state = WorkStateEnum.COMPLETED
        if changes.work_start is not None:
            work.start_date += timedelta(days=(changes.work_start - work.start_date.date()).days)
