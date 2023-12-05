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
from typing import IO, List

import numpy as np
import pandas as pd
from flask import current_app
from sqlalchemy import and_

from api.exceptions import BadRequestError, ResourceExistsError, ResourceNotFoundError
from api.models import Project, db
from api.models.indigenous_nation import IndigenousNation
from api.models.indigenous_work import IndigenousWork
from api.models.project import ProjectStateEnum
from api.models.proponent import Proponent
from api.models.region import Region
from api.models.sub_types import SubType
from api.models.types import Type
from api.models.work import Work
from api.models.work_type import WorkType
from api.utils.constants import PROJECT_STATE_ENUM_MAPS
from api.utils.enums import ProjectCodeMethod
from api.utils.token_info import TokenInfo


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
        project.project_state = ProjectStateEnum.PRE_WORK
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

    @classmethod
    def import_projects(cls, file: IO):
        """Import proponents"""
        data = cls._read_excel(file)
        proponent_names = set(data["proponent_id"].to_list())
        type_names = set(data["type_id"].to_list())
        sub_type_names = set(data["sub_type_id"].to_list())
        env_region_names = set(data["region_id_env"].to_list())
        flnro_region_names = set(data["region_id_flnro"].to_list())
        proponents = (
            db.session.query(Proponent)
            .filter(Proponent.name.in_(proponent_names), Proponent.is_active.is_(True))
            .all()
        )
        types = (
            db.session.query(Type)
            .filter(Type.name.in_(type_names), Type.is_active.is_(True))
            .all()
        )
        sub_types = (
            db.session.query(SubType)
            .filter(SubType.name.in_(sub_type_names), SubType.is_active.is_(True))
            .all()
        )
        regions = (
            db.session.query(Region)
            .filter(Region.name.in_(env_region_names.union(flnro_region_names)), Region.is_active.is_(True))
            .all()
        )

        data["proponent_id"] = data.apply(
            lambda x: cls._find_proponent_id(x["proponent_id"], proponents), axis=1
        )
        data["type_id"] = data.apply(
            lambda x: cls._find_type_id(x["type_id"], types), axis=1
        )
        data["sub_type_id"] = data.apply(
            lambda x: cls._find_sub_type_id(x["sub_type_id"], sub_types), axis=1
        )
        data["region_id_env"] = data.apply(
            lambda x: cls._find_region_id(x["region_id_env"], regions, "ENV"), axis=1
        )
        data["region_id_flnro"] = data.apply(
            lambda x: cls._find_region_id(x["region_id_flnro"], regions, "FLNR"), axis=1
        )
        data["project_state"] = data.apply(
            lambda x: PROJECT_STATE_ENUM_MAPS[x["project_state"]], axis=1
        )

        username = TokenInfo.get_username()
        data["created_by"] = username
        data = data.to_dict("records")
        db.session.bulk_insert_mappings(Project, data)
        db.session.commit()
        return "Created successfully"

    @classmethod
    def _read_excel(cls, file: IO) -> pd.DataFrame:
        """Read the template excel file"""
        column_map = {
            "Name": "name",
            "Proponent": "proponent_id",
            "Type": "type_id",
            "SubType": "sub_type_id",
            "Description": "description",
            "Address": "address",
            "Latitude": "latitude",
            "Longitude": "longitude",
            "ENVRegion": "region_id_env",
            "FLNRORegion": "region_id_flnro",
            "Capital Investment": "capital_investment",
            "EPIC Guid": "epic_guid",
            "Abbreviation": "abbreviation",
            "EACertificate": "ea_certificate",
            "Project Closed": "is_project_closed",
            "FTE Positions Construction": "fte_positions_construction",
            "FTE Positions Operation": "fte_positions_operation",
            "Project State": "project_state"
        }
        data_frame = pd.read_excel(file)
        data_frame.rename(column_map, axis="columns", inplace=True)
        data_frame = data_frame.infer_objects()
        data_frame = data_frame.apply(lambda x: x.str.strip() if x.dtype == "object" else x)
        data_frame = data_frame.replace({np.nan: None})
        data_frame = data_frame.replace({np.NaN: None})
        return data_frame

    @classmethod
    def _find_proponent_id(cls, name: str, proponents: List[Proponent]) -> int:
        """Find and return the id of proponent from given list"""
        if name is None:
            return None
        proponent = next((x for x in proponents if x.name == name), None)
        if proponent is None:
            print(f"Proponent with name {name} does not exist")
            raise ResourceNotFoundError(f"Proponent with name {name} does not exist")
        return proponent.id

    @classmethod
    def _find_type_id(cls, name: str, types: List[Type]) -> int:
        """Find and return the id of type from given list"""
        if name is None:
            return None
        type_obj = next((x for x in types if x.name == name), None)
        if type_obj is None:
            raise ResourceNotFoundError(f"Type with name {name} does not exist")
        return type_obj.id

    @classmethod
    def _find_sub_type_id(cls, name: str, sub_types: List[SubType]) -> int:
        """Find and return the id of SubType from given list"""
        if name is None:
            return None
        sub_type = next((x for x in sub_types if x.name == name), None)
        if sub_type is None:
            raise ResourceNotFoundError(f"SubType with name {name} does not exist")
        return sub_type.id

    @classmethod
    def _find_region_id(cls, name: str, regions: List[Region], entity: str) -> int:
        """Find and return the id of region from given list"""
        if name is None:
            return None
        region = next((x for x in regions if x.name == name and x.entity == entity), None)
        if region is None:
            raise ResourceNotFoundError(f"Region with name {name} does not exist")
        return region.id

    @classmethod
    def _generate_project_abbreviation(cls, project_name: str, method: ProjectCodeMethod):
        words = project_name.split()

        # Method 1: 1st 3 LETTERS OF FIRST WORD IN NAME + FIRST 3 LETTERS OF 2nd WORD IN NAME
        if method == ProjectCodeMethod.METHOD_1 and len(words) >= 2:
            return words[0][:3] + words[1][:3]

        # Method 2: 1st LETTER OF FIRST WORD IN NAME + 1st LETTER OF 2nd WORD IN NAME + 1st FOUR LETTERS OF THIRD WORD IN NAME
        if method == ProjectCodeMethod.METHOD_2 and len(words) >= 3:
            return words[0][0] + words[1][0] + words[2][:4]

        # Method 3: 1st 6 LETTERS OF FIRST WORD IN NAME
        if method == ProjectCodeMethod.METHOD_3 and len(words[0]) >= 6:
            return words[0][:6]

        return None

    @classmethod
    def create_project_abbreviation(cls, project_name: str):
        """Return a project code based on the project name"""
        for method in ProjectCodeMethod:
            project_abbreviation = cls._generate_project_abbreviation(project_name, method)

            if project_abbreviation is not None:
                # Check if project abbreviation already exists
                project = Project.get_by_abbreviation(project_abbreviation)
                if not project:
                    return project_abbreviation

        raise BadRequestError("Could not generate a unique project abbreviation")
