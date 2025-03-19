"""Service to manage staff elevated role related operations"""
from flask import current_app

from api.exceptions import ResourceNotFoundError
from api.models.staff_elevated_role import StaffElevatedRole as StaffElevatedRoleModel
from api.utils.roles import Role as KeycloakRole
from api.services import authorisation


class StaffElevatedRoleService:
    """Service to manage staff elevated role related operations"""

    @classmethod
    def find(cls, identifier):
        """Find staff elevated role by ID"""
        current_app.logger.debug("find staff elevated role by ID")
        staff_elevated_role = StaffElevatedRoleModel.find_by_id(identifier)
        if not staff_elevated_role:
            raise ResourceNotFoundError(f"Staff Elevated Role with id '{identifier}' not found")
        return staff_elevated_role

    @classmethod
    def find_all(cls):
        """Find all staff elevated roles"""
        current_app.logger.debug("find all staff elevated roles")
        return StaffElevatedRoleModel.find_all(default_filters=False)

    @classmethod
    def find_all_active(cls):
        """Find all active staff elevated roles"""
        current_app.logger.debug("find all active staff elevated roles")
        return StaffElevatedRoleModel.find_all_active_roles()

    @classmethod
    def find_by_id(cls, identifier, is_active=True):
        """Find staff elevated role by ID"""
        current_app.logger.debug("find staff elevated role by ID")
        staff_elevated_role = StaffElevatedRoleModel.find_by_id(identifier, include_inactive=not is_active)
        if not staff_elevated_role:
            raise ResourceNotFoundError(f"Staff Elevated Role with id '{identifier}' not found")
        return staff_elevated_role

    @classmethod
    def find_by_staff_id(cls, staff_id, is_active=True):
        """Find staff elevated roles by staff ID"""
        current_app.logger.debug("find staff elevated roles by staff_ID")
        staff_elevated_role = StaffElevatedRoleModel.find_by_staff_id(staff_id, include_inactive=not is_active)
        if staff_elevated_role:
            return staff_elevated_role
        raise ResourceNotFoundError(f"Staff Elevated Role with staff_id '{staff_id}' not found.")

    @classmethod
    def find_by_elevated_role_id(cls, elevated_role_id, is_active=True):
        """Find staff elevated roles by elevated role ID"""
        return StaffElevatedRoleModel.find_by_elevated_role_id(elevated_role_id, include_inactive=not is_active)

    @classmethod
    def edit_staff_elevated_role(cls, staff_elevated_role_id, staff_elevated_role_data):
        """Edit an existing staff elevated role, and save it only if there are changes."""
        cls._check_auth()

        staff_elevated_role = StaffElevatedRoleService.find_by_id(staff_elevated_role_id, is_active=False)
        if not staff_elevated_role:
            raise ResourceNotFoundError("Staff Elevated Role does not exist")

        # Create a flag to track changes
        has_changes = False

        for key, value in staff_elevated_role_data.items():
            if key == "is_active" and getattr(staff_elevated_role, 'is_deleted') == value:
                setattr(staff_elevated_role, 'is_deleted', not value)
                has_changes = True
            if getattr(staff_elevated_role, key) != value:
                setattr(staff_elevated_role, key, value)
                has_changes = True
        if has_changes:
            staff_elevated_role.save()
        return staff_elevated_role

    @classmethod
    def create(cls, elevated_role_data):
        """Create a new staff elevated role"""
        cls._check_auth()

        new_staff_elevated_role = StaffElevatedRoleModel(
            **elevated_role_data
        )
        return new_staff_elevated_role.save()

    @classmethod
    def delete(cls, staff_elevated_role_id: int):
        """Delete staff elevated role by id."""
        cls._check_auth()

        staff_elevated_role = StaffElevatedRoleModel.find_by_id(staff_elevated_role_id)
        staff_elevated_role.is_deleted = True
        staff_elevated_role.is_active = False
        staff_elevated_role.save()
        return True

    @classmethod
    def _check_auth(cls):
        """Check if user has manage users role"""
        one_of_roles = (
            KeycloakRole.MANAGE_USERS.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)
