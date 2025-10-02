"""Model for Phase Overage Responsibility."""
import enum
from sqlalchemy import Boolean, Column, Integer, ForeignKey, Enum

from api.models.base_model import BaseModelVersioned


class OverageResponsibilityEnum(enum.Enum):
    """Enum for Responsibility."""

    PROPONENT = "Proponent"
    EAO = "EAO"
    SECONDARY_MINISTRY = "Secondary Ministry"
    FEDERAL_AGENCY = "Federal Agency"
    NATION = "Nation"
    PARTNER_AGENCY = "Partner Agency"

    @classmethod
    def from_string(cls, display_str):
        """Get enum value from display string."""
        for member in cls:
            if member.value == display_str:
                return member
        raise ValueError(f"No enum value found for display string '{display_str}'")


class PhaseOverageResponsibility(BaseModelVersioned):
    """Model class for Phase Overage Responsibility."""

    __tablename__ = "phase_overage_responsibility"

    id = Column(Integer, primary_key=True)
    work_phase_id = Column(Integer, ForeignKey("work_phases.id", ondelete="CASCADE"), nullable=False)
    responsibility = Column(Enum(OverageResponsibilityEnum), nullable=False)
    is_deleted = Column(Boolean(), default=False, nullable=False)

    def as_dict(self):  # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'is_active': self.is_active,
            'responsibility': self.responsibility,
            'work_phase_id': self.work_phase_id,
        }

    @classmethod
    def find_by_id(cls, identifier: int, include_deleted=False):
        """Return by id."""
        if include_deleted:
            return super().find_by_id(identifier)
        return cls.query.filter_by(id=identifier, is_deleted=False).first()

    @classmethod
    def find_by_work_phase_id(cls, work_phase_id: int, is_deleted=False):
        """Return responsibilities for a given work phase."""
        query = cls.query.filter_by(work_phase_id=work_phase_id, is_deleted=is_deleted)
        return query.all()
