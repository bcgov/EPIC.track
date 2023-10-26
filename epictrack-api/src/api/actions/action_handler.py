"""Handles action handlers"""
import re
from importlib import import_module

from api.actions.base import ACTION_HANDLER_CLASS_MAPS, ActionFactory
from api.exceptions import UnprocessableEntityError
from api.models.action import ActionEnum


class ActionHandler:  # pylint: disable=too-few-public-methods
    """Handles action handlers"""

    def __init__(self, action_class_enum: ActionEnum) -> None:
        """Initialize and configure the action handler class"""
        action_classes_path = f"api.actions"
        try:
            action_class_name = ACTION_HANDLER_CLASS_MAPS[action_class_enum]
            action_module = import_module(action_classes_path)
            self.action_class: ActionFactory = getattr(action_module, action_class_name)
        except (ModuleNotFoundError, KeyError) as e:
            print(f"{action_class_enum.name} action handler module not found")
            self.action_class = None
        except AttributeError as e:
            raise UnprocessableEntityError(f"Action class {action_class_name} not configured properly.") from e

    def apply(self, params: dict = None) -> None:
        """Perform the action"""
        # So that actions not done yet won't raise errors
        if self.action_class:
            self.action_class().run(params)
