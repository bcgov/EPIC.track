"""Models for Elevated Roles and Staff Elevated Roles."""

import enum

from sqlalchemy import Column, Integer, String

from .base_model import BaseModelVersioned


class ElevatedRoleEnum(enum.Enum):
    """Enum for ElevatedRole"""

    MANAGE_FIRST_NATIONS = 1


class ElevatedRole(BaseModelVersioned):
    """Model class for Elevated Roles."""

    __tablename__ = 'elevated_roles'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(String(500))
    sort_order = Column(Integer, nullable=False)

    @classmethod
    def find_by_name(cls, name):
        """Find elevated role by name."""
        return cls.query.filter_by(name=name).one_or_none()

    @classmethod
    def find_all_by_names(cls, names):
        """Find elevated role by name."""
        return cls.query.filter(ElevatedRole.name.in_(names)).all()
