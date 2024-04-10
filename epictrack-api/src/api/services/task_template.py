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
"""Service to manage Task Templates."""
from typing import IO, List

import numpy as np
import pandas as pd
from flask import current_app
from sqlalchemy.sql import exists

from api.exceptions import ResourceNotFoundError
from api.models import Responsibility, Task, TaskTemplate, db
from api.schemas import request as req


class TaskTemplateService:
    """Service to manage task template related operations"""

    @classmethod
    def find_all_task_templates(cls, params: dict) -> List[TaskTemplate]:
        """Find all task templates"""
        current_app.logger.debug("find all task templates")
        task_templates = TaskTemplate.find_by_params(params, default_filters=False)
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
            task_data = task_data.replace(
                {"responsibility_id": rf"^{res.name}$"},
                {"responsibility_id": res.id},
                regex=True,
            )
        task_data = task_data.replace({np.nan: None})
        task_data = task_data.replace({np.NaN: None})
        tasks = task_data.to_dict("records")
        cls.create_bulk_tasks(tasks)
        TaskTemplate.commit()
        return task_template

    @classmethod
    def _read_excel(cls, template_file: IO) -> pd.DataFrame:
        """Read the template excel file"""
        column_map = {
            "No": "template_id",
            'Task "Title"': "name",
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
    def find_by_id(cls, template_id, exclude_deleted=False) -> TaskTemplate:
        """Find template by id."""
        query = db.session.query(TaskTemplate).filter(TaskTemplate.id == template_id)
        if exclude_deleted:
            query = query.filter(TaskTemplate.is_deleted.is_(False))
        template = query.one_or_none()
        if template:
            return template
        raise ResourceNotFoundError(f"Task template with id '{template_id}' not found")

    @classmethod
    def check_template_exists(cls, work_type_id: int, phase_id: int, ea_act_id: int) -> bool:
        """Checks if any template exists for given work and phase"""
        return db.session.query(
            exists().where(
                TaskTemplate.work_type_id == work_type_id,
                TaskTemplate.phase_id == phase_id,
                TaskTemplate.ea_act_id == ea_act_id,
                TaskTemplate.is_active.is_(True),
                TaskTemplate.is_deleted.is_(False)
            )
        ).scalar()
