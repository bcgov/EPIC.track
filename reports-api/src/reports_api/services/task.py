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
from typing import IO

import pandas as pd
from flask import current_app

from reports_api.models import Task, TaskTemplate
from reports_api.schemas import request as req


class TaskService:
    """Service to manage task related operations"""

    @classmethod
    def find_all_task_templates(cls):
        """Find all task templates"""
        current_app.logger.debug("find all task templates")
        task_templates = TaskTemplate.find_all()
        return task_templates

    @classmethod
    def create_task_template(cls, data: dict, template_file: IO):
        """Create a task template instance and related tasks"""
        task_template = TaskTemplate(**data)
        task_template.flush()
        task_data = cls._read_excel(template_file)
        task_data.loc[0:, ["template_id", "is_active"]] = [task_template.id, False]
        tasks = task_data.to_dict("records")
        cls.create_bulk_tasks(tasks)
        TaskTemplate.commit()
        return task_template

    @classmethod
    def _read_excel(cls, template_file: IO):
        """Read the template excel file"""
        column_map = {
            "No": "template_id",
            "Title": "name",
            "NumberOfDays": "number_of_days",
            "StartAt": "start_at",
            "Tips": "tips",
        }
        data_frame = pd.read_excel(template_file)
        data_frame.rename(column_map, axis="columns", inplace=True)
        return data_frame

    @classmethod
    def create_bulk_tasks(cls, tasks):
        """Bulk create tasks from given list of dicts"""
        tasks_schema = req.TaskBodyParameterSchema(many=True)
        tasks = tasks_schema.load(tasks)
        for task in tasks:
            instance = Task(**task)
            instance.flush()
        Task.commit()
