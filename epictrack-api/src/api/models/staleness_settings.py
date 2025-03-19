"""Models for Staleness Settings."""

import enum
from sqlalchemy import Column, Integer, Boolean, Enum
from .base_model import BaseModelVersioned


class StalenessTypeEnum(enum.Enum):
    """Enum for StalenessType"""

    ISSUES = 'ISSUES'
    STATUS = 'STATUS'


class StalenessSettings(BaseModelVersioned):
    """Model class for Staleness Settings."""

    __tablename__ = 'staleness_settings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    staleness_type = Column(Enum(StalenessTypeEnum), nullable=False, unique=True)
    warning_length = Column(Integer, nullable=False)
    staleness_length = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    is_deleted = Column(Boolean, nullable=False, default=False)

    def as_dict(self): # pylint:disable=arguments-differ
        """Return Json representation."""
        return {
            'id': self.id,
            'staleness_type': self.staleness_type.value,
            'warning_length': self.warning_length,
            'staleness_length': self.staleness_length,
            'is_active': self.is_active,
        }

    @classmethod
    def find_by_type(cls, staleness_type):
        """Find staleness setting by staleness_type."""
        return cls.query.filter_by(staleness_type=staleness_type).one_or_none()

    @classmethod
    def find_all_active(cls):
        """Find all active staleness settings."""
        return cls.query.filter_by(is_active=True, is_deleted=False).all()
