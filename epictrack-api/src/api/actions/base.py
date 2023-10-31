"""Base for all action handlers"""
from abc import ABC, abstractmethod

from api.models.action import ActionEnum
from api.models.action_configuration import ActionConfiguration
from api.models.event import Event


class ActionFactory(ABC):  # pylint: disable=too-few-public-methods
    """Base class for action handlers"""

    def __init__(self, source_event: Event, action_configuration: ActionConfiguration):
        """Constructor"""
        self.source_event = source_event
        self.action_configuration = action_configuration
        super().__init__()

    @abstractmethod
    def run(self) -> None:
        """Perform the action"""

    @abstractmethod
    def get_additional_params(self) -> dict:
        """Returns the derived additional parameters required to perform action from templates"""


ACTION_HANDLER_CLASS_MAPS = {
    ActionEnum.LOCK_WORK_START_DATE: "LockWorkStartDate",
    ActionEnum.SET_PROJECT_STATUS: "SetProjectStatus",
    # ActionEnum.ADD_EVENT: "AddEvent",
    # ActionEnum.ADD_PHASE: "AddPhase",
    ActionEnum.CREATE_WORK: "CreateWork",
    # ActionEnum.SET_EVENT_DATE: "SetEventDate",
    ActionEnum.SET_EVENTS_STATUS: "SetEventsStatus",
    ActionEnum.SET_PHASES_STATUS: "SetPhasesStatus",
    # ActionEnum.SET_WORK_DECISION_MAKER: "SetWorkDecisionMaker",
    ActionEnum.SET_WORK_STATE: "SetWorkState"
}
