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
"""Model to handle all complex operations related to Task Events."""

from api.models import WorkPhase, Work, StaffWorkRole, TaskEvent, db


def find_by_staff_work_role_staff_id(
    staff_id: int, is_active: bool = None, session=None
):
    """Find task events by staff work role id"""
    if not session:
        session = db.session
    query = (
        session.query(TaskEvent)
        .join(WorkPhase, WorkPhase.id == TaskEvent.work_phase_id)
        .join(Work, Work.id == WorkPhase.work_id)
        .join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
        .filter(StaffWorkRole.staff_id == staff_id)
    )

    if is_active is not None:
        query = query.filter(TaskEvent.is_active.is_(is_active))

    query = query.order_by(TaskEvent.start_date.asc())
    return query.all()
