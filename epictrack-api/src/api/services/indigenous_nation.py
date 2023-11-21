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
"""Service to manage IndigenousNation."""
from typing import IO, List

import numpy as np
import pandas as pd

from api.exceptions import ResourceExistsError, ResourceNotFoundError
from api.models import IndigenousNation, db
from api.models.pip_org_type import PIPOrgType
from api.models.staff import Staff
from api.utils.token_info import TokenInfo


class IndigenousNationService:
    """Service to manage indigenous nation related operations."""

    @classmethod
    def check_existence(cls, name, indigenous_nation_id=None):
        """Checks if an indigenous nation exists with given name"""
        return IndigenousNation.check_existence(name, indigenous_nation_id)

    @classmethod
    def find_all_indigenous_nations(cls, is_active):
        """Find all active indigenous nations"""
        indigenous_nations = IndigenousNation.find_all(default_filters=is_active)
        return indigenous_nations

    @classmethod
    def find(cls, indigenous_nation_id):
        """Find by indigenous nation id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        if not indigenous_nation:
            raise ResourceNotFoundError(
                f"Indigenous nation with id '{indigenous_nation_id}' not found."
            )
        return indigenous_nation

    @classmethod
    def create_indigenous_nation(cls, payload: dict):
        """Create a new indigenous_nation."""
        exists = cls.check_existence(payload["name"])
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        indigenous_nation = IndigenousNation(**payload)
        indigenous_nation.save()
        return indigenous_nation

    @classmethod
    def update_indigenous_nation(cls, indigenous_nation_id: int, payload: dict):
        """Update existing indigenous_nation."""
        exists = cls.check_existence(payload["name"], indigenous_nation_id)
        if exists:
            raise ResourceExistsError("Indigenous nation with same name exists")
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        if not indigenous_nation:
            raise ResourceNotFoundError(
                f"Indigenous nation with id '{indigenous_nation_id}' not found"
            )
        indigenous_nation = indigenous_nation.update(payload)
        return indigenous_nation

    @classmethod
    def delete_indigenous_nation(cls, indigenous_nation_id: int):
        """Delete indigenous_nation by id."""
        indigenous_nation = IndigenousNation.find_by_id(indigenous_nation_id)
        indigenous_nation.is_deleted = True
        indigenous_nation.save()
        return True

    @classmethod
    def import_indigenous_nations(cls, file: IO):
        """Import indigenous nations"""
        data = cls._read_excel(file)
        data["relationship_holder_id"] = data.apply(lambda x: x["relationship_holder_id"].lower(), axis=1)
        relationship_holders = data["relationship_holder_id"].to_list()
        pip_org_types = data["pip_org_type_id"].to_list()
        staffs = (
            db.session.query(Staff)
            .filter(Staff.email.in_(relationship_holders), Staff.is_active.is_(True))
            .all()
        )
        org_types = (
            db.session.query(PIPOrgType)
            .filter(PIPOrgType.name.in_(pip_org_types), PIPOrgType.is_active.is_(True))
            .all()
        )
        data["relationship_holder_id"] = data.apply(lambda x: cls._find_staff_id(x["relationship_holder_id"], staffs),
                                                    axis=1)
        data["pip_org_type_id"] = data.apply(lambda x: cls._find_org_type_id(x["pip_org_type_id"], org_types), axis=1)
        username = TokenInfo.get_username()
        data["created_by"] = username
        data = data.to_dict("records")
        db.session.bulk_insert_mappings(IndigenousNation, data)
        db.session.commit()
        return "Created successfully"

    @classmethod
    def _read_excel(cls, file: IO) -> pd.DataFrame:
        """Read the template excel file"""
        column_map = {
            "Name": "name",
            "Relationship Holder": "relationship_holder_id",
            "PIP Link": "pip_link",
            "Notes": "notes",
            "PIP Org Type": "pip_org_type_id",
            "BCIGID": "bcigid",
        }
        data_frame = pd.read_excel(file)
        data_frame = data_frame.drop("Order", axis=1)
        data_frame = data_frame.replace({np.nan: None})
        data_frame.rename(column_map, axis="columns", inplace=True)
        return data_frame

    @classmethod
    def _find_staff_id(cls, email: str, staffs: List[Staff]) -> int:
        """Find and return the id of staff from given list"""
        staff = next((x for x in staffs if x.email == email), None)
        if staff is None:
            raise ResourceNotFoundError(f"Staff with email {email} does not exist")
        return staff.id

    @classmethod
    def _find_org_type_id(cls, name: str, org_types: List[PIPOrgType]) -> int:
        """Find and return the id of org_type from given list"""
        org_type = next((x for x in org_types if x.name == name), None)
        if org_type is None:
            raise ResourceNotFoundError(f"Org type with name {name} does not exist")
        return org_type.id
