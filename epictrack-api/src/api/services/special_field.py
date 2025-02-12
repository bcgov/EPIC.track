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
from datetime import datetime, timedelta
from typing import List, Optional, Union

from flask import current_app
from psycopg2.extras import DateTimeTZRange
from sqlalchemy import func, or_
from sqlalchemy.dialects.postgresql.ranges import Range

from api.exceptions import ResourceNotFoundError, BadRequestError
from api.models import SpecialField, db
from api.models.role import RoleEnum
from api.models.special_field import EntityEnum
from api.utils.constants import SPECIAL_FIELD_ENTITY_MODEL_MAPS


class SpecialFieldService:  # pylint:disable=too-many-arguments
    """Service to manage special field related operations"""

    @classmethod
    def find_all_by_params(cls, args: dict):
        """Find special fields by params"""
        current_app.logger.debug(f"find act sections by params {args}")
        return SpecialField.find_by_params(args)

    @classmethod
    def create_special_field_entry(cls, payload: dict, commit: bool = True):
        """Create special field entry"""
        upper_limit = cls._get_upper_limit(payload)
        payload["time_range"] = DateTimeTZRange(
            payload.pop("active_from"), upper_limit, bounds="[)"
        )
        special_field = SpecialField(**payload)
        special_field.flush()
        cls._update_original_model(special_field)
        if commit:
            db.session.commit()
        return special_field

    @classmethod
    def update_special_field_entry(
        cls, special_field_id: int, payload: dict, commit: bool = True
    ):
        """Create special field entry"""
        special_field = SpecialField.find_by_id(special_field_id)
        upper_limit = cls._get_upper_limit(payload, special_field_id)

        if not special_field:
            raise ResourceNotFoundError(
                f"Special field entry with id '{special_field_id}' not found"
            )
        payload["time_range"] = Range(
            payload.pop("active_from"), upper_limit, bounds="[)"
        )
        special_field = special_field.update(payload, commit=commit)
        cls._update_original_model(special_field)
        if commit:
            db.session.commit()
        return special_field

    @classmethod
    def find_by_id(cls, _id):
        """Find special field entry by id."""
        special_field = SpecialField.find_by_id(_id)
        return special_field

    @classmethod
    def _get_upper_limit(
        cls, payload: dict, special_field_id: int = None
    ) -> Union[datetime, None]:
        """Finds and returns the upper limit of time range and updates existing entries to match new time range"""
        exists_query = db.session.query(SpecialField).filter(
            SpecialField.entity == payload["entity"],
            SpecialField.entity_id == payload["entity_id"],
            SpecialField.field_name == payload["field_name"],
            or_(
                SpecialField.time_range.contains(payload["active_from"]),
                func.lower(SpecialField.time_range) > payload["active_from"],
            ),
        )
        if special_field_id:
            exists_query = exists_query.filter(SpecialField.id != special_field_id)
        existing_entry = exists_query.order_by(SpecialField.time_range.asc()).first()
        upper_limit = None
        if existing_entry:
            if existing_entry.time_range.lower > payload["active_from"]:
                upper_limit = existing_entry.time_range.lower - timedelta(days=1)
            else:
                upper_limit = existing_entry.time_range.upper

                if payload["active_from"] - timedelta(days=1) < existing_entry.time_range.lower:
                    new_range_upper = payload["active_from"]
                else:
                    new_range_upper = payload["active_from"] - timedelta(days=1)

                new_range = DateTimeTZRange(
                    existing_entry.time_range.lower,
                    new_range_upper,
                    "[)",
                )

                if new_range.lower == new_range.upper:
                    raise BadRequestError(
                        "Invalid from date entry."
                    )
                existing_entry.time_range = new_range
                db.session.add(existing_entry)
        return upper_limit

    @classmethod
    def _update_original_model(cls, special_field_entry: SpecialField) -> None:
        """If `special_field_entry` is latest, update original table with new value"""
        if special_field_entry.time_range.upper is None:
            # Only update the original model if it is listed in the SPECIAL_FIELD_ENTITY_MODEL_MAPS
            # Some fields do not need to get updated here like WORK_ISSUES
            try:
                model_class = SPECIAL_FIELD_ENTITY_MODEL_MAPS[
                    EntityEnum(special_field_entry.entity)
                ]
            except KeyError:
                model_class = None
            if model_class:
                model_class.query.filter(
                    model_class.id == special_field_entry.entity_id
                ).update({special_field_entry.field_name: special_field_entry.field_value})
            cls.run_other_related_updates(special_field_entry)

    @classmethod
    def run_other_related_updates(cls, special_field: SpecialField):
        """Run other related updates based on special field entry."""
        from api.services.work import WorkService  # pylint: disable=import-outside-toplevel
        special_field_entity = EntityEnum(special_field.entity).value
        if special_field_entity == EntityEnum.WORK.value:
            data = {
                "staff_id": special_field.field_value,
                "is_active": True
            }
            if special_field.field_name == "responsible_epd_id":
                data = {
                    **data,
                    "role_id": RoleEnum.RESPONSIBLE_EPD.value
                }
                WorkService.replace_work_staff(
                    special_field.entity_id, data
                )
            if special_field.field_name == "work_lead_id":
                data = {
                    **data,
                    "role_id": RoleEnum.TEAM_LEAD.value
                }
                WorkService.replace_work_staff(
                    special_field.entity_id, data
                )

    @classmethod
    def find_special_history_by_date_range(
        cls,
        entity: EntityEnum,
        field_name: str,
        from_date: datetime,
        to_date: datetime,
        entity_ids: Optional[List[int]] = None,
    ) -> List[SpecialField]:
        """Find special field entries of given entity within given date range."""
        # time_range = DateRange(from_date, to_date)
        time_range = DateTimeTZRange(from_date, to_date)
        query = db.session.query(SpecialField).filter(
            SpecialField.entity == entity,
            SpecialField.field_name == field_name,
            SpecialField.time_range.overlaps(time_range)
        )
        if entity_ids:
            query = query.filter(SpecialField.entity_id.in_(entity_ids))
        return query.all()
