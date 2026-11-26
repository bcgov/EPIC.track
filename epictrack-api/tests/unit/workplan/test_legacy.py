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
"""Tests for building version 1 of a work template from the legacy template tables."""
import os

import pytest

from api.models import (
    ActionEnum, ActionTemplate, TemplateEvent, TemplateOutcome, TemplateOutcomeEffect, TemplatePhase, WorkTemplate,
    WorkTemplateVersion, WorkTemplateVersionStatus)
from api.workplan.core import template as tpl
from api.workplan.core.validation import validate_version
from api.workplan.legacy import LegacyConversionError, LegacyTemplateSet, build_version_from_legacy, load_legacy_sets
from api.workplan.rules import get_rule_set
from tests.utilities.migrations import load_migration

EAO = get_rule_set("EAO")
INTAKE, REVIEW, REVISION = 1, 2, 3


def _phase(code, name, sort_order, legislated=False, visibility="REGULAR"):
    return {
        "id": code, "name": name, "sort_order": sort_order, "legislated": legislated, "number_of_days": 30,
        "visibility": visibility, "is_intake": code == INTAKE,
    }


def _event(event_id, phase_id, name, position="INTERMEDIATE", start_at="0", parent_id=None, visibility="MANDATORY"):
    return {
        "id": event_id, "phase_id": phase_id, "parent_id": parent_id, "name": name, "event_type_id": 1,
        "event_category_id": 1, "event_position": position, "visibility": visibility, "start_at": start_at,
        "number_of_days": 0, "multiple_days": False, "sort_order": event_id,
    }


def _legacy(*actions, events=()):
    """Three phases with a START and an END each; every action goes on the one outcome of Review's END."""
    phase_events = [
        _event(10, INTAKE, "Intake start", "START"), _event(19, INTAKE, "Intake end", "END", "29"),
        _event(20, REVIEW, "Review start", "START"), _event(21, REVIEW, "Report", start_at="10"),
        _event(22, REVIEW, "Last day", start_at="25", visibility="HIDDEN"),
        _event(29, REVIEW, "Decision", "END", "29"),
        _event(30, REVISION, "Revision start", "START"), _event(39, REVISION, "Revision end", "END", "29"),
    ]
    return LegacyTemplateSet(
        work_type_id=6, ea_act_id=3, name="Test", rule_set="EAO", all_phases_require_overage_responsibility=False,
        phases=[
            _phase(INTAKE, "Intake", 1), _phase(REVIEW, "Review", 2, legislated=True),
            _phase(REVISION, "Revision", 3, visibility="HIDDEN"),
        ],
        events=phase_events + list(events),
        outcomes=[{"id": 1, "event_template_id": 29, "name": "Decided", "sort_order": 1}],
        actions=[
            {"id": index, "outcome_id": 1, "action": name, "additional_params": params, "sort_order": index}
            for index, (name, params) in enumerate(actions, start=1)
        ],
        project_states={"PRECONSTRUCTION": 13},
    )


def _keys(version):
    return {event.legacy_event_template_id: event.key for _, event in version.events()}


def _decision(version):
    return version.phases[1].events[-1]


def test_phases_take_their_settings_and_eao_day_basis():
    """Kinds come from the legislated flag, and the legislated phase after intake counts from Day Zero."""
    version, _ = build_version_from_legacy(_legacy(), EAO)

    assert [
        (p.name, p.time_limit_kind, p.day_basis, p.in_default_sequence, p.is_intake, p.requires_overage_responsibility)
        for p in version.phases
    ] == [
        ("Intake", tpl.FREE, tpl.DAY_ONE, True, True, False),
        ("Review", tpl.LEGISLATED, tpl.DAY_ZERO, True, False, True),
        ("Revision", tpl.FREE, tpl.DAY_ONE, False, False, False),
    ]


def test_start_at_becomes_an_anchor_and_an_offset():
    """A whole number counts from the anchor's start, and number_of_days-2 from its end."""
    legacy = _legacy(events=[
        _event(23, REVIEW, "Comment period"),
        _event(24, REVIEW, "Opens soon", start_at="-7", parent_id=23),
        _event(25, REVIEW, "Ends soon", start_at="number_of_days-2", parent_id=23),
        _event(26, REVIEW, "Blank", start_at="", parent_id=23),
        _event(27, REVIEW, "No parent", start_at="number_of_days-2"),
    ])

    version, notes = build_version_from_legacy(legacy, EAO)

    keys = _keys(version)
    placed = {e.name: (e.anchor_key, e.anchor_point, e.offset_days) for _, e in version.events()}
    assert placed["Report"] == (None, tpl.START, 10)
    assert placed["Opens soon"] == (keys[23], tpl.START, -7)
    assert placed["Ends soon"] == (keys[23], tpl.END, -2)
    assert placed["Blank"] == (keys[23], tpl.START, 0)
    assert placed["No parent"] == (None, tpl.START, 0)
    assert notes == [
        "Test: Review / Blank: an empty start_at is counted as 0 days from its parent",
        "Test: Review / No parent: start_at 'number_of_days-2' is counted as 0 days from the phase start",
    ]


TODAY_TO_EFFECTS = [
    ("SetWorkState", {"work_state": "WITHDRAWN"}, [("SET_WORK_STATE", None, None, {"work_state": "WITHDRAWN"})]),
    ("SetProjectStatus", {"is_active": False}, [("SET_PROJECT_STATUS", None, None, {"is_active": False})]),
    (
        "SetProjectState", {"project_state": "PRE_CONSTRUCTION"},
        [("SET_PROJECT_STATE", None, None, {"project_state_id": 13})],
    ),
    ("SetProjectState", {"project_state_id": 13}, [("SET_PROJECT_STATE", None, None, {"project_state_id": 13})]),
    ("SetWorkDecisionMaker", {"position_id": 8}, [("SET_DECISION_MAKER", None, None, {"position_id": 8})]),
    (
        "SetFederalInvolvement", {"federal_involvement_id": 2},
        [("SET_FEDERAL_INVOLVEMENT", None, None, {"federal_involvement_id": 2})],
    ),
    ("CreateWork", {"work_type": 9}, [("CREATE_LINKED_WORK", None, None, {"work_type_id": 9})]),
    ("CreateWork", {}, []),
    ("SetEventsStatus", {"all_future_events": False}, [("END_PHASE_HERE", None, None, {})]),
    (
        "SetEventsStatus", [{"event_name": "Intake end", "phase_name": "Intake", "is_active": False}],
        [("SKIP_EVENTS", None, 19, {})],
    ),
    (
        "SetPhasesStatus", {"all_future_phases": True},
        [("END_PHASE_HERE", None, None, {}), ("SKIP_PHASES", None, None, {"all_later": True})],
    ),
    ("SetPhasesStatus", [{"phase_name": "Intake", "is_active": False}], [("SKIP_PHASES", INTAKE, None, {})]),
    (
        "AddPhase", [{"phase_name": "Revision", "new_name": "Second revision", "legislated": True}],
        [("ADD_PHASES", REVISION, None, {"name": "Second revision", "time_limit_kind": tpl.LEGISLATED})],
    ),
    ("ChangePhaseEndEvent", {"event_name": "Decision", "phase_name": "Review"}, [("END_PHASE_HERE", None, None, {})]),
    ("ChangePhaseEndEvent", {"event_name": "Other", "this_event": True}, [("END_PHASE_HERE", None, None, {})]),
    ("ChangePhaseEndEvent", {"event_name": "Last day"}, [("END_PHASE_HERE", None, 22, {})]),
    ("SetEventDate", {"event_name": "Report", "start_at": 3}, [("ANCHOR_EVENT", None, 21, {"offset_days": 3})]),
    ("SetEventDate", {"event_name": "Revision start", "phase_name": "Revision", "start_at": 1}, []),
    (
        "AddEvent", [{"event_name": "Report", "start_at": "7", "use_phase_start": "True", "new_name": "Report 2"}],
        [("ADD_OCCURRENCE", None, 21, {
            "offset_days": 7, "visibility": "MANDATORY", "from_phase_start": True, "name": "Report 2",
        })],
    ),
    (
        "AddEvent", {"event_name": "Last day", "visibility": "SUGGESTED"},
        [("ADD_OCCURRENCE", None, 22, {"offset_days": 25, "visibility": "SUGGESTED"})],
    ),
    ("LockWorkStartDate", {"start_date_locked": True}, []),
    ("SetEventName", {"event_name": "Report", "new_name": "Renamed"}, []),
]


@pytest.mark.parametrize("action, params, expected", TODAY_TO_EFFECTS)
def test_each_action_becomes_its_effects(action, params, expected):
    """Each legacy action becomes the effects that replace it, with targets found by name."""
    version, _ = build_version_from_legacy(_legacy((action, params)), EAO)

    keys = _keys(version)
    effects = _decision(version).outcomes[0].effects
    assert effects == [
        tpl.Effect(kind, target_phase_code_id=phase, target_event_key=keys.get(event), params=effect_params)
        for kind, phase, event, effect_params in expected
    ]
    assert validate_version(version, EAO) == []


def test_an_outcome_ends_its_phase_once_however_many_actions_did():
    """Withdrawals end the phase through both SetEventsStatus and SetPhasesStatus, which is one effect."""
    legacy = _legacy(
        ("SetPhasesStatus", {"all_future_phases": True}), ("SetEventsStatus", {"all_future_events": True}),
        ("SetWorkState", {"work_state": "WITHDRAWN"}),
    )

    version, _ = build_version_from_legacy(legacy, EAO)

    assert [effect.kind for effect in _decision(version).outcomes[0].effects] == [
        "END_PHASE_HERE", "SKIP_PHASES", "SET_WORK_STATE"]


def test_actions_change_the_milestones_they_touch():
    """An AddEvent makes a shown milestone repeatable, and LockWorkStartDate marks the one that sets the start."""
    legacy = _legacy(
        ("AddEvent", {"event_name": "Report"}), ("AddEvent", {"event_name": "Last day"}),
        ("LockWorkStartDate", {"start_date_locked": True, "start_at": 1}),
    )

    version, notes = build_version_from_legacy(legacy, EAO)

    events = {event.name: event for _, event in version.events()}
    assert (events["Report"].repeatable, events["Last day"].repeatable) == (True, False)
    assert [name for name, event in events.items() if event.sets_work_start] == ["Decision"]
    assert notes == ["Test: Review / Decision / Decided: LockWorkStartDate: sets the work start, without its start_at of 1"]


def test_a_renamed_phase_is_found_by_its_new_name():
    """Actions name a phase AddPhase re-added by its new name, which leads back to its phase code."""
    legacy = _legacy(
        ("AddPhase", [{"phase_name": "Revision", "new_name": "Second revision"}]),
        ("SetEventDate", {"event_name": "Revision end", "phase_name": "Second revision", "start_at": 5}),
    )

    version, _ = build_version_from_legacy(legacy, EAO)

    assert _decision(version).outcomes[0].effects[1] == tpl.Effect(
        "ANCHOR_EVENT", target_event_key=_keys(version)[39], params={"offset_days": 5},
    )


def test_a_shared_name_resolves_to_the_top_level_milestone_or_for_add_event_the_hidden_one():
    """Calendar children share names, so a top-level milestone wins, and AddEvent picks a single hidden match."""
    legacy = _legacy(
        ("SetEventDate", {"event_name": "Notice", "start_at": 2}),
        ("AddEvent", {"event_name": "Calendar entry", "start_at": "0"}),
        events=[
            _event(23, REVIEW, "Notice"), _event(24, REVIEW, "Notice", parent_id=21),
            _event(25, REVIEW, "Calendar entry", parent_id=21),
            _event(26, REVIEW, "Calendar entry", parent_id=22, visibility="HIDDEN"),
        ],
    )

    version, _ = build_version_from_legacy(legacy, EAO)

    keys = _keys(version)
    assert [effect.target_event_key for effect in _decision(version).outcomes[0].effects] == [keys[23], keys[26]]


def test_every_miss_is_listed():
    """One build reports every action it couldn't convert, not just the first."""
    legacy = _legacy(
        ("SetEventDate", {"event_name": "Report", "phase_name": "Nowhere", "start_at": 1}),
        ("SetEventDate", {"event_name": "Nothing", "start_at": 1}),
        ("SetPhasesStatus", [{"phase_name": "Intake", "work_type_id": 7, "is_active": False}]),
        ("SetPhasesStatus", [{"phase_name": "Intake", "is_active": True}]),
        ("SetProjectState", {"project_state": "UNHEARD_OF"}),
        ("SetEventColour", {}),
        events=[_event(23, REVIEW, "Child", start_at="number_of_days*2", parent_id=21)],
    )

    with pytest.raises(LegacyConversionError) as error:
        build_version_from_legacy(legacy, EAO)

    prefix = "Test: Review / Decision / Decided: "
    assert error.value.misses == [
        "Test: Review / Child: can't convert start_at 'number_of_days*2'",
        f"{prefix}SetEventDate: phase 'Nowhere' not found",
        f"{prefix}SetEventDate: milestone 'Nothing' in 'Review' not found",
        f"{prefix}SetPhasesStatus: work_type_id 7 isn't this template's",
        f"{prefix}SetPhasesStatus: only turning a phase off is supported",
        f"{prefix}SetProjectState: project state 'UNHEARD_OF' not found",
        f"{prefix}SetEventColour: unknown action",
    ]


def test_every_uploaded_template_builds_a_valid_version(session):
    """Each template set the xlsx files load converts with no misses, keeps every row, and validates."""
    sets = load_legacy_sets(session.connection())

    assert len(sets) == len(os.listdir(_TEMPLATES))
    for legacy in sets:
        version, _ = build_version_from_legacy(legacy, EAO)
        events = [event for _, event in version.events()]
        assert (len(version.phases), len(events), sum(len(event.outcomes) for event in events)) == (
            len(legacy.phases), len(legacy.events), len(legacy.outcomes)), legacy.name
        assert validate_version(version, EAO) == [], legacy.name


@pytest.fixture(name="no_templates")
def no_templates_fixture(session):
    """The database as the migration finds it, before any version 1."""
    for model in (TemplateOutcomeEffect, TemplateOutcome, TemplateEvent, TemplatePhase, WorkTemplateVersion,
                  WorkTemplate):
        session.query(model).delete()
    session.flush()


@pytest.mark.usefixtures("no_templates")
def test_the_migration_publishes_version_one_of_each_template(session):
    """The migration saves each built version, with its anchors and effect targets pointing at its own rows."""
    connection = session.connection()
    sets = load_legacy_sets(connection)

    _migration().build_version_one(connection)

    for legacy in sets:
        built, _ = build_version_from_legacy(legacy, EAO)
        template = WorkTemplate.query.filter_by(work_type_id=legacy.work_type_id, ea_act_id=legacy.ea_act_id).one()
        [version] = template.versions
        assert (version.version, version.status) == (1, WorkTemplateVersionStatus.PUBLISHED)
        assert [(p.phase_code_id, p.time_limit_kind.value, p.day_basis.value) for p in version.phases] == [
            (p.phase_code_id, p.time_limit_kind, p.day_basis) for p in built.phases]
        saved = [event for phase in version.phases for event in phase.events]
        assert [(e.key, e.anchor.key if e.anchor else None, e.offset_days) for e in saved] == [
            (e.key, e.anchor_key, e.offset_days) for _, e in built.events()]
        assert [
            (f.kind, f.target_template_event_id and _event_key(saved, f.target_template_event_id), f.params)
            for e in saved for o in e.outcomes for f in o.effects
        ] == [
            (f.kind, f.target_event_key, f.params) for _, e in built.events() for o in e.outcomes for f in o.effects
        ]


@pytest.mark.usefixtures("no_templates")
def test_the_migration_publishes_nothing_when_a_template_misses(session):
    """One action that can't be converted stops every template's version 1, not just its own."""
    connection = session.connection()
    outcome_id = load_legacy_sets(connection)[-1].outcomes[0]["id"]
    session.add(ActionTemplate(
        outcome_id=outcome_id, action_id=ActionEnum.SET_EVENT_DATE.value, sort_order=99,
        additional_params={"event_name": "Nothing", "start_at": 1},
    ))
    session.flush()

    with pytest.raises(RuntimeError, match="milestone 'Nothing'"):
        _migration().build_version_one(connection)

    assert WorkTemplate.query.count() == 0


_TEMPLATES = os.path.join(os.path.dirname(__file__), "../../../src/api/templates/event_templates")


def _migration():
    return load_migration("8013265c32c4_build_work_template_version_one.py")


def _event_key(saved, event_id):
    return next(event.key for event in saved if event.id == event_id)
