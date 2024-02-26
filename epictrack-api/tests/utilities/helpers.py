"""Helper functions to generate unit test payloads"""
from copy import copy

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
