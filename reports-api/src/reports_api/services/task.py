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
from sqlalchemy import and_
from sqlalchemy.orm import contains_eager
from reports_api.models import TaskEvent, TaskEventAssignee, StaffWorkRole, db
from reports_api.exceptions import UnprocessableEntityError


class TaskService:
    """Service to manage task related operations"""

    @classmethod
    def create_task_event(cls, data: dict) -> TaskEvent:
        """Create task event"""
        task_event = TaskEvent(**cls._prepare_task_event_object(data))
        if cls._get_task_count(task_event.work_id, task_event.phase_id) > 0:
            raise UnprocessableEntityError("Maxium task count per phase has reached")
        if data.get("assignee_ids") and not cls._validate_assignees(data.get("assignee_ids"), data):
            raise UnprocessableEntityError("Only team members can be assigned to a task")
        task_event = task_event.flush()
        if data.get("assignee_ids"):
            cls._handle_assignees(data.get("assignee_ids"), task_event)
        db.session.commit()
        return task_event

    @classmethod
    def update_task_event(cls, data: dict, task_event_id) -> TaskEvent:
        """Update task event"""
        task_event = TaskEvent.find_by_id(task_event_id)
        if data.get("assignee_ids") and not cls._validate_assignees(data.get("assignee_ids"), data):
            raise UnprocessableEntityError("Only team members can be assigned to a task")
        task_event.update(data, commit=False)
        if data.get("assignee_ids"):
            cls._handle_assignees(data.get("assignee_ids"), task_event)
        db.session.commit()
        return task_event

    @classmethod
    def find_task_events(cls, work_id: int, phase_id: int) -> [TaskEvent]:
        """Get all task events per workid, phaseid"""
        return db.session.query(TaskEvent).filter(TaskEvent.is_active.is_(True),
                                                  TaskEvent.is_deleted.is_(False),
                                                  TaskEvent.work_id == work_id,
                                                  TaskEvent.phase_id == phase_id).all()

    @classmethod
    def find_task_event(cls, event_id: int) -> TaskEvent:
        """Get the task event"""
        return db.session.query(TaskEvent)\
            .outerjoin(TaskEventAssignee, and_(TaskEventAssignee.task_event_id == TaskEvent.id,
                                               TaskEventAssignee.is_active.is_(True)))\
            .filter(TaskEvent.id == event_id)\
            .options(contains_eager(TaskEvent.assignees)).scalar()

    @classmethod
    def _prepare_task_event_object(cls, data: dict) -> dict:
        """Prepare a task event object"""
        exclude = ["assignee_ids"]
        return {key: data[key] for key in data.keys() if key not in exclude}

    @classmethod
    def _handle_assignees(cls, assignees: list, task_event: TaskEvent) -> None:
        """Handles the assignees for the task event"""
        existing_assignees = db.session.query(TaskEventAssignee)\
            .filter(TaskEventAssignee.is_active.is_(True),
                    TaskEventAssignee.is_deleted.is_(False),
                    TaskEventAssignee.task_event_id == task_event.id).all()
        existing_set = set(list(map(lambda x: x.assignee_id, existing_assignees)))
        incoming_set = set(assignees)
        difference = list(existing_set.difference(incoming_set))

        task_assignee = [TaskEventAssignee(**{
                "task_event_id": task_event.id,
                "assignee_id": assigne_id
              }) for assigne_id in assignees]
        # add or update the assignees
        for new_assginee in task_assignee:
            if new_assginee.assignee_id in existing_set:
                new_assginee.update(new_assginee.as_dict(recursive=False), commit=False)
            else:
                new_assginee.flush()
        to_be_inactive = db.session.query(TaskEventAssignee)\
            .filter(TaskEventAssignee.is_active.is_(True),
                    TaskEventAssignee.is_deleted.is_(False),
                    TaskEventAssignee.task_event_id == task_event.id,
                    TaskEventAssignee.assignee_id.in_(difference)).all()
        for item in to_be_inactive:
            item.is_active = False
            item.update(item.as_dict(recursive=False), commit=False)

    @classmethod
    def _validate_assignees(cls, assignees: list, data: dict) -> bool:
        """Database validation"""
        work_staff = [r for (r,) in db.session.query(StaffWorkRole.staff_id)
                      .filter(StaffWorkRole.work_id == data["work_id"],
                              StaffWorkRole.is_deleted.is_(False),
                              StaffWorkRole.is_active.is_(True))
                      .all()]
        return all(assigne in work_staff for assigne in assignees)

    @classmethod
    def _get_task_count(cls, work_id: int, phase_id: int):
        """Task should be inserted only once."""
        return db.session.query(TaskEvent.id).filter(TaskEvent.is_active.is_(True),
                                                     TaskEvent.is_deleted.is_(False),
                                                     TaskEvent.work_id == work_id,
                                                     TaskEvent.phase_id == phase_id).count()
