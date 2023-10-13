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
from sqlalchemy import and_

from reports_api.exceptions import ResourceExistsError, ResourceNotFoundError
from reports_api.models import Project, db
from reports_api.models.indigenous_nation import IndigenousNation
from reports_api.models.indigenous_work import IndigenousWork
from reports_api.models.work import Work
from reports_api.models.work_type import WorkType


class ProjectService:
    """Service to manage project related operations."""

    @classmethod
    def find(cls, project_id):
        """Find by project id."""
        project = Project.find_by_id(project_id)
        return project

    @classmethod
    def find_all(cls):
        """Find all projects"""
        return Project.find_all(default_filters=False)

    @classmethod
    def create_project(cls, payload: dict):
        """Create a new project."""
        exists = cls.check_existence(payload["name"])
        if exists:
            raise ResourceExistsError("Project with same name exists")
        project = Project(**payload)
        current_app.logger.info(f"Project obj {dir(project)}")
        project.save()
        return project

    @classmethod
    def update_project(cls, project_id: int, payload: dict):
        """Update existing project."""
        exists = cls.check_existence(payload["name"], project_id)
        if exists:
            raise ResourceExistsError("Project with same name exists")
        project = Project.find_by_id(project_id)
        if not project:
            raise ResourceNotFoundError(f"Project with id '{project_id}' not found.")
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
    def check_existence(cls, name, project_id=None):
        """Checks if a project exists with given name"""
        return Project.check_existence(name, project_id)

    @classmethod
    def find_project_work_types(cls, project_id: int, work_id: int) -> [WorkType]:
        """Find all work types associated with the project"""
        return (
            db.session.query(WorkType)
            .join(
                Work,
                and_(
                    Work.work_type_id == WorkType.id,
                    Work.project_id == project_id,
                    Work.id != work_id,
                ),
            )
            .filter(
                WorkType.is_active.is_(True),
                WorkType.is_deleted.is_(False),
            )
            .all()
        )

    @classmethod
    def find_first_nations(
        cls, project_id: int, work_id: int, work_type_id: int = None
    ) -> [IndigenousNation]:
        """Find all first nations associated with the project"""
        qry = (
            db.session.query(IndigenousNation)
            .join(
                IndigenousWork,
                IndigenousWork.indigenous_nation_id == IndigenousNation.id,
            )
            .join(
                Work,
                and_(Work.id == IndigenousWork.work_id, Work.project_id == project_id),
            )
            .filter(
                IndigenousNation.is_active.is_(True),
                IndigenousNation.is_deleted.is_(False),
                Work.id != work_id,
            )
        )
        if work_type_id:
            qry.filter(Work.work_type_id == work_type_id)
        return qry.all()

    @classmethod
    def check_first_nation_available(cls, project_id: int, work_id: int) -> bool:
        """Checks if any first nation exists for given project"""
        result = (
            db.session.query(Project)
            .join(
                Work,
                and_(Work.project_id == project_id, Work.id != work_id),
            )
            .join(
                IndigenousWork,
                Work.id == IndigenousWork.work_id,
            )
            .join(IndigenousNation, IndigenousNation.id == IndigenousWork.indigenous_nation_id,)
            .filter(
                Project.id == Work.project_id,
                IndigenousWork.is_active.is_(True),
                IndigenousWork.is_deleted.is_(False),
                IndigenousNation.is_active.is_(True),
                IndigenousNation.is_deleted.is_(False),
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
            )
        )
        result = result.count() > 0
        return {"first_nation_available": result}
