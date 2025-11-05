"""Service to manage Phase Overages Responsibility operations"""
from api.exceptions import ResourceNotFoundError
from api.models import db
from api.models.phase_overage_responsibility import PhaseOverageResponsibility as PhaseOverageResponsibilityModel, OverageResponsibilityEnum
from api.utils.roles import Role as KeycloakRole, Membership
from api.services import authorisation


class PhaseOverageResponsibilityService:
    """Service to manage Phase Overages Responsibilities"""

    @classmethod
    def find_all(cls):
        """Find all staff elevated roles"""
        return PhaseOverageResponsibilityModel.find_all(default_filters=False)

    @classmethod
    def find_by_id(cls, identifier: int, is_deleted=False):
        """Find responsibility by ID"""
        item = PhaseOverageResponsibilityModel.find_by_id(identifier, include_deleted=is_deleted)
        if not item:
            raise ResourceNotFoundError(f"PhaseOveragesResponsibility with id '{identifier}' not found")
        return item

    @classmethod
    def find_by_work_phase_id(cls, work_phase_id: int, is_deleted=False):
        """Find responsibilities by work phase ID"""
        items = PhaseOverageResponsibilityModel.find_by_work_phase_id(work_phase_id, is_deleted=is_deleted)
        return items

    @classmethod
    def create(cls, data: dict):
        """Create a new phase overage responsibility"""
        cls._check_auth(data.pop("work_id", None))
        if "responsibility" in data and isinstance(data["responsibility"], str):
            data["responsibility"] = OverageResponsibilityEnum[data["responsibility"]]

        new_item = PhaseOverageResponsibilityModel(**data)
        db.session.add(new_item)
        db.session.commit()
        db.session.refresh(new_item)
        return new_item

    @classmethod
    def update(cls, identifier: int, data: dict):
        """Update an existing responsibility"""
        cls._check_auth(data.pop("work_id", None))
        item = cls.find_by_id(identifier, is_deleted=False)

        has_changes = False
        for key, value in data.items():
            if getattr(item, key) != value:
                setattr(item, key, value)
                has_changes = True

        if has_changes:
            item.save()
        return item

    @classmethod
    def delete(cls, identifier: int, work_id: int):
        """Soft-delete a responsibility"""
        cls._check_auth(work_id=work_id)
        item = cls.find_by_id(identifier)
        item.is_deleted = True
        return item.save()

    @classmethod
    def _check_auth(cls, work_id: int = None):
        """Check if user has extended edit role or is team member"""
        one_of_roles = (
            KeycloakRole.EXTENDED_EDIT.value, Membership.TEAM_MEMBER.value
        )
        authorisation.check_auth(one_of_roles=one_of_roles, work_id=work_id)
