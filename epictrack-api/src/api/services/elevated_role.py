"""Service to manage Elevated Roles."""
from flask import current_app
from api.models.elevated_role import ElevatedRole


class ElevatedRoleService:  # pylint:disable=too-few-public-methods
    """Service to manage elevated role related operations"""

    @classmethod
    def find_all(cls):
        """Find all elevated roles"""
        current_app.logger.debug("find elevated_roles")
        elevated_roles = ElevatedRole.find_all()
        return elevated_roles

    @classmethod
    def find_by_name(cls, name):
        """Find elevated role by name"""
        current_app.logger.debug("find elevated_role by name")
        elevated_role = ElevatedRole.find_by_name(name)
        return elevated_role

    @classmethod
    def find_all_by_names(cls, names):
        """Find elevated roles by names"""
        current_app.logger.debug("find elevated_roles by names")
        elevated_roles = ElevatedRole.find_all_by_names(names)
        return elevated_roles
