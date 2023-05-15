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

from sqlalchemy import func

from reports_api.exceptions import ResourceExistsError
from reports_api.models import Work
from reports_api.schemas.work_v2 import WorkSchemaV2
from reports_api.services.event import EventService
from reports_api.services.milestone import MilestoneService
from reports_api.services.phaseservice import PhaseService
from reports_api.services.work_phase import WorkPhaseService


class WorkService:  # pylint: disable=too-few-public-methods
    """Service to manage work related operations."""

    @classmethod
    def check_existence(cls, title, instance_id=None):
        """Checks if a work exists for a given title"""
        query = Work.query.filter(
            func.lower(Work.title) == func.lower(title), Work.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(Work.id != instance_id)
        if query.count() > 0:
            return True
        return False

    @classmethod
    def find_all_works(cls):
        """Find all non-deleted works"""
        works = Work.find_all(default_filters=False)
        works_schema = WorkSchemaV2(many=True)
        return {"works": works_schema.dump(works)}

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
        work.current_phase_id = phases[0]["id"]
        work_phases = []
        work_events = []
        start_date = work.start_date
        for phase in phases:
            end_date = start_date + timedelta(days=phase["duration"])
            work_phases.append(
                {
                    "work_id": work.id,
                    "phase_id": phase["id"],
                    "start_date": f"{start_date}",
                    "anticipated_decision_date": f"{end_date}",
                }
            )
            phase_events = MilestoneService.find_auto_milestones_per_phase(phase["id"])
            work_events.append(
                {
                    "title": phase_events[0]["name"],
                    "anticipated_start_date": f"{start_date}",
                    "anticipated_end_date": f"{start_date}",
                    "work_id": work.id,
                    "milestone_id": phase_events[0]["id"],
                }
            )
            for phase_event in phase_events[1:]:
                work_events.append(
                    {
                        "title": phase_event["name"],
                        "anticipated_start_date": f"{end_date}",
                        "anticipated_end_date": f"{end_date}",
                        "work_id": work.id,
                        "milestone_id": phase_event["id"],
                    }
                )
            start_date = end_date + timedelta(days=1)
        WorkPhaseService.create_bulk_work_phases(work_phases)
        EventService.bulk_create_events(work_events)
        work.save()
        return work

    @classmethod
    def find_by_id(cls, _id):
        """Find work by id."""
        work_schema = WorkSchemaV2()
        work = Work.find_by_id(_id)
        response = None
        if work:
            response = {"work": work_schema.dump(work)}
        return response

    @classmethod
    def update_work(cls, work_id: int, payload: dict):
        """Update existing work."""
        exists = cls.check_existence(payload["title"], work_id)
        if exists:
            raise ResourceExistsError("Work with same title already exists")
        work = Work.find_by_id(work_id)
        work = work.update(payload)
        return work

    @classmethod
    def delete_work(cls, work_id: int):
        """Delete work by id."""
        work = Work.find_by_id(work_id)
        work.is_deleted = True
        Work.commit()
        return True
