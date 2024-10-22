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
"""Service to manage Tasks"""
from datetime import timedelta
from itertools import product
from typing import List, IO

import numpy as np
import pandas as pd
from dateutil.parser import parse
from flask import current_app
from sqlalchemy import and_, tuple_
from sqlalchemy.orm import contains_eager, lazyload

from api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from api.models import (
    StaffWorkRole,
    StatusEnum,
    TaskEvent,
    TaskEventAssignee,
    WorkPhase,
    db,
)
from api.models.task_event_responsibility import TaskEventResponsibility
from ..models.queries.task_event_queries import find_by_staff_work_role_staff_id
from ..utils.constants import CANADA_TIMEZONE
from ..utils.datetime_helper import get_start_of_day

from ..utils.roles import Membership
from ..utils.roles import Role as KeycloakRole
from . import authorisation
from .task_template import TaskTemplateService


class TaskService:
    """Service to manage task related operations"""

    @classmethod
    def create_task_events_bulk(cls, data: list, work_phase_id: int):
        """Create task events in bulk"""
        work_phase = WorkPhase.find_by_id(work_phase_id)

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EXTENDED_EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_phase.work_id)

        if cls._get_task_count(work_phase_id) > 0:
            raise UnprocessableEntityError("Tasks already added for the phase")
        task_events = []
        for task in data:
            task_data = {
                **task,
                "work_phase_id": work_phase_id,
            }
            task_event = TaskEvent(**task_data)
            task_event.flush()
            task_events.append(task_event)
        db.session.commit()
        return task_events

    @classmethod
    def _read_excel(cls, template_file: IO) -> list:
        """Read the template excel file"""
        column_map = {
            "Name": "name",
            "Days": "number_of_days",
            "Start Date": "start_date",
            "Type": 'type'
        }
        data_frame = pd.read_excel(template_file)
        data_frame.rename(column_map, axis="columns", inplace=True)
        data_frame = data_frame.replace({np.nan: None})
        data_frame = data_frame.replace({np.NaN: None})
        return data_frame.to_dict('records')

    @classmethod
    def _prepare_task_from_import(cls, data: list) -> list:
        """Prepare a task event object"""
        tasks = []
        for task in data:
            if task.get('type', None) != 'Task':
                continue
            start_date = parse(task.get("start_date")).astimezone(CANADA_TIMEZONE)
            task_data = {
                "name": task.get("name", ''),
                "start_date": get_start_of_day(start_date)
                if task.get("start_date") else None,
                "number_of_days": task.get("number_of_days", 0),
            }
            tasks.append(task_data)
        return tasks

    @classmethod
    def create_task_events_from_sheet(cls, work_phase_id: int, sheet: IO):
        """Create task events from excel sheet"""
        read_tasks_data = cls._read_excel(sheet)
        task_events_data = cls._prepare_task_from_import(read_tasks_data)
        task_events = cls.create_task_events_bulk(task_events_data, work_phase_id)
        return task_events

    @classmethod
    def create_task_event(cls, data: dict, commit: bool = True) -> TaskEvent:
        """Create task event"""
        task_event = TaskEvent(**cls._prepare_task_event_object(data))
        work_phase = WorkPhase.find_by_id(data.get("work_phase_id"))

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_phase.work_id)

        if data.get("assignee_ids") and not cls._validate_assignees(
            data.get("assignee_ids"), work_phase.work_id
        ):
            raise UnprocessableEntityError(
                "Only team members can be assigned to a task"
            )
        task_event = task_event.flush()
        if data.get("assignee_ids"):
            cls._handle_assignees(data.get("assignee_ids"), [task_event.id])
        if data.get("responsibility_ids"):
            cls._handle_responsibilities(
                data.get("responsibility_ids"), [task_event.id]
            )
        work_phase.task_added = True
        if commit:
            db.session.commit()
        return task_event

    @classmethod
    def update_task_event(cls, data: dict, task_event_id) -> TaskEvent:
        """Update task event"""
        task_event = TaskEvent.find_by_id(task_event_id)
        work_phase = WorkPhase.find_by_id(data.get("work_phase_id"))

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_phase.work_id)

        if data.get("assignee_ids") and not cls._validate_assignees(
            data.get("assignee_ids"), work_phase.work_id
        ):
            raise UnprocessableEntityError(
                "Only team members can be assigned to a task"
            )
        task_event.update(data, commit=False)
        cls._handle_assignees(data.get("assignee_ids"), [task_event.id])
        cls._handle_responsibilities(data.get("responsibility_ids"), [task_event.id])
        db.session.commit()
        return task_event

    @classmethod
    def find_task_events(cls, work_phase_id: int) -> [TaskEvent]:
        """Get all task events per work_phase_id"""
        return (
            db.session.query(TaskEvent)
            .filter(
                TaskEvent.is_active.is_(True),
                TaskEvent.is_deleted.is_(False),
                TaskEvent.work_phase_id == work_phase_id,
            )
            .options(
                lazyload(TaskEvent.assignees).joinedload(TaskEventAssignee.assignee)
            )
            .all()
        )

    @classmethod
    def find_by_staff_work_role_staff_id(cls, staff_id: int, is_active: bool = None) -> [TaskEvent]:
        """Get all task events per assignee_id"""
        tasks = find_by_staff_work_role_staff_id(staff_id, is_active)
        return tasks

    @classmethod
    def find_task_event(cls, event_id: int, exclude_deleted: bool = False) -> TaskEvent:
        """Get the task event"""
        query = (
            db.session.query(TaskEvent)
            .outerjoin(
                TaskEventAssignee,
                and_(
                    TaskEventAssignee.task_event_id == TaskEvent.id,
                    TaskEventAssignee.is_active.is_(True),
                ),
            )
            .filter(TaskEvent.id == event_id)
        )
        if exclude_deleted:
            query = query.filter(TaskEvent.is_deleted.is_(False))
        task_event = query.options(contains_eager(TaskEvent.assignees)).scalar()
        print(f"Task event in service {task_event}")
        if task_event:
            return task_event
        raise ResourceNotFoundError(f"TaskEvent with id '{event_id}' not found.")

    @classmethod
    def create_task_events_from_template(
        cls, params: dict, template_id: int
    ) -> List[TaskEvent]:
        """Create a list of task events from the given task template"""
        work_phase = WorkPhase.find_by_id(params.get("work_phase_id"))

        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_phase.work_id)

        if not work_phase:
            raise UnprocessableEntityError("No data found for the given work and phase")
        if work_phase.task_added:
            raise UnprocessableEntityError(
                "Template can be uploaded only once for a phase"
            )
        template = TaskTemplateService.find_by_id(template_id)
        if not template.is_active:
            raise UnprocessableEntityError("In-Active templates cannot be processed")
        tasks = template.tasks
        if not tasks or len(tasks) == 0:
            raise UnprocessableEntityError("No tasks found to import")
        result_events = []
        for task in tasks:
            task_event_dic = {
                "name": task.name,
                "work_phase_id": params.get("work_phase_id"),
                "start_date": work_phase.start_date + timedelta(days=task.start_at),
                "number_of_days": task.number_of_days,
                "tips": task.tips,
                "status": StatusEnum.NOT_STARTED,
            }
            result_events.append(cls.create_task_event(task_event_dic, commit=False))
        work_phase.task_added = True
        db.session.commit()
        return result_events

    @classmethod
    def _prepare_task_event_object(cls, data: dict) -> dict:
        """Prepare a task event object"""
        exclude = ["responsibility_ids", "assignee_ids"]
        return {key: data[key] for key in data.keys() if key not in exclude}

    @classmethod
    def _handle_assignees(cls, assignees: list, task_event_ids: List[int]) -> None:
        """Handles the assignees for the task event"""
        existing_assignees_qry = db.session.query(TaskEventAssignee).filter(
            TaskEventAssignee.is_deleted.is_(False),
            TaskEventAssignee.task_event_id.in_(task_event_ids),
        )

        existing_assignees = list(
            map(
                lambda x: {
                    "task_event_id": x.task_event_id,
                    "assignee_id": x.assignee_id,
                },
                existing_assignees_qry.all(),
            )
        )

        # Mark removed entries as inactive
        disabled_count = existing_assignees_qry.filter(
            TaskEventAssignee.is_active.is_(True),
            TaskEventAssignee.assignee_id.notin_(assignees),
        ).update({"is_active": False})
        current_app.logger.info(f"Disabled {disabled_count} TaskEventAssignees")

        # Update existing entries to be active
        enabled_count = existing_assignees_qry.filter(
            tuple_(TaskEventAssignee.assignee_id, TaskEventAssignee.task_event_id).in_(
                [
                    (x["assignee_id"], x["task_event_id"])
                    for x in existing_assignees
                    if x["assignee_id"] in assignees
                ]
            )
        ).update({"is_active": True})
        current_app.logger.info(f"Enabled {enabled_count} TaskEventAssignees")

        keys = ("task_event_id", "assignee_id")
        # Create mappings for new entries
        # dict(zip(keys, (i, j))) below creates a dict of the form
        # {"task_event_id": i, "assignee_id": j
        task_event_assignees = [
            task_assignee
            for i, j in product(task_event_ids, assignees)
            if (task_assignee := dict(zip(keys, (i, j)))) not in existing_assignees
        ]
        db.session.bulk_insert_mappings(
            TaskEventAssignee, mappings=task_event_assignees
        )

    @classmethod
    def _validate_assignees(cls, assignees: list, work_id: int) -> bool:
        """Database validation"""
        work_staff = [
            r
            for (r,) in db.session.query(StaffWorkRole.staff_id)
            .filter(
                StaffWorkRole.work_id == work_id,
                StaffWorkRole.is_deleted.is_(False),
                StaffWorkRole.is_active.is_(True),
            )
            .all()
        ]
        return all(assigne in work_staff for assigne in assignees)

    @classmethod
    def _get_task_count(cls, work_phase_id: int):
        """Task should be inserted only once."""
        return (
            db.session.query(TaskEvent.id)
            .filter(
                TaskEvent.is_active.is_(True),
                TaskEvent.is_deleted.is_(False),
                TaskEvent.work_phase_id == work_phase_id,
            )
            .count()
        )

    @classmethod
    def bulk_update(cls, data: dict):
        """Bulk update task events"""
        work_id = data.get("work_id")
        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

        task_ids = data.pop("task_ids")
        if "assignee_ids" in data:
            cls._handle_assignees(data["assignee_ids"], task_ids)
        elif "responsibility_ids" in data:
            cls._handle_responsibilities(data["responsibility_ids"], task_ids)
        else:
            field = list(data.keys())[0]
            keys = ("id", field)
            task_event_mappings = [
                dict(zip(keys, (i, j))) for i, j in product(task_ids, [data[field]])
            ]
            db.session.bulk_update_mappings(TaskEvent, mappings=task_event_mappings)
        db.session.commit()
        return "Updated successfully"

    @classmethod
    def bulk_delete_tasks(cls, task_ids: List, work_id: int):
        """Mark tasks as deleted"""
        one_of_roles = (
            Membership.TEAM_MEMBER.name,
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)

        db.session.query(TaskEvent).filter(TaskEvent.id.in_(task_ids)).update(
            {"is_active": False, "is_deleted": True}
        )
        db.session.commit()
        return "Deleted successfully"

    @classmethod
    def _handle_responsibilities(
        cls, responsibilities: list, task_event_ids: List[int]
    ) -> None:
        """Handles the responsibilities for the task event"""
        existing_responsibilities_qry = db.session.query(
            TaskEventResponsibility
        ).filter(
            TaskEventResponsibility.is_deleted.is_(False),
            TaskEventResponsibility.task_event_id.in_(task_event_ids),
        )

        existing_responsibilities = list(
            map(
                lambda x: {
                    "task_event_id": x.task_event_id,
                    "responsibility_id": x.responsibility_id,
                },
                existing_responsibilities_qry.all(),
            )
        )

        # Mark removed entries as inactive
        disabled_count = existing_responsibilities_qry.filter(
            TaskEventResponsibility.is_active.is_(True),
            TaskEventResponsibility.responsibility_id.notin_(responsibilities),
        ).update({"is_active": False})
        current_app.logger.info(f"Disabled {disabled_count} TaskEventResponsibilities")

        # Update existing entries to be active
        enabled_count = existing_responsibilities_qry.filter(
            tuple_(
                TaskEventResponsibility.responsibility_id,
                TaskEventResponsibility.task_event_id,
            ).in_(
                [
                    (x["responsibility_id"], x["task_event_id"])
                    for x in existing_responsibilities
                    if x["responsibility_id"] in responsibilities
                ]
            )
        ).update({"is_active": True})
        current_app.logger.info(f"Enabled {enabled_count} TaskEventResponsibilities")

        keys = ("task_event_id", "responsibility_id")
        # Create mappings for new entries
        # dict(zip(keys, (i, j))) below creates a dict of the form
        # {"task_event_id": i, "responsibility_id": j
        task_event_responsibilities = [
            task_responsibility
            for i, j in product(task_event_ids, responsibilities)
            if (task_responsibility := dict(zip(keys, (i, j))))
            not in existing_responsibilities
        ]
        db.session.bulk_insert_mappings(
            TaskEventResponsibility, mappings=task_event_responsibilities
        )

    @classmethod
    def copy_task_events(cls, data: dict, commit=True):
        """Copy works from source work to target work"""
        source_work_id = data.get("source_work_id", None)
        target_work_id = data.get("target_work_id")
        source_events = (
            db.session.query(TaskEvent)
            .join(
                WorkPhase,
                and_(
                    WorkPhase.id == TaskEvent.work_phase_id,
                    WorkPhase.work_id == source_work_id,
                ),
            )
            .all()
        )
        target_work_phases = WorkPhase.find_by_params({"work_id": target_work_id})
        task_events = []
        for work_phase in target_work_phases:
            # skip the iteration if the target workphase already has tasks added
            if work_phase.task_added:
                pass
            source_events_per_wp = [
                event
                for event in source_events
                if event.work_phase.phase_id == work_phase.phase_id
                and event.work_phase.sort_order == work_phase.sort_order
            ]
            task_added = False
            for sv in source_events_per_wp:
                task_event = TaskEvent(
                    **{
                        "name": sv.name,
                        "work_phase_id": work_phase.id,
                        "start_date": work_phase.start_date,
                        "number_of_days": sv.number_of_days,
                        "tips": sv.tips,
                        "notes": sv.notes,
                        "status": StatusEnum.NOT_STARTED.value,
                    }
                )
                task_event.flush()
                task_events.append(task_event)
                task_added = True
            if task_added:
                work_phase.task_added = True
                work_phase.update(work_phase.as_dict(recursive=False), commit=False)
        if commit:
            db.session.commit()
        return task_events
