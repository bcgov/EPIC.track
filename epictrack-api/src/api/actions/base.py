"""Base for all action handlers"""
from abc import ABC, abstractmethod


class ActionBase(ABC):  # pylint: disable=too-few-public-methods
    """Base class for action handlers"""

    @abstractmethod
    def run(self, params):
        """Perform the action"""
