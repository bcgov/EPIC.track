"""Schema representing validation rules for work form"""
from datetime import datetime, timedelta
from dataclasses import InitVar, dataclass, fields
from typing import List, Optional

from epictrack_api.models import Event, Work
from epictrack_api.schemas.base import BaseSchema


@dataclass
class WorkSchema(BaseSchema):  # pylint: disable=too-many-instance-attributes
    """Schema representing validation rules for work"""

    id: Optional[int]
    project_id: int
    ministry_id: int
    current_phase_id: int
    federal_involvement_id: int
    eao_team_id: int
    responsible_epd_id: int
    work_lead_id: int
    work_type_id: int
    ea_act_id: int
    title: str
    short_description: str
    long_description: str
    work_short_status: str
    work_status_stoplight: str
    start_date: datetime
    anticipated_decision_date: datetime
    is_pcep_required: bool
    is_cac_recommended: bool
    is_active: bool
    dateformat: InitVar[str] = "%Y-%m-%dT%H:%M:%S.%fZ"

    def __init__(self, **kwargs: dict):  # pylint: disable=useless-super-delegation
        """Create a valid Schema."""
        super().__init__(**kwargs)

    def validate(self) -> dict:
        """Method to validate the given data"""
        errors = {}
        if self.id:
            work = WorkSchema(**Work.query.filter_by(id=self.id).first().as_dict())
            if work.work_type_id != int(self.work_type_id):
                errors["works.work_type_id"] = "Cannot update work type after creation"
            if work.ea_act_id != int(self.ea_act_id):
                errors["works.ea_act_id"] = "Cannot update EA Act after creation"
            if work.start_date != self.start_date:
                errors["works.start_date"] = "Cannot update start date after creation"
        else:
            if (
                Work.query.filter_by(
                    work_type_id=self.work_type_id,
                    project_id=self.project_id,
                    is_deleted=False,
                ).count() > 0
            ):
                errors[
                    "works.work_type_id"
                ] = "Work already exists for selected work type and project"
                errors[
                    "works.project_id"
                ] = "Work already exists for selected work type and project"
        return errors


@dataclass
class EventSchema(BaseSchema):  # pylint: disable=too-many-instance-attributes
    """Schema representing validation rules for event"""

    id: int
    milestone_id: int
    title: str
    anticipated_start_date: datetime
    anticipated_end_date: datetime

    is_active: bool
    is_complete: bool
    oh_attendance: Optional[int] = None
    outcome_id: Optional[int] = None
    duration: int = 0
    number_of_days: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    short_description: str = ""
    long_description: str = ""
    milestone_type_name: str = ""
    dateformat: InitVar[str] = "%Y-%m-%dT%H:%M:%S.%fZ"

    def __init__(self, **kwargs: dict):  # pylint: disable=useless-super-delegation
        """Create a valid Schema."""
        super().__init__(**kwargs)

    def __eq__(self, other: "EventSchema") -> bool:
        """Compares two objects for equality"""
        field_list = {
            f
            for f in fields(self)
            if f.name not in ["milestone_type_name", "number_of_days"]
        }
        for field in field_list:
            obj_value = getattr(self, field.name)
            other_value = getattr(other, field.name)
            if (obj_value or other_value) and obj_value != other_value:
                return False
        return True

    def validate_anticipated_date(
        self,
        anticipated_end_date: datetime = None,
        index: int = None,
        error_key: str = None,
    ) -> dict:
        """Method to validate last event end date and work's anticipated end date"""
        errors = {}
        if anticipated_end_date:
            event_end_date = getattr(self, "_".join(error_key.split()))
            if anticipated_end_date != event_end_date:
                errors["works.anticipated_decision_date"] = (
                    "Anticipated end date and last event's" +
                    f" {error_key} must be the same"
                )
                errors[f"works-events[{index}]"] = (
                    "Anticipated end date and last event's" +
                    f" {error_key} must be the same"
                )
        return errors

    def validate(
        self,
        index: int = None,
        prev_event: "EventSchema" = None,
        completed_events: List["EventSchema"] = None,
    ) -> dict:
        """Method to validate the given data"""
        errors = {}

        event_anticipated_start_date = self.anticipated_start_date
        event_anticipated_end_date = self.anticipated_end_date
        if event_anticipated_start_date and event_anticipated_end_date:
            if self.milestone_type_name == "PECP":
                number_of_days = int(self.number_of_days)
                if (
                    event_anticipated_end_date !=
                    event_anticipated_start_date + timedelta(days=number_of_days)
                ):
                    errors[f"works-events[{index}].anticipated_end_date"] = (
                        "Anticipated end date must be equal " +
                        " to anticipated start date + number of days"
                    )
                if self.start_date and self.end_date:
                    if self.end_date != self.start_date + timedelta(
                        days=number_of_days
                    ):
                        errors[f"works-events[{index}].end_date"] = (
                            "End date must be equal to start date " + "+ number of days"
                        )
            else:
                if event_anticipated_start_date != event_anticipated_end_date:
                    errors[f"works-events[{index}].anticipated_start_date"] = (
                        "Anticipated end date must be " +
                        " same as anticipated start date"
                    )
        if self.is_complete is True or self.end_date:
            if (
                not prev_event.is_complete or prev_event.end_date is None
            ) and index > 0:
                errors[f"works-events[{index}].is_complete"] = (
                    "Previous events must be completed before " +
                    "you can complete this event"
                )
            completed_event = next(
                (x for x in completed_events if x.id == int(self.id)), None
            )
            if completed_event:
                completed_event_obj = EventSchema(
                    **completed_event.as_dict(recursive=False)
                )
                if completed_event_obj != self:
                    errors[
                        f"works-events[{index}]"
                    ] = "Cannot make changes to completed events"
        return errors


@dataclass
class WorkPhaseSchema(BaseSchema):
    """Schema representing validation rules for work phase"""

    id: int
    work_id: Optional[int]
    phase_id: int
    duration: int
    start_date: datetime
    anticipated_end_date: datetime
    legislated: bool
    dateformat: InitVar[str] = "%Y-%m-%dT%H:%M:%S.%fZ"

    def __init__(self, **kwargs: dict):  # pylint: disable=useless-super-delegation
        """Create a valid Schema."""
        super().__init__(**kwargs)

    def validate(self, anticipated_end_date: datetime, index: int) -> dict:
        """Method to validate the given data"""
        errors = {}
        if anticipated_end_date != self.anticipated_end_date:
            errors["works.anticipated_decision_date"] = (
                "Anticipated end date and last phase's" + " end date must be the same"
            )
            errors[f"works-work_phases[{index}]"] = (
                "Anticipated end date and last phase's" + " end date must be the same"
            )
        return errors


@dataclass
class WorksFormSchema:
    """Schema representing validation rules for work form"""

    work: WorkSchema
    events: List[EventSchema]
    work_phases: List[WorkPhaseSchema]
    dateformat: InitVar[str] = "%Y-%m-%dT%H:%M:%S.%fZ"

    @classmethod
    def from_dict(cls, data: dict) -> "WorksFormSchema":
        """Return a valid WorkFormSchema from a dictionary."""
        work = data.get("works")
        work_phases = data.get("works-work_phases")
        events = data.get("works-events")
        return cls(
            **{
                "work": WorkSchema(**work),
                "work_phases": [
                    WorkPhaseSchema(**work_phase) for work_phase in work_phases
                ],
                "events": [EventSchema(**event) for event in events],
            }
        )

    def validate(self):
        """Method to validate the given data"""
        errors = {}
        work_errors = self.work.validate()
        errors.update(work_errors)
        phase_errors = self.work_phases[-1].validate(
            self.work.anticipated_decision_date, len(self.work_phases) - 1
        )
        errors.update(phase_errors)
        event_end_date = self.events[-1].end_date
        event_error_key = "end date"
        if not event_end_date:
            event_end_date = self.events[-1].anticipated_end_date
            event_error_key = "anticipated end date"
        event_ids = [e.id for e in self.events if e.id]
        completed_events = Event.query.filter(
            Event.id.in_(event_ids), Event.is_complete.is_(True)
        ).all()
        last_event_errors = self.events[-1].validate_anticipated_date(
            self.work.anticipated_decision_date, len(self.events) - 1, event_error_key
        )
        errors.update(last_event_errors)

        for index, event in enumerate(self.events):
            event_errors = event.validate(
                index=index,
                prev_event=self.events[index - 1],
                completed_events=completed_events,
            )
            errors.update(event_errors)

        if errors:
            return errors
        return True
