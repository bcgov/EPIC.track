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
"""Tests for the versioned work template tables."""
import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from api.models import (
    AnchorPoint, BoundarySide, DayBasis, EventTemplate, PhaseCode, TemplateEvent, TemplateOutcome,
    TemplateOutcomeEffect, TemplatePhase, TimeLimitKind, WorkTemplate, WorkTemplateVersion, WorkTemplateVersionStatus,
    WorkType)
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum


@pytest.fixture(name="legacy")
def legacy_fixture():
    """A loaded legacy template row: a real phase code, event type and category to point at."""
    return EventTemplate.query.first()


def _template(session, legacy):
    phase_code = session.get(PhaseCode, legacy.phase_id)
    template = WorkTemplate(work_type_id=phase_code.work_type_id, ea_act_id=phase_code.ea_act_id, name="Template")
    session.add(template)
    session.flush()
    return template


def _version(session, template, version=1, status=WorkTemplateVersionStatus.PUBLISHED):
    row = WorkTemplateVersion(work_template_id=template.id, version=version, status=status)
    session.add(row)
    session.flush()
    return row


def _event(version, phase, legacy, name, sort_order, **columns):
    return TemplateEvent(
        template_version_id=version.id, phase=phase, name=name, event_type_id=legacy.event_type_id,
        event_category_id=legacy.event_category_id, visibility=EventTemplateVisibilityEnum.MANDATORY,
        sort_order=sort_order, **columns,
    )


def _refused(session, row):
    with pytest.raises(IntegrityError):
        with session.begin_nested():
            session.add(row)
            session.flush()


def test_a_version_tree_round_trips(session, legacy):
    """A version's phases, anchored milestones, outcomes and effects load back as written."""
    version = _version(session, _template(session, legacy))
    phase = TemplatePhase(
        version=version, phase_code_id=legacy.phase_id, name="Early Engagement", sort_order=1,
        time_limit_kind=TimeLimitKind.LEGISLATED, number_of_days=90,
    )
    start = _event(version, phase, legacy, "Start", 1, event_position=EventPositionEnum.START)
    closes = _event(
        version, phase, legacy, "Comment period closes", 2, anchor=start, anchor_point=AnchorPoint.END,
        offset_days=30, role="TIME_LIMIT_EXTENSION",
    )
    outcome = TemplateOutcome(event=closes, name="Approved", sort_order=1)
    effect = TemplateOutcomeEffect(outcome=outcome, sort_order=1, kind="END_PHASE_HERE")
    session.add_all([phase, start, closes, outcome, effect])
    session.flush()
    session.expire_all()

    loaded = session.get(WorkTemplateVersion, version.id)

    [loaded_phase] = loaded.phases
    assert (loaded_phase.time_limit_kind, loaded_phase.day_basis, loaded_phase.start_usually_set_by) == (
        TimeLimitKind.LEGISLATED, DayBasis.ONE, BoundarySide.PREVIOUS_END)
    loaded_start, loaded_closes = loaded_phase.events
    assert loaded_closes.anchor.id == loaded_start.id
    assert (loaded_closes.anchor_point, loaded_closes.offset_days, loaded_closes.role) == (
        AnchorPoint.END, 30, "TIME_LIMIT_EXTENSION")
    assert isinstance(loaded_start.key, uuid.UUID) and loaded_start.key != loaded_closes.key
    [loaded_effect] = loaded_closes.outcomes[0].effects
    assert (loaded_effect.kind, loaded_effect.params) == ("END_PHASE_HERE", {})


def test_one_template_per_work_type_and_act(session, legacy):
    """A second template for the same work type and EA Act is refused."""
    template = _template(session, legacy)

    _refused(session, WorkTemplate(work_type_id=template.work_type_id, ea_act_id=template.ea_act_id, name="Again"))


def test_a_template_has_one_draft_at_a_time(session, legacy):
    """Any number of versions can be published, but only one can be a draft."""
    template = _template(session, legacy)
    _version(session, template, 1)
    _version(session, template, 2)
    _version(session, template, 3, WorkTemplateVersionStatus.DRAFT)

    _refused(session, WorkTemplateVersion(work_template_id=template.id, version=4,
                                          status=WorkTemplateVersionStatus.DRAFT))
    _refused(session, WorkTemplateVersion(work_template_id=template.id, version=2))


def test_a_phase_code_and_a_milestone_key_appear_once_per_version(session, legacy):
    """A version can't hold the same phase twice, or two milestones with one key."""
    version = _version(session, _template(session, legacy))
    phase = TemplatePhase(version=version, phase_code_id=legacy.phase_id, name="Phase", sort_order=1)
    start = _event(version, phase, legacy, "Start", 1)
    session.add_all([phase, start])
    session.flush()

    # Built by id, not through relationships, so a refused row doesn't stay in a loaded collection.
    _refused(session, TemplatePhase(
        template_version_id=version.id, phase_code_id=legacy.phase_id, name="Again", sort_order=2))
    _refused(session, TemplateEvent(
        template_version_id=version.id, template_phase_id=phase.id, key=start.key, name="Again",
        event_type_id=legacy.event_type_id, event_category_id=legacy.event_category_id,
        visibility=EventTemplateVisibilityEnum.MANDATORY, sort_order=2))


def test_existing_work_types_follow_the_eao_rule_set(session):  # pylint: disable=unused-argument
    """Every work type starts on EAO's rule set, with no Total Allotted Days target."""
    work_types = WorkType.query.all()

    assert work_types
    assert {(work_type.rule_set, work_type.total_allotted_days_target) for work_type in work_types} == {("EAO", None)}
