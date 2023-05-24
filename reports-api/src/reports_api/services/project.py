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
"""Service to manage Project."""
from flask import current_app
from sqlalchemy import func
from reports_api.exceptions import ResourceExistsError

from reports_api.models import Project
from reports_api.schemas.project import ProjectSchema


class ProjectService:
    """Service to manage project related operations."""

    @classmethod
    def find(cls, project_id):
        """Find by project id."""
        return Project.find_by_id(project_id).as_dict()

    @classmethod
    def find_all(cls):
        """Find all projects"""
        projects_schema = ProjectSchema(many=True)
        response = {"projects": projects_schema.dump(Project.find_all())}
        return response

    @classmethod
    def create_project(cls, payload: dict):
        """Create a new project."""
        exists = cls.check_existence(payload["name"])
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        project = Project(**payload)
        current_app.logger.info(f"Project obj {dir(project)}")
        project.save()
        return project

    @classmethod
    def update_project(cls, project_id: int, payload: dict):
        """Update existing project."""
        exists = cls.check_existence(payload["name"], project_id)
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        project = Project.find_by_id(project_id)
        project = project.update(payload)
        return project

    @classmethod
    def delete_project(cls, project_id: int):
        """Delete project by id."""
        project = Project.find_by_id(project_id)
        project.is_deleted = True
        project.save()
        return True

    @classmethod
    def check_existence(cls, name, instance_id):
        """Checks if a project exists with given name"""
        query = Project.query.filter(
            func.lower(Project.name) == func.lower(name), Project.is_deleted.is_(False)
        )
        if instance_id:
            query = query.filter(Project.id != instance_id)
        if query.count() > 0:
            return True
        return False
