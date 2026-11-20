# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Tests that pin which events and phases the reports select."""
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import patch

import pytest
from flask import g
from pytz import utc
from sqlalchemy.orm import aliased

from api.models import Event, EventConfiguration, EventTemplate, PhaseCode, WorkPhase
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.work import Work
from api.reports.anticipated_schedule_report import EAAnticipatedScheduleReport
from api.reports.event_rules import anticipated_schedule_referrals_and_decisions, thirty_sixty_ninety_referrals
from api.reports.resource_forecast_report import EAResourceForeCastReport
from api.reports.thirty_sixty_ninety_report import ThirtySixtyNinetyReport
from tests.utilities.factory_scenarios import TestJwtClaims, TestWorkInfo
from tests.utilities.factory_utils import factory_work_model


MILESTONE, DECISION = 1, 4
REFERRAL, EAC_MINISTERS, MINISTER, CEAO, ADM = 5, 13, 14, 15, 16

# Per work type: prod event names, and whether the 30-60-90 and the anticipated schedule show them.
# "gap" rows are the suspected gaps in the rules doc, kept until answered; "ADM decision" rows cover the ADM branches.
EVENTS = {
    1: [
        (MILESTONE, REFERRAL, "Project Notification Report referred to Decision Maker", True, True),
        (DECISION, MINISTER, "Decision: Project Notification", False, True),
        (DECISION, MINISTER, "Delegation of PN Decision", False, True),
        (DECISION, CEAO, "Project Notification Terminated s.39(d)", False, False),
    ],
    2: [
        (MILESTONE, REFERRAL, "Minister's Designation Report referred to Decision Maker", False, True),  # gap
        (DECISION, MINISTER, "Minister's Designation Decision", False, True),
        (DECISION, CEAO, "Minister's Designation Process Terminated s.39(d)", False, False),
    ],
    3: [
        (MILESTONE, REFERRAL, "CEAO's Designation Decision Package Referred to CEAO", False, True),  # gap
        (DECISION, CEAO, "CEAO's Designation Decision", False, False),  # gap
    ],
    5: [
        (MILESTONE, REFERRAL, "Exemption Request Package Referred to Minister", False, True),
        (MILESTONE, REFERRAL, "Exemption Request Report referred to CEAO", True, True),
        (MILESTONE, REFERRAL, "Exemption Request Report referred to CEAO for Further Decision", True, True),
        (DECISION, MINISTER, "Minister's Exemption Request Decision", False, True),
        (DECISION, CEAO, "CEAO's Readiness Decision (Exemption Request)", False, True),
        (DECISION, CEAO, "IPD/EP Approval Decision (Day Zero)", False, False),
    ],
    6: [
        (MILESTONE, REFERRAL, "EAC Referral Package sent to Ministers", True, True),
        (MILESTONE, REFERRAL, "Termination Package Referred to Minister", True, True),
        (MILESTONE, REFERRAL, "Report referred to CEAO", False, True),
        (DECISION, EAC_MINISTERS, "EAC Ministers Decision", False, False),  # gap
        (DECISION, MINISTER, "Minister's Termination Decision", False, True),
        (DECISION, CEAO, "CEAO's Readiness Decision (EAC Assessment)", False, True),
        (DECISION, CEAO, "IPD/EP Approval Decision (Day Zero)", False, False),
        (DECISION, CEAO, "Revised EAC Application Acceptance Decision (Day Zero)", False, False),
    ],
    7: [
        (MILESTONE, REFERRAL, "Amendment Decision Package Referred to Decision Maker", True, True),
        (MILESTONE, REFERRAL, "Amendment Report Referred to Decision Maker", False, True),
        (DECISION, CEAO, "Amendment Decision", False, True),
        (DECISION, CEAO, "Delegation of Amendment Decision", False, False),
        (DECISION, ADM, "ADM decision", False, True),
    ],
    9: [
        (MILESTONE, REFERRAL, "EAC Extension Decision Package Referred to CEAO", False, True),  # gap
        (DECISION, CEAO, "CEAO's EAC Extension Decision", False, False),  # gap
        (DECISION, ADM, "ADM decision", False, True),
    ],
    10: [
        (MILESTONE, REFERRAL, "SubStart Determination Decision Package Referred to Decision Maker", False, True),  # gap
        (DECISION, MINISTER, "Delegation of SubStart Decision to Minister", False, True),  # gap
        (DECISION, CEAO, "SubStart Determination Decision", False, False),  # gap
        (DECISION, ADM, "ADM decision", False, True),
    ],
    11: [
        (MILESTONE, REFERRAL, "Transfer Decision Package referred to Decision Maker", False, True),  # gap
        (DECISION, MINISTER, "Delegation of Transfer Decision to Minister", False, True),  # gap
        (DECISION, CEAO, "Decision Maker's Transfer Decision", False, True),
        (DECISION, ADM, "ADM decision", False, True),
    ],
    15: [
        (MILESTONE, REFERRAL, "CMA Decision Package Referred to Ministers", False, True),  # gap
        (DECISION, EAC_MINISTERS, "Consent for Material Alteration Decision", False, False),  # gap
    ],
    16: [
        (MILESTONE, REFERRAL, "Amendment Decision Package Referred to Decision Maker", True, True),
        (DECISION, CEAO, "Amendment Decision", False, True),
        (DECISION, CEAO, "Delegation of Amendment Decision", False, False),
        (DECISION, ADM, "ADM decision", False, True),
    ],
}


def _work_phase(work, phase_code, start_date):
    return WorkPhase(
        work_id=work.id,
        phase_id=phase_code.id,
        name=phase_code.name,
        start_date=start_date,
        end_date=start_date + timedelta(days=400),
        sort_order=1,
    ).flush()


def _configuration(work_phase, category_id, type_id, name):
    return EventConfiguration(
        name=name,
        template_id=EventTemplate.query.first().id,
        event_type_id=type_id,
        event_category_id=category_id,
        event_position=EventPositionEnum.INTERMEDIATE.value,
        visibility=EventTemplateVisibilityEnum.MANDATORY.value,
        work_phase_id=work_phase.id,
        sort_order=1,
    ).flush()


def _event(work, configuration, anticipated_date):
    return Event(
        name=configuration.name,
        anticipated_date=anticipated_date,
        work_id=work.id,
        event_configuration_id=configuration.id,
    ).flush()


def _selected_names(work, rule):
    rows = (
        EventConfiguration.query
        .join(WorkPhase, EventConfiguration.work_phase_id == WorkPhase.id)
        .join(Work, WorkPhase.work_id == Work.id)
        .filter(Work.id == work.id, rule)
        .all()
    )
    return {row.name for row in rows}


@pytest.mark.parametrize("work_type_id", sorted(EVENTS))
def test_report_rules_select_todays_events(db, work_type_id):  # pylint: disable=unused-argument
    """Each rule selects the same events per work type as the reports did before it moved."""
    work = factory_work_model({**TestWorkInfo.work1.value, "work_type_id": work_type_id})
    work_phase = _work_phase(work, PhaseCode.query.filter_by(is_intake=False).first(), datetime.now(utc))
    for category_id, type_id, name, _, _ in EVENTS[work_type_id]:
        _configuration(work_phase, category_id, type_id, name)

    assert _selected_names(work, thirty_sixty_ninety_referrals()) == {
        name for _, _, name, in_thirty_sixty_ninety, _ in EVENTS[work_type_id] if in_thirty_sixty_ninety
    }
    assert _selected_names(work, anticipated_schedule_referrals_and_decisions()) == {
        name for _, _, name, _, in_schedule in EVENTS[work_type_id] if in_schedule
    }


def test_intake_phases_are_flagged(db):  # pylint: disable=unused-argument
    """The phases the reports treated as intake by name are flagged, and no others."""
    intake_names = {
        "CEAO's Designation Intake", "Extension Pre-Submission", "Minister's Designation Intake",
        "Notification Intake", "Pre-Application (Exemption Request)", "Pre-Application", "Pre-Assessment",
        "Pre-EA (EAC Assessment)", "SubStart Pre-Assessment", "Transfer Pre-Application",
    }
    phase_codes = PhaseCode.query.all()
    flagged = {phase_code.name for phase_code in phase_codes if phase_code.is_intake}
    assert flagged
    assert flagged == intake_names & {phase_code.name for phase_code in phase_codes}


def test_work_phase_is_intake(db):  # pylint: disable=unused-argument
    """A work phase is intake when its phase code is, in Python and in SQL."""
    work = factory_work_model()
    intake = _work_phase(work, PhaseCode.query.filter_by(is_intake=True).first(), datetime.now(utc))
    other = _work_phase(work, PhaseCode.query.filter_by(is_intake=False).first(), datetime.now(utc))

    assert intake.is_intake is True
    assert other.is_intake is False
    assert WorkPhase.query.filter(WorkPhase.work_id == work.id, WorkPhase.is_intake).all() == [intake]


def _work_with_intake_and_other_decisions(report_date):
    """Return a work with a pending decision in an intake phase and one in another phase."""
    work = factory_work_model()
    events = {}
    for is_intake in (True, False):
        work_phase = _work_phase(
            work, PhaseCode.query.filter_by(is_intake=is_intake).first(), report_date - timedelta(days=30)
        )
        configuration = _configuration(work_phase, DECISION, MINISTER, f"Decision, intake={is_intake}")
        events[is_intake] = _event(work, configuration, report_date + timedelta(days=10))
    return work, events


@pytest.mark.parametrize("include_first_phase", [False, True])
def test_thirty_sixty_ninety_leaves_out_intake_phases(app, db, include_first_phase):  # pylint: disable=unused-argument
    """The 30-60-90 leaves out intake-phase events unless the first phase is included."""
    g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
    report_date = datetime(2025, 12, 15, tzinfo=utc)
    _, events = _work_with_intake_and_other_decisions(report_date)

    valid_event_ids = ThirtySixtyNinetyReport(filters=None, color_intensity=50)._get_valid_event_ids(
        report_date, include_first_phase=include_first_phase
    )

    assert events[False].id in valid_event_ids
    assert (events[True].id in valid_event_ids) is include_first_phase


@pytest.mark.parametrize("include_phase_zero", [False, True])
def test_calendar_leaves_out_intake_phases(db, include_phase_zero):  # pylint: disable=unused-argument
    """The event calendar leaves out intake-phase events when asked to."""
    report_date = datetime(2025, 6, 15, tzinfo=utc)
    work, events = _work_with_intake_and_other_decisions(report_date)

    found = Event.find_by_work_ids_and_year(
        [work.id], SimpleNamespace(year=2025), aliased(EventConfiguration), include_phase_zero
    ).all()

    assert events[False] in found
    assert (events[True] in found) is include_phase_zero


@pytest.mark.parametrize("include_first_phase", [False, True])
def test_anticipated_schedule_leaves_out_intake_phases(app, db, include_first_phase):  # pylint: disable=unused-argument
    """The anticipated schedule leaves out intake-phase events unless the first phase is included."""
    g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
    report_date = datetime.now(utc)
    work, _ = _work_with_intake_and_other_decisions(report_date)
    report = EAAnticipatedScheduleReport(filters=None, color_intensity=50)

    query = report._base_query().filter(Work.id == work.id)  # pylint: disable=protected-access
    start_date = report_date - timedelta(days=7)
    referrals = report._get_referral_event_query(start_date)  # pylint: disable=protected-access
    decisions = report._get_decision_event_query(start_date)  # pylint: disable=protected-access
    query = query.outerjoin(referrals, referrals.c.work_id == Work.id).outerjoin(decisions, decisions.c.work_id == Work.id)
    filters = report._build_filters(report_date, include_first_phase, referrals, decisions)  # pylint: disable=protected-access
    names = {name for (name,) in query.with_entities(EventConfiguration.name).filter(*filters).all()}

    assert "Decision, intake=False" in names
    assert ("Decision, intake=True" in names) is include_first_phase


@pytest.mark.parametrize("include_first_phase", [False, True])
def test_resource_forecast_leaves_out_works_in_intake(app, db, include_first_phase):  # pylint: disable=unused-argument
    """The resource forecast leaves out works whose current phase is intake unless the first phase is included."""
    g.jwt_oidc_token_info = TestJwtClaims.staff_admin_role
    report_date = datetime.now(utc)
    work = factory_work_model()
    work_phase = _work_phase(work, PhaseCode.query.filter_by(is_intake=True).first(), report_date - timedelta(days=30))
    work.current_work_phase_id = work_phase.id
    work.flush()
    report = EAResourceForeCastReport(filters=None, color_intensity=50)

    def every_work(*_):
        return db.session.query(Work.id.label("work_id")).subquery()

    # The date windows are not under test, so every work passes them.
    with patch.object(report, "_get_less_than_end_date_query", side_effect=every_work), \
            patch.object(report, "_get_greater_than_report_date_query", side_effect=every_work):
        rows = report._fetch_data(report_date, include_first_phase)  # pylint: disable=protected-access

    assert (work.id in {row.work_id for row in rows}) is include_first_phase
