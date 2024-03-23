"""Base for all action handlers"""
from abc import ABC, abstractmethod

from api.models.action import ActionEnum
from api.models.event import Event


class ActionFactory(ABC):  # pylint: disable=too-few-public-methods
    """Base class for action handlers"""

    @abstractmethod
    def run(self, source_event: Event, params: dict) -> None:
        """Perform the action"""

    def get_additional_params(
        self, source_event: Event, params: dict  # pylint: disable=unused-argument
    ) -> dict:
        """Returns the derived additional parameters required to perform action from templates"""
        return params


ACTION_HANDLER_CLASS_MAPS = {
    ActionEnum.LOCK_WORK_START_DATE: "LockWorkStartDate",
    ActionEnum.SET_PROJECT_STATUS: "SetProjectStatus",
    ActionEnum.ADD_EVENT: "AddEvent",
    ActionEnum.ADD_PHASE: "AddPhase",
    ActionEnum.CREATE_WORK: "CreateWork",
    ActionEnum.SET_EVENT_DATE: "SetEventDate",
    ActionEnum.SET_EVENTS_STATUS: "SetEventsStatus",
    ActionEnum.SET_PHASES_STATUS: "SetPhasesStatus",
    ActionEnum.SET_WORK_DECISION_MAKER: "SetWorkDecisionMaker",
    ActionEnum.SET_WORK_STATE: "SetWorkState",
    ActionEnum.CHANGE_PHASE_END_EVENT: "ChangePhaseEndEvent",
    ActionEnum.SET_FEDERAL_INVOLVEMENT: "SetFederalInvolvement",
    ActionEnum.SET_PROJECT_STATE: "SetProjectState",
}
