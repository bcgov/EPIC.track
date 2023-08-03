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
"""Service to manage Tasks."""
from typing import IO, List

import pandas as pd
from flask import current_app

from reports_api.exceptions import ResourceNotFoundError
from reports_api.models import Responsibility, Task, TaskTemplate
from reports_api.models.task_event import TaskEvent
from reports_api.schemas import request as req


class TaskService:
    """Service to manage task related operations"""

    @classmethod
    def find_all_task_templates(cls) -> List[TaskTemplate]:
        """Find all task templates"""
        current_app.logger.debug("find all task templates")
        task_templates = TaskTemplate.find_all(default_filters=False)
        return task_templates

    @classmethod
    def create_task_template(cls, data: dict, template_file: IO) -> TaskTemplate:
        """Create a task template instance and related tasks"""
        task_template = TaskTemplate(**data)
        task_template.flush()
        task_data = cls._read_excel(template_file)
        task_data.loc[0:, ["template_id", "is_active"]] = [task_template.id, False]
        responsibilities = Responsibility.find_all()
        for res in responsibilities:
            task_data = task_data.replace({'responsibility_id': rf'^{res.name}$'},
                                          {'responsibility_id': res.id}, regex=True)
        tasks = task_data.to_dict("records")
        cls.create_bulk_tasks(tasks)
        TaskTemplate.commit()
        return task_template

    @classmethod
    def _read_excel(cls, template_file: IO) -> pd.DataFrame:
        """Read the template excel file"""
        column_map = {
            "No": "template_id",
            "Task \"Title\"": "name",
            "Length (Days)": "number_of_days",
            "Start Plus": "start_at",
            "Responsibility": "responsibility_id",
            "Tips": "tips",
        }
        data_frame = pd.read_excel(template_file)
        data_frame.rename(column_map, axis="columns", inplace=True)
        return data_frame

    @classmethod
    def create_bulk_tasks(cls, tasks) -> None:
        """Bulk create tasks from given list of dicts"""
        tasks_schema = req.TaskBodyParameterSchema(many=True)
        tasks = tasks_schema.load(tasks)
        for task in tasks:
            instance = Task(**task)
            instance.flush()
        Task.commit()

    @classmethod
    def find_tasks_by_template_id(cls, template_id: int) -> List[Task]:
        """Find all tasks for a given template id"""
        template = TaskTemplate.find_by_id(template_id)
        if not template:
            raise ResourceNotFoundError(
                f"Task template with id '{template_id}' not found"
            )
        return template.tasks

    @classmethod
    def update_template(cls, template_id: int, payload: dict) -> TaskTemplate:
        """Update a task template"""
        template = TaskTemplate.find_by_id(template_id)
        if not template:
            raise ResourceNotFoundError(
                f"Task template with id '{template_id}' not found"
            )
        template = template.update(payload)
        return template

    @classmethod
    def delete_template(cls, template_id: int) -> bool:
        """Mark a template as deleted"""
        template = TaskTemplate.find_by_id(template_id)
        if not template:
            raise ResourceNotFoundError(
                f"Task template with id '{template_id}' not found"
            )
        template.is_deleted = True
        TaskTemplate.commit()
        return True

    @classmethod
    def find_by_id(cls, template_id) -> TaskTemplate:
        """Find template by id."""
        template = TaskTemplate.find_by_id(template_id)
        if not template:
            raise ResourceNotFoundError(
                f"Task template with id '{template_id}' not found"
            )
        return template

    @classmethod
    def find_tasks_by_work_id(cls, work_id: int) -> List[Task]:
        """Find all tasks for a given work id"""
        return TaskEvent.find_by_work_id(work_id)
