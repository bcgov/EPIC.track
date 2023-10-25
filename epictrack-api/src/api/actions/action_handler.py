"""Handles action handlers"""
import re
from importlib import import_module

from api.actions.base import ActionBase
from api.exceptions import UnprocessableEntityError


class ActionHandler:  # pylint: disable=too-few-public-methods
    """Handles action handlers"""

    def __init__(self, action_class_name: str) -> None:
        """Initialize and configure the action handler class"""
        module_name = self._convert_class_name_to_module_name(action_class_name)
        action_classes_path = f"api.actions.{module_name}"
        try:
            action_module = import_module(action_classes_path)
            self.action_class: ActionBase = getattr(action_module, action_class_name)
        except ModuleNotFoundError as e:
            print(f"{e.name} action handler module not found")
            self.action_class = None
        except AttributeError as e:
            raise UnprocessableEntityError(f"Action class {e.name} not configured properly.") from e

    def _convert_class_name_to_module_name(self, class_name: str) -> str:
        """Convert class name into valid python module names

        Eg: ActionHandler -> action_handler
        """
        module_name = re.sub(
            "([A-Z])",
            r'_\1',
            class_name,
        )
        # Discard preceding _
        return module_name[1:].lower()

    def apply(self, params: dict = None) -> None:
        """Perform the action"""
        # So that actions not done yet won't raise errors
        if self.action_class:
            self.action_class().run(params)
