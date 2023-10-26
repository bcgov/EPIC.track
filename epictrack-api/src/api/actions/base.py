"""Base for all action handlers"""
from abc import ABC, abstractmethod

from api.models.action import ActionEnum


class ActionFactory(ABC):  # pylint: disable=too-few-public-methods
    """Base class for action handlers"""

    @abstractmethod
    def run(self, params):
        """Perform the action"""


ACTION_HANDLER_CLASS_MAPS = {
    ActionEnum.LOCK_WORK_START_DATE : "DisableWorkStartDate"
}
