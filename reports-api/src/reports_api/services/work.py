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
"""Service to manage Works."""
from datetime import timedelta

from sqlalchemy.orm import aliased

from reports_api.exceptions import ResourceExistsError, ResourceNotFoundError
from reports_api.models import EAOTeam, Project, Role, Staff, StaffWorkRole, Work
from reports_api.services.event import EventService
from reports_api.services.milestone import MilestoneService
from reports_api.services.phaseservice import PhaseService
from reports_api.services.work_phase import WorkPhaseService


class WorkService:
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, title, work_id=None):
        """Checks if a work exists for a given title"""
        return Work.check_existence(title=title, work_id=work_id)

    @classmethod
    def find_all_works(cls):
        """Find all non-deleted works"""
        works = Work.find_all(default_filters=False)
        return works

    @classmethod
    def find_allocated_resources(cls):
        """Find all allocated resources"""
        lead = aliased(Staff)
        epd = aliased(Staff)
        work_result = (
            Work.query
            .join(Project).filter(
                Project.is_deleted.is_(False),
                Project.is_project_closed.is_(False)
            )
            .outerjoin(EAOTeam, Work.eao_team_id == EAOTeam.id)
            .outerjoin(lead, lead.id == Work.work_lead_id)
            .outerjoin(epd, epd.id == Work.responsible_epd_id)
            .all()
        )
        works = [
            {
                "id": work.id,
                "title": work.title,
                "project": work.project,
                "eao_team": work.eao_team,
                "responsible_epd": work.responsible_epd,
                "work_lead": work.work_lead,
            } for work in work_result
        ]
        work_ids = [work['id'] for work in works]
        staff_result = (
            Staff.query
            .join(StaffWorkRole, StaffWorkRole.staff_id == Staff.id)
            .filter(StaffWorkRole.work_id.in_(work_ids),
                    StaffWorkRole.is_deleted.is_(False))
            .join(Role, Role.id == StaffWorkRole.role_id)
            .add_entity(Role)
            .add_columns(
                StaffWorkRole.work_id
            )
            .all()
        )
        for work in works:
            staffs = list(filter(lambda x, _work_id=work['id']: x.work_id == _work_id, staff_result))
            work['staff'] = staffs
        return works

    @classmethod
    def create_work(cls, payload):
        """Create a new work"""
        exists = cls.check_existence(payload["title"])
        if exists:
            raise ResourceExistsError("Work with same title already exists")
        work = Work(**payload)
        work.flush()
        phases = PhaseService.find_phase_codes_by_ea_act_and_work_type(
            work.ea_act_id, work.work_type_id
        )
        work.current_phase_id = phases[0].id
        work_phases = []
        work_events = []
        start_date = work.start_date
        for phase in phases:
            end_date = start_date + timedelta(days=phase.duration)
            work_phases.append(
                {
                    "work_id": work.id,
                    "phase_id": phase.id,
                    "start_date": f"{start_date}",
                    "anticipated_end_date": f"{end_date}",
                }
            )
            phase_events = MilestoneService.find_auto_milestones_per_phase(phase.id)
            work_events.append(
                {
                    "title": phase_events[0].name,
                    "anticipated_start_date": f"{start_date}",
                    "anticipated_end_date": f"{start_date}",
                    "work_id": work.id,
                    "milestone_id": phase_events[0].id,
                }
            )
            for phase_event in phase_events[1:]:
                work_events.append(
                    {
                        "title": phase_event.name,
                        "anticipated_start_date": f"{end_date}",
                        "anticipated_end_date": f"{end_date}",
                        "work_id": work.id,
                        "milestone_id": phase_event.id,
                    }
                )
            start_date = end_date + timedelta(days=1)
        WorkPhaseService.create_bulk_work_phases(work_phases)
        EventService.bulk_create_events(work_events)
        work.save()
        return work

    @classmethod
    def find_by_id(cls, work_id):
        """Find work by id."""
        work = Work.find_by_id(work_id)
        if not work:
            raise ResourceNotFoundError(f"Work with id '{work_id}' not found")
        return work

    @classmethod
    def update_work(cls, work_id: int, payload: dict):
        """Update existing work."""
        exists = cls.check_existence(payload["title"], work_id)
        if exists:
            raise ResourceExistsError("Work with same title already exists")
        work = Work.find_by_id(work_id)
        if not work:
            raise ResourceNotFoundError(f"Work with id '{work_id}' not found")
        work = work.update(payload)
        return work

    @classmethod
    def delete_work(cls, work_id: int):
        """Delete work by id."""
        work = Work.find_by_id(work_id)
        work.is_deleted = True
        Work.commit()
        return True
