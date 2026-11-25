"""Helper functions to generate unit test payloads"""
from copy import copy
from datetime import timedelta
from http import HTTPStatus

from api.models import Event, EventConfiguration, WorkPhase, db
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from tests.utilities.factory_scenarios import TestWorkInfo
from tests.utilities.factory_utils import factory_project_model, factory_staff_model


def prepare_work_payload(work_data: dict = TestWorkInfo.work1.value):
    """Prepares the work payload by adding valid foreign key values"""
    payload = copy(work_data)
    project = factory_project_model()
    epd = factory_staff_model()
    work_lead = factory_staff_model()
    decision_maker = factory_staff_model()
    payload["project_id"] = project.id
    payload["responsible_epd_id"] = epd.id
    payload["work_lead_id"] = work_lead.id
    payload["decision_by_id"] = decision_maker.id
    return payload


def add_optional_milestone(client, headers, work_id):
    """Add an optional milestone to the work's first phase, as a user does from the work plan."""
    configuration = (
        db.session.query(EventConfiguration)
        .join(WorkPhase, EventConfiguration.work_phase_id == WorkPhase.id)
        .filter(
            WorkPhase.work_id == work_id,
            EventConfiguration.event_position == EventPositionEnum.INTERMEDIATE,
            EventConfiguration.visibility == EventTemplateVisibilityEnum.OPTIONAL,
            EventConfiguration.multiple_days.is_(False),
            EventConfiguration.is_active.is_(True),
        )
        .order_by(WorkPhase.sort_order, EventConfiguration.sort_order)
        .first()
    )
    phase = configuration.work_phase
    response = client.post(
        f"/api/v1/milestones/workphases/{phase.id}/events",
        json={
            "name": configuration.name,
            "event_configuration_id": configuration.id,
            "anticipated_date": (phase.start_date + timedelta(days=1)).isoformat(),
        },
        headers=headers,
    )
    assert response.status_code == HTTPStatus.CREATED, response.get_data(as_text=True)
    return db.session.get(Event, response.json["id"])
