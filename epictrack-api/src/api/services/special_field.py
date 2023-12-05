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
"""Service to manage Special fields."""
from flask import current_app
from psycopg2.extras import DateTimeTZRange

from api.exceptions import ResourceNotFoundError, UnprocessableEntityError
from api.models import SpecialField, db


class SpecialFieldService:  # pylint:disable=too-few-public-methods
    """Service to manage special field related operations"""

    @classmethod
    def find_all_by_params(cls, args: dict):
        """Find special fields by params"""
        current_app.logger.debug(f"find act sections by params {args}")
        return SpecialField.find_by_params(args)

    @classmethod
    def create_special_field_entry(cls, payload: dict):
        """Create special field entry"""
        # payload["time_range"] = DateTimeTZRange([payload["time_range"]] + ["[)"])
        existing = cls.check_existence(payload)
        if existing:
            raise UnprocessableEntityError("Value with overlapping time range exists. Please fix it before continuing.")
        payload["time_range"] = DateTimeTZRange(
            payload.pop("active_from"), payload.pop("active_to", None), "[)"
        )
        entry = SpecialField(**payload)
        entry.save()
        return entry

    @classmethod
    def update_special_field_entry(cls, special_field_id: int, payload: dict):
        """Create special field entry"""
        exists = cls.check_existence(payload, special_field_id)
        if exists:
            raise UnprocessableEntityError("Value with overlapping time range exists. Please fix it before continuing.")
        special_field = SpecialField.find_by_id(special_field_id)
        if not special_field:
            raise ResourceNotFoundError(f"Special field entry with id '{special_field_id}' not found")
        payload["time_range"] = DateTimeTZRange(
            payload.pop("active_from"), payload.pop("active_to", None), "[)"
        )
        special_field = special_field.update(payload)
        return special_field

    @classmethod
    def check_existence(cls, payload: dict, special_field_id: int = None) -> bool:
        """Validate time range"""
        new_range = DateTimeTZRange(payload["active_from"], payload["active_to"], "[)")
        exists_query = db.session.query(SpecialField).filter(
            SpecialField.entity == payload["entity"],
            SpecialField.entity_id == payload["entity_id"],
            SpecialField.field_name == payload["field_name"],
            SpecialField.time_range.overlaps(new_range),
        )
        if special_field_id:
            exists_query = exists_query.filter(SpecialField.id != special_field_id)
        return bool(exists_query.first())

    @classmethod
    def find_by_id(cls, _id):
        """Find special field entry by id."""
        special_field = SpecialField.find_by_id(_id)
        return special_field
