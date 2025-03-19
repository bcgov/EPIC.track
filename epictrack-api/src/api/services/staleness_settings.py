"""Service to manage staleness settings related operations"""
from flask import current_app

from api.exceptions import ResourceNotFoundError
from api.models.staleness_settings import StalenessSettings
from api.utils.roles import Role as KeycloakRole
from api.services import authorisation


class StalenessSettingsService:
    """Service to manage staleness settings related operations"""

    @classmethod
    def find(cls, identifier):
        """Find staleness settings by ID"""
        current_app.logger.debug("find staleness settings by ID")
        staleness_settings = StalenessSettings.find_by_id(identifier)
        if not staleness_settings:
            raise ResourceNotFoundError(f"Staleness Settings with id '{identifier}' not found")
        return staleness_settings

    @classmethod
    def find_by_id(cls, identifier):
        """Find staleness settings by ID"""
        current_app.logger.debug("find staleness settings by ID")
        staleness_settings = StalenessSettings.find_by_id(identifier)
        if not staleness_settings:
            raise ResourceNotFoundError(f"Staleness Settings with id '{identifier}' not found")
        return staleness_settings

    @classmethod
    def find_all(cls):
        """Find all staleness settings"""
        current_app.logger.debug("find all staleness settings")
        return StalenessSettings.find_all(default_filters=False)

    @classmethod
    def find_all_active(cls):
        """Find all active staleness settings"""
        current_app.logger.debug("find all active staleness settings")
        return StalenessSettings.find_all_active()

    @classmethod
    def find_by_type(cls, staleness_type):
        """Find staleness settings by type"""
        current_app.logger.debug("find_by_type staleness settings by type {staleness_type}")
        return StalenessSettings.find_by_type(staleness_type)

    @classmethod
    def edit_staleness_settings(cls, staleness_type, staleness_settings_data):
        """Edit an existing staleness settings, and save it only if there are changes."""
        cls._check_auth()
        current_app.logger.debug(f"Edit staleness settings for {staleness_type}")
        staleness_settings = StalenessSettingsService.find_by_type(staleness_type)
        if not staleness_settings:
            raise ResourceNotFoundError("Staleness Settings does not exist")

        # Create a flag to track changes
        has_changes = False

        for key, value in staleness_settings_data.items():
            if getattr(staleness_settings, key) != value:
                setattr(staleness_settings, key, value)
                has_changes = True
        if has_changes:
            staleness_settings.save()
        return staleness_settings

    @classmethod
    def _check_auth(cls):
        """Check if the user has the required roles."""
        one_of_roles = (
            KeycloakRole.MANAGE_USERS.value,
        )
        current_app.logger.debug(f"C HEHERE   he roles: {one_of_roles}")
        authorisation.check_auth(one_of_roles=one_of_roles)
