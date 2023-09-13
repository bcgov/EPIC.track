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

from flask import current_app
from sqlalchemy import and_, tuple_
from sqlalchemy.orm import contains_eager

from reports_api.exceptions import UnprocessableEntityError
from reports_api.models import StaffWorkRole, StatusEnum, TaskEvent, TaskEventAssignee, db

from .task_template import TaskTemplateService
from .work_phase import WorkPhaseService


class TaskService:
    """Service to manage task related operations"""

    @classmethod
    def create_task_event(cls, data: dict, commit: bool = True) -> TaskEvent:
        """Create task event"""
        task_event = TaskEvent(**cls._prepare_task_event_object(data))
        # if cls._get_task_count(task_event.work_id, task_event.phase_id) > 0:
        #     raise UnprocessableEntityError("Maxium task count per phase has reached")
        if data.get("assignee_ids") and not cls._validate_assignees(
            data.get("assignee_ids"), data
        ):
            raise UnprocessableEntityError(
                "Only team members can be assigned to a task"
            )
        task_event = task_event.flush()
        if data.get("assignee_ids"):
            cls._handle_assignees(data.get("assignee_ids"), task_event)
        work_phase = WorkPhaseService.find_by_work_nd_phase(
            data.get("work_id"), data.get("phase_id")
        )
        work_phase.template_uploaded = True
        if commit:
            db.session.commit()
        return task_event

    @classmethod
    def update_task_event(cls, data: dict, task_event_id) -> TaskEvent:
        """Update task event"""
        task_event = TaskEvent.find_by_id(task_event_id)
        if data.get("assignee_ids") and not cls._validate_assignees(
            data.get("assignee_ids"), data
        ):
            raise UnprocessableEntityError(
                "Only team members can be assigned to a task"
            )
        task_event.update(data, commit=False)
        if data.get("assignee_ids"):
            cls._handle_assignees(data.get("assignee_ids"), task_event)
        db.session.commit()
        return task_event

    @classmethod
    def find_task_events(cls, work_id: int, phase_id: int) -> [TaskEvent]:
        """Get all task events per workid, phaseid"""
        return (
            db.session.query(TaskEvent)
            .filter(
                TaskEvent.is_active.is_(True),
                TaskEvent.is_deleted.is_(False),
                TaskEvent.work_id == work_id,
                TaskEvent.phase_id == phase_id,
            )
            .all()
        )

    @classmethod
    def find_task_event(cls, event_id: int) -> TaskEvent:
        """Get the task event"""
        return (
            db.session.query(TaskEvent)
            .outerjoin(
                TaskEventAssignee,
                and_(
                    TaskEventAssignee.task_event_id == TaskEvent.id,
                    TaskEventAssignee.is_active.is_(True),
                ),
            )
            .filter(TaskEvent.id == event_id)
            .options(contains_eager(TaskEvent.assignees))
            .scalar()
        )

    @classmethod
    def create_task_events_from_template(
        cls, params: dict, template_id: int
    ) -> [TaskEvent]:
        """Create a list of task events from the given task template"""
        work_phase = WorkPhaseService.find_by_work_nd_phase(
            params.get("work_id"), params.get("phase_id")
        )
        if not work_phase:
            raise UnprocessableEntityError("No data found for the given work and phase")
        if work_phase.template_uploaded:
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
                "work_id": params.get("work_id"),
                "phase_id": params.get("phase_id"),
                "responsibility_id": task.responsibility_id,
                "start_date": work_phase.start_date + timedelta(days=task.start_at + task.number_of_days),
                "number_of_days": task.number_of_days,
                "tips": task.tips,
                "status": StatusEnum.NOT_STARTED,
            }
            result_events.append(cls.create_task_event(task_event_dic, commit=False))
        work_phase.template_uploaded = True
        db.session.commit()
        return result_events

    @classmethod
    def _prepare_task_event_object(cls, data: dict) -> dict:
        """Prepare a task event object"""
        exclude = ["assignee_ids"]
        return {key: data[key] for key in data.keys() if key not in exclude}

    @classmethod
    def _handle_assignees(cls, assignees: list, task_event: TaskEvent) -> None:
        """Handles the assignees for the task event"""
        existing_assignees = (
            db.session.query(TaskEventAssignee)
            .filter(
                TaskEventAssignee.is_active.is_(True),
                TaskEventAssignee.is_deleted.is_(False),
                TaskEventAssignee.task_event_id == task_event.id,
            )
            .all()
        )
        existing_set = set(list(map(lambda x: x.assignee_id, existing_assignees)))
        incoming_set = set(assignees)
        difference = list(existing_set.difference(incoming_set))

        task_assignee = [
            TaskEventAssignee(
                **{"task_event_id": task_event.id, "assignee_id": assigne_id}
            )
            for assigne_id in assignees
        ]
        # add or update the assignees
        for new_assginee in task_assignee:
            if new_assginee.assignee_id in existing_set:
                new_assginee.update(new_assginee.as_dict(recursive=False), commit=False)
            else:
                new_assginee.flush()
        to_be_inactive = (
            db.session.query(TaskEventAssignee)
            .filter(
                TaskEventAssignee.is_active.is_(True),
                TaskEventAssignee.is_deleted.is_(False),
                TaskEventAssignee.task_event_id == task_event.id,
                TaskEventAssignee.assignee_id.in_(difference),
            )
            .all()
        )
        for item in to_be_inactive:
            item.is_active = False
            item.update(item.as_dict(recursive=False), commit=False)

    @classmethod
    def _validate_assignees(cls, assignees: list, data: dict) -> bool:
        """Database validation"""
        work_staff = [
            r
            for (r,) in db.session.query(StaffWorkRole.staff_id)
            .filter(
                StaffWorkRole.work_id == data["work_id"],
                StaffWorkRole.is_deleted.is_(False),
                StaffWorkRole.is_active.is_(True),
            )
            .all()
        ]
        return all(assigne in work_staff for assigne in assignees)

    @classmethod
    def _get_task_count(cls, work_id: int, phase_id: int):
        """Task should be inserted only once."""
        return (
            db.session.query(TaskEvent.id)
            .filter(
                TaskEvent.is_active.is_(True),
                TaskEvent.is_deleted.is_(False),
                TaskEvent.work_id == work_id,
                TaskEvent.phase_id == phase_id,
            )
            .count()
        )

    @classmethod
    def bulk_update(cls, data: dict):
        """Bulk update task events"""
        task_ids = data.pop("task_ids")
        if "assignee_ids" in data:
            existing_assignees_qry = db.session.query(TaskEventAssignee).filter(
                TaskEventAssignee.is_deleted.is_(False),
                TaskEventAssignee.task_event_id.in_(task_ids),
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
                TaskEventAssignee.assignee_id.notin_(data["assignee_ids"]),
            ).update({"is_active": False})
            current_app.logger.info(f"Disabled {disabled_count} TaskEventAssignees")

            # Update existing entries to be active
            enabled_count = existing_assignees_qry.filter(
                tuple_(
                    TaskEventAssignee.assignee_id, TaskEventAssignee.task_event_id
                ).in_(
                    [
                        (x["assignee_id"], x["task_event_id"])
                        for x in existing_assignees
                        if x["assignee_id"] in data["assignee_ids"]
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
                for i, j in product(task_ids, data["assignee_ids"])
                if (task_assignee := dict(zip(keys, (i, j)))) not in existing_assignees
            ]
            db.session.bulk_insert_mappings(
                TaskEventAssignee, mappings=task_event_assignees
            )
        else:
            field = list(data.keys())[0]
            keys = ("id", field)
            task_event_mappings = [
                dict(zip(keys, (i, j))) for i, j in product(task_ids, [data[field]])
            ]
            db.session.bulk_update_mappings(TaskEvent, mappings=task_event_mappings)
        db.session.commit()
        return "Updated successfully"
