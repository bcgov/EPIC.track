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
"""Tests for a phase's day counts."""
from datetime import date, timedelta

import pytest

from api.workplan.core import template as tpl
from api.workplan.core.days import (
    TIME_LIMIT_EXTENSION, TIME_LIMIT_RESUMPTION, Milestone, PhaseDays, PhaseFacts, phase_days)

START = date(2026, 1, 1)
TODAY = date(2026, 1, 31)


def _day(number):
    return START + timedelta(days=number)


def _extension(days, actual_date=_day(2)):
    return Milestone(TIME_LIMIT_EXTENSION, actual_date, days)


def _resumption(days, actual_date=_day(20)):
    return Milestone(TIME_LIMIT_RESUMPTION, actual_date, days)


@pytest.mark.parametrize("day_basis, expected_taken", [(tpl.DAY_ZERO, 10), (tpl.DAY_ONE, 11)])
def test_day_one_counts_the_start_day(day_basis, expected_taken):
    """A phase from day 0 to day 10 has taken 10 days counted from Day Zero, and 11 from Day One."""
    days = phase_days(PhaseFacts(start=START, end=_day(10), time_limit=10, day_basis=day_basis), TODAY)

    assert (days.days_taken, days.days_over) == (expected_taken, expected_taken - 10)


def test_an_extension_counts_once_it_has_an_actual_date():
    """A planned extension doesn't add to the time allowed until it's granted."""
    facts = PhaseFacts(start=START, end=_day(25), time_limit=10, milestones=[
        _extension(10), _extension(30, actual_date=None), Milestone(None, _day(3), 99)])

    assert phase_days(facts, TODAY) == PhaseDays(
        time_allowed=20, extension_days=10, suspended_days=0, days_taken=25, days_left=20)


def test_a_completed_suspension_pauses_the_clock():
    """A resumed suspension's days leave the days taken, and the time allowed stays."""
    facts = PhaseFacts(start=START, end=_day(25), time_limit=10, milestones=[_resumption(15)])

    assert phase_days(facts, TODAY)[1:4] == (0, 15, 10)


def test_a_running_suspension_pauses_the_current_phase_s_clock():
    """The current phase suspended on day 5 has taken 5 days, however long the suspension runs."""
    facts = PhaseFacts(start=START, time_limit=10, is_current=True, suspended_since=_day(5))

    days = phase_days(facts, TODAY)

    assert (days.suspended_days, days.days_taken, days.days_left) == (25, 5, 5)


def test_a_running_suspension_doesn_t_count_toward_an_end_being_entered():
    """Only resumed suspensions leave the days taken when the phase is ended."""
    facts = PhaseFacts(start=START, end=_day(25), time_limit=10, is_current=True, suspended_since=_day(10),
                       milestones=[_resumption(5, actual_date=None)])

    assert phase_days(facts, TODAY).days_over == 15


def test_the_current_phase_counts_to_today():
    """The current phase has taken the days since it started, and has the rest left."""
    days = phase_days(PhaseFacts(start=START, time_limit=100, is_current=True), TODAY)

    assert (days.days_taken, days.days_left) == (30, 70)


@pytest.mark.parametrize("facts", [
    # Not started yet.
    PhaseFacts(start=_day(40), time_limit=100),
    # Completed without both dates.
    PhaseFacts(start=None, end=None, time_limit=100),
])
def test_a_phase_with_nothing_to_count_has_taken_no_days(facts):
    """A phase that hasn't started, or ended without dates, has all its time left."""
    assert phase_days(facts, TODAY)[3:] == (0, 100)


def test_a_completed_phase_keeps_its_time_left():
    """A phase that isn't current reports its time allowed as its time left."""
    days = phase_days(PhaseFacts(start=START, end=_day(60), time_limit=100), TODAY)

    assert (days.days_taken, days.days_left) == (60, 100)


def test_a_phase_without_a_time_limit_is_allowed_its_planned_length():
    """With no time limit, the planned length is the time allowed, and extensions don't add to it."""
    facts = PhaseFacts(start=START, end=_day(30), time_limit=0, planned_days=45, milestones=[_extension(10)])

    assert phase_days(facts, TODAY).time_allowed == 45


def test_days_taken_is_never_below_zero():
    """An end before the start, or more suspended days than days, counts as none taken."""
    before = phase_days(PhaseFacts(start=START, end=_day(-17), time_limit=60), TODAY)
    suspended = phase_days(PhaseFacts(start=START, end=_day(5), time_limit=60, milestones=[_resumption(9)]), TODAY)

    assert (before.days_taken, before.days_over, suspended.days_taken) == (0, -60, 0)
