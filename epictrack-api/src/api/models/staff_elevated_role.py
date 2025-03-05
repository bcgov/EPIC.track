"""Model for Staff Elevated Roles."""

from sqlalchemy import Boolean, Column, ForeignKey, Integer
from sqlalchemy.orm import relationship

from api.models.base_model import BaseModelVersioned


class StaffElevatedRole(BaseModelVersioned):
    """Model class for Staff Elevated Roles."""

    __tablename__ = 'staff_elevated_roles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    staff_id = Column(Integer, ForeignKey('staffs.id', ondelete='CASCADE'), nullable=False)
    elevated_role_id = Column(Integer, ForeignKey('elevated_roles.id', ondelete='CASCADE'), nullable=False)
    is_active = Column(Boolean(), default=True, nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)

    staff = relationship('Staff', foreign_keys=[staff_id], lazy='select')
    elevated_role = relationship('ElevatedRole', foreign_keys=[elevated_role_id], lazy='select')

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'is_active': self.is_active,
            'elevated_role_id': self.elevated_role_id,
            'elevated_role': self.elevated_role.as_dict(),
            'staff_id': self.staff_id,
            'staff': self.staff.as_dict(),
        }

    @classmethod
    def find_all_active_roles(cls):
        """Return all active roles."""
        return cls.query.filter_by(is_active=True, is_deleted=False)

    @classmethod
    def find_by_id(cls, identifier: int, include_inactive=False):
        """Return by id."""
        if include_inactive:
            return super().find_by_id(identifier)
        return cls.query.filter_by(id=identifier, is_active=True).first()

    @classmethod
    def find_active_roles_by_staff_id(cls, staff_id: int):
        """Return active roles by staff id."""
        return cls.query.filter_by(staff_id=staff_id, is_active=True, is_deleted=False)

    @classmethod
    def find_active_roles_by_elevated_role_id(cls, elevated_role_id: int):
        """Return active roles by elevated_role id."""
        return cls.query.filter_by(elevated_role_id=elevated_role_id, is_active=True, is_deleted=False)

    @classmethod
    def find_by_elevated_role_id(cls, elevated_role_id: int, include_inactive=False):
        """Return by elevated_role id."""
        if include_inactive:
            return cls.query.filter_by(elevated_role_id=elevated_role_id).all()
        return cls.query.filter_by(elevated_role_id=elevated_role_id, is_active=True).all()

    @classmethod
    def find_by_staff_id(cls, staff_id: int, include_inactive=False):
        """Return by staff id."""
        if include_inactive:
            return cls.query.filter_by(staff_id=staff_id).all()
        return cls.query.filter_by(staff_id=staff_id, is_active=True).all()
