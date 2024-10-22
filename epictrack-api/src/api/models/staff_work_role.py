# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Model to handle all operations related to StaffWorkRole."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from .base_model import BaseModelVersioned


class StaffWorkRole(BaseModelVersioned):
    """Model class for StaffWorkRole."""

    __tablename__ = 'staff_work_roles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    is_deleted = Column(Boolean(), default=False, nullable=False)
    work_id = Column(ForeignKey('works.id'), nullable=False)
    role_id = Column(ForeignKey('roles.id'), nullable=False)
    staff_id = Column(ForeignKey('staffs.id'), nullable=False)

    work = relationship('Work', foreign_keys=[work_id], lazy='select')
    role = relationship('Role', foreign_keys=[role_id], lazy='select')
    staff = relationship('Staff', foreign_keys=[staff_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'work_id': self.work_id,
            'role': self.role.as_dict(),
            'staff': self.staff.as_dict()
        }

    @classmethod
    def find_by_work_id(cls, work_id: int):
        """Return by work id."""
        return cls.query.filter_by(work_id=work_id)

    @classmethod
    def find_by_role_and_work(cls, work_id: int, role_id):
        """Return by work and role ids."""
        return cls.query.filter(
            StaffWorkRole.work_id == work_id,
            StaffWorkRole.role_id == role_id,
            StaffWorkRole.is_deleted.is_(False),
            StaffWorkRole.is_active.is_(True),
        ).all()

    @classmethod
    def find_one_by_role_and_work(cls, work_id: int, role_id):
        """Return by work and role ids."""
        return cls.query.filter(
            StaffWorkRole.work_id == work_id,
            StaffWorkRole.role_id == role_id,
            StaffWorkRole.is_deleted.is_(False),
            StaffWorkRole.is_active.is_(True),
        ).first()

    @classmethod
    def find_by_work_and_staff_and_role(cls, work_id: int, staff_id: object, role_id: object, work_staff_id: object):
        """Return by work, staff and role ids."""
        query = cls.query.filter(
            StaffWorkRole.work_id == work_id,
            StaffWorkRole.staff_id == staff_id,
            StaffWorkRole.is_deleted.is_(False),
            StaffWorkRole.role_id == role_id,
        )

        if work_staff_id:
            query = query.filter(StaffWorkRole.id != work_staff_id)

        return query.all()

    @classmethod
    def find_one_by_work_and_staff_and_role(  # pylint:disable=too-many-arguments
            cls,
            work_id: int,
            staff_id: object,
            role_id: object,
            work_staff_id: object,
            is_active: bool = None
    ):
        """Return by work, staff and role ids."""
        query = cls.query.filter(
            StaffWorkRole.work_id == work_id,
            StaffWorkRole.staff_id == staff_id,
            StaffWorkRole.is_deleted.is_(False),
            StaffWorkRole.role_id == role_id,
        )

        if is_active is not None:
            query = query.filter(StaffWorkRole.is_active.is_(is_active))

        if work_staff_id:
            query = query.filter(StaffWorkRole.id != work_staff_id)

        return query.first()
