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
"""Service to manage Ministry."""
from api.models import Ministry
from api.models.special_field import EntityEnum, FieldTypeEnum
from api.utils.roles import Role as KeycloakRole
from api.services import authorisation
from api.exceptions import ResourceNotFoundError


class MinistryService:  # pylint: disable=too-few-public-methods
    """Service to manage Ministry related operations."""

    @classmethod
    def find_all(cls):
        """Return all active ministries"""
        return Ministry.find_all()

    @classmethod
    def create_ministry(cls, ministry_dict):
        """Create new ministry"""
        cls._check_create_auth()
        current_sort_order = Ministry.query.order_by(Ministry.sort_order.desc()).first().sort_order
        ministry_dict["sort_order"] = current_sort_order + 1
        ministry = Ministry(**ministry_dict)
        ministry = ministry.flush()
        cls.create_special_fields(ministry)
        ministry.save()
        return ministry

    @classmethod
    def update_ministry(cls, ministry_id, ministry_dict):
        """Update ministry"""
        cls._check_create_auth()
        ministry = Ministry.find_by_id(ministry_id)

        if not ministry:
            raise ResourceNotFoundError('Ministry not found')

        ministry.update(ministry_dict)
        ministry.save()
        return ministry

    @classmethod
    def create_special_fields(cls, ministry: Ministry):
        """Create special fields for ministry"""
        # pylint: disable=import-outside-toplevel,cyclic-import
        from api.services.special_field import SpecialFieldService
        ministry_name = {
            "entity": EntityEnum.MINISTRY.value,
            "entity_id": ministry.id,
            "field_name": "name",
            "field_value": ministry.name,
            "active_from": ministry.date_created,
            "field_type": FieldTypeEnum.STRING.value,
        }

        ministry_abbreviation = {
            "entity": EntityEnum.MINISTRY.value,
            "entity_id": ministry.id,
            "field_name": "abbreviation",
            "field_value": ministry.abbreviation,
            "active_from": ministry.date_created,
            "field_type": FieldTypeEnum.INTEGER.value,
        }

        ministry_minister = {
            "entity": EntityEnum.MINISTRY.value,
            "entity_id": ministry.id,
            "field_name": "minister_id",
            "field_value": ministry.minister_id,
            "active_from": ministry.date_created,
            "field_type": FieldTypeEnum.STRING.value,
        }

        SpecialFieldService.create_special_field_entry(
            ministry_name, commit=False
        )
        SpecialFieldService.create_special_field_entry(
            ministry_abbreviation, commit=False
        )
        SpecialFieldService.create_special_field_entry(
            ministry_minister, commit=False
        )

    @classmethod
    def _check_create_auth(cls):
        """Check if user can create"""
        one_of_roles = (
            KeycloakRole.MANAGE_USERS.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)
