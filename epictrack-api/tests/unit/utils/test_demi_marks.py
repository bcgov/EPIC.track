# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Tests for the request-scoped marks of rows a write changed."""
from copy import copy
from enum import Enum
from http import HTTPStatus
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import urljoin

import pytest
from sqlalchemy import event as sa_event
from werkzeug.datastructures import FileStorage

from api.models import Event, EventConfiguration, Project, Work, WorkPhase
from api.models.special_field import EntityEnum
from api.services.project import ProjectService
from api.services.special_field import SpecialFieldService
from api.services.sync_form_data import SyncFormDataService
from api.utils import demi_marks
from api.utils.demi_marks import DemiMarks, committed_marks, mark_rows
from tests.unit.apis.test_event_actions_auth import _complete_event, _work_with_pending_create_work_decision
from tests.utilities.factory_scenarios import TestJwtClaims, TestProjectInfo, TestWorkInfo
from tests.utilities.factory_utils import factory_project_model, factory_work_model
from tests.utilities.helpers import prepare_work_payload

API_BASE_URL = "/api/v1/"
PROJECTS_FILE = Path("./src/api/templates/master_templates/Projects.xlsx").resolve()


@pytest.fixture(autouse=True)
def seen(app, monkeypatch):
    """Turn marking on, and record each request's committed marks the way an after_request hook reads them."""
    monkeypatch.setitem(app.config, "DEMI_PUSH_URL", "http://demi.invalid")
    monkeypatch.setitem(app.config, "DEMI_PUSH_KEY", "test-subscription-key")
    recorded = []

    def record(response):
        recorded.append(committed_marks())
        return response

    # Appending directly: Flask refuses after_request() once the shared app has served a request.
    monkeypatch.setitem(app.after_request_funcs, None, [*app.after_request_funcs.get(None, []), record])
    return recorded


def _another_project():
    return factory_project_model({**TestProjectInfo.project1.value, "name": "Marks second", "abbreviation": "MKS"})


def _created_work(client, auth_header, session):
    response = client.post(urljoin(API_BASE_URL, "works"), json=prepare_work_payload(), headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED, response.json
    return session.get(Work, response.json["id"])


def _op(marks, table, row_id):
    return marks.rows.get((table, row_id), {}).get("op")


def test_new_work_marks_create(client, auth_header, session, seen):
    """A new row marks create, its phases and events too."""
    work = _created_work(client, auth_header, session)
    phase = session.query(WorkPhase).filter(WorkPhase.work_id == work.id).first()

    assert _op(seen[-1], "works", work.id) == "create"
    assert _op(seen[-1], "work_phases", phase.id) == "create"


def test_unmirrored_column_marks_none(app, session):
    """A change DEMI never shows, such as capital investment, is not worth a push."""
    project = factory_project_model()

    with app.test_request_context():
        project.capital_investment = 12345.0
        session.commit()

        assert not committed_marks()


def _row(client, auth_header, session, table):
    if table == "projects":
        return factory_project_model()
    work = _created_work(client, auth_header, session)
    if table == "works":
        return work
    phase = session.query(WorkPhase).filter(WorkPhase.work_id == work.id).first()
    if table == "work_phases":
        return phase
    if table == "events":
        return session.query(Event).filter(Event.work_id == work.id).first()
    return session.query(EventConfiguration).filter(EventConfiguration.work_phase_id == phase.id).first()


def _other_value(session, model, column, current):
    if isinstance(current, Enum):
        return next(member for member in type(current) if member != current)
    if column == "simple_title":
        return "Another simple title"
    target = next(iter(getattr(model, column).property.columns[0].foreign_keys)).column
    return session.query(target).filter(target != current).limit(1).scalar()


@pytest.mark.parametrize(
    "table, column",
    [
        ("works", "simple_title"),
        ("projects", "proponent_id"),
        ("projects", "type_id"),
        ("projects", "sub_type_id"),
        ("projects", "project_state_id"),
        ("works", "ea_act_id"),
        ("works", "work_type_id"),
        ("events", "outcome_id"),
        ("work_phases", "visibility"),
        ("event_configurations", "visibility"),
    ],
)
def test_field_behind_a_record_marks_its_row(app, client, auth_header, session, table, column):
    """Each field DEMI derives a shown value from marks its own row as an update."""
    row = _row(client, auth_header, session, table)
    value = _other_value(session, type(row), column, getattr(row, column))

    with app.test_request_context():
        setattr(row, column, value)
        session.commit()

        assert _op(committed_marks(), table, row.id) == "update"


def test_special_field_name_marks_project(app, session):
    """A special field write goes through Query.update, which only the helper can see."""
    project = factory_project_model()
    entry = SimpleNamespace(
        time_range=SimpleNamespace(upper=None),
        entity=EntityEnum.PROJECT.value,
        entity_id=project.id,
        field_name="name",
        field_value="Renamed through a special field",
    )

    with app.test_request_context():
        SpecialFieldService._update_original_model(entry)  # pylint: disable=protected-access
        session.commit()

        assert _op(committed_marks(), "projects", project.id) == "update"


def test_special_field_on_unmirrored_column_marks_none(app, session):
    """A special field DEMI does not show marks nothing."""
    project = factory_project_model()
    entry = SimpleNamespace(
        time_range=SimpleNamespace(upper=None),
        entity=EntityEnum.PROJECT.value,
        entity_id=project.id,
        field_name="fte_positions_operation",
        field_value=3,
    )

    with app.test_request_context():
        SpecialFieldService._update_original_model(entry)  # pylint: disable=protected-access
        session.commit()

        assert not committed_marks()


def test_complete_event_marks_the_event(client, jwt, session, seen):
    """Completing a milestone marks that event by id, not the whole project."""
    _, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)

    response = _complete_event(client, jwt, session, event, outcome_config, TestJwtClaims.staff_admin_role)

    assert response.status_code == HTTPStatus.OK, response.json
    assert _op(seen[-1], "events", event.id) == "update"


def test_delete_event_marks_it_and_linked_events_delete(client, auth_header, session, seen):
    """Deleting a milestone goes through Query.update, linked events included."""
    work = _created_work(client, auth_header, session)
    event = session.query(Event).filter(Event.work_id == work.id, Event.actual_date.is_(None)).first()
    linked = Event(
        name="Linked",
        work_id=work.id,
        event_configuration_id=event.event_configuration_id,
        anticipated_date=event.anticipated_date,
        source_event_id=event.id,
    )
    session.add(linked)
    session.commit()

    response = client.delete(urljoin(API_BASE_URL, f"milestones/events/{event.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK, response.json
    assert _op(seen[-1], "events", event.id) == "delete"
    assert _op(seen[-1], "events", linked.id) == "delete"


def test_delete_project_marks_delete(client, auth_header, seen):
    """Deleting a project marks it with DELETE intent."""
    project = factory_project_model()

    response = client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    assert _op(seen[-1], "projects", project.id) == "delete"


def test_move_work_carries_old_project(client, auth_header, seen):
    """A moved work remembers the project it left, so DEMI can remove it there."""
    work = factory_work_model()
    old_project_id = work.project_id
    new_project = _another_project()
    payload = copy(TestWorkInfo.work1.value)
    payload["project_id"] = new_project.id

    response = client.put(urljoin(API_BASE_URL, f"works/{work.id}"), headers=auth_header, json=payload)

    assert response.status_code == HTTPStatus.OK, response.json
    assert seen[-1].rows[("works", work.id)]["from_project_id"] == old_project_id


def test_restored_work_marks_create(app, session):
    """A work coming back from deleted is sent whole again."""
    work = factory_work_model()
    work.is_deleted = True
    session.commit()

    with app.test_request_context():
        work.is_deleted = False
        session.commit()

        assert _op(committed_marks(), "works", work.id) == "create"


def _import_projects(client, auth_header):
    with open(PROJECTS_FILE, "rb") as stream:
        return client.post(
            urljoin(API_BASE_URL, "projects/import"),
            data={"file": FileStorage(stream=stream, filename="projects.xlsx")},
            content_type="multipart/form-data",
            headers=auth_header,
        )


def _file_project_name():
    with open(PROJECTS_FILE, "rb") as stream:
        return ProjectService._read_excel(stream)["name"].iloc[0]  # pylint: disable=protected-access


def test_import_projects_marks_created_rows_not_soft_deleted_ones(client, auth_header, session, seen):
    """An import marks the rows it created; the rows it soft-deletes are not sent."""
    dropped = _another_project()

    response = _import_projects(client, auth_header)

    assert response.status_code == HTTPStatus.CREATED
    created = session.query(Project).filter(Project.name == _file_project_name()).one()
    assert _op(seen[-1], "projects", created.id) == "create"
    assert ("projects", dropped.id) not in seen[-1].rows


@pytest.mark.parametrize("is_active, op", [(False, "update"), (True, None)])
def test_import_projects_marks_existing_row_only_when_it_flips(client, auth_header, session, seen, is_active, op):
    """A row the file names again is marked only when the import re-enables it."""
    existing = factory_project_model({**TestProjectInfo.project1.value, "name": _file_project_name()})
    existing.is_active = is_active
    session.commit()

    response = _import_projects(client, auth_header)

    assert response.status_code == HTTPStatus.CREATED
    assert _op(seen[-1], "projects", existing.id) == op


def test_import_proponents_marks_none(client, auth_header, seen):
    """A proponent import changes only rows DEMI does not mirror."""
    file_path = Path("./src/api/templates/master_templates/Proponents.xlsx").resolve()
    with open(file_path, "rb") as stream:
        response = client.post(
            urljoin(API_BASE_URL, "proponents/import"),
            data={"file": FileStorage(stream=stream, filename="proponents.xlsx")},
            content_type="multipart/form-data",
            headers=auth_header,
        )

    assert response.status_code == HTTPStatus.CREATED
    assert not seen[-1]


def test_rollback_marks_none(app, session):
    """A flushed change that is rolled back is gone, even when a later commit succeeds."""
    project = factory_project_model()
    # No route rolls back after a flush, so this drives the session inside a request directly.
    with app.test_request_context():
        savepoint = session.begin_nested()
        project.name = "Rolled back"
        session.flush()
        savepoint.rollback()
        session.commit()

        assert not committed_marks()


def test_works_listing_marks_none(client, auth_header, seen):
    """A read-like POST commits nothing, so nothing is marked."""
    factory_work_model()

    response = client.post(urljoin(API_BASE_URL, "works/listing"), headers=auth_header, json={"page": 1, "size": 4})

    assert response.status_code == HTTPStatus.OK
    assert not seen[-1]


def test_requests_do_not_share_marks(client, auth_header, seen):
    """Marks from one request never reach the next, though tests keep one app context open."""
    first = factory_project_model()
    second = _another_project()

    client.delete(urljoin(API_BASE_URL, f"projects/{first.id}"), headers=auth_header)
    client.delete(urljoin(API_BASE_URL, f"projects/{second.id}"), headers=auth_header)

    assert set(seen[-1].rows) == {("projects", second.id)}


def test_sync_form_data_delete_marks_delete(client, auth_header, seen):
    """Setting projects.is_deleted through sync-form-data marks a DELETE."""
    project = factory_project_model()

    # Project.as_dict raises on its dynamic relationships, which is outside what marks cover.
    with patch.object(Project, "as_dict", return_value={"id": project.id}):
        response = client.post(
            urljoin(API_BASE_URL, "sync-form-data"),
            headers=auth_header,
            json={"projects": {"id": project.id, "is_deleted": True}},
        )

    assert response.status_code == HTTPStatus.OK, response.json
    assert _op(seen[-1], "projects", project.id) == "delete"


def test_sync_deletions_marks_each_row_delete(app, client, auth_header, session):
    """Sync-form-data deletions go through Query.update, which only the helper can see."""
    work = _created_work(client, auth_header, session)
    phase = session.query(WorkPhase).filter(WorkPhase.work_id == work.id).first()

    with app.test_request_context():
        SyncFormDataService._sync_deletions("work_phases", [0], {"work_id": work.id})  # pylint: disable=protected-access
        session.commit()

        assert _op(committed_marks(), "work_phases", phase.id) == "delete"


@pytest.mark.parametrize("setting", ["DEMI_PUSH_URL", "DEMI_PUSH_KEY"])
def test_push_config_missing_marks_none(app, client, auth_header, monkeypatch, seen, setting):
    """Without both the DEMI push URL and its key nothing is marked."""
    monkeypatch.setitem(app.config, setting, "")
    project = factory_project_model()

    response = client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    assert not seen[-1]


def test_push_off_mark_rows_reads_nothing(app, session, monkeypatch):
    """With push off the helper issues no SELECT, so the feature costs nothing until it is set up."""
    monkeypatch.setitem(app.config, "DEMI_PUSH_URL", "")
    statements = []
    engine = session.get_bind()

    def count(*_args):
        statements.append(1)

    sa_event.listen(engine, "before_cursor_execute", count)
    try:
        with app.test_request_context():
            mark_rows(session.query(Project))
    finally:
        sa_event.remove(engine, "before_cursor_execute", count)

    assert not statements


@pytest.mark.parametrize("target, attribute", [(demi_marks, "_note_row"), (DemiMarks, "merge")])
def test_marking_bug_cannot_fail_the_write(client, auth_header, monkeypatch, target, attribute):
    """A bug in the flush or commit listener leaves the user's write answering 2xx."""
    project = factory_project_model()

    def bug(*_args, **_kwargs):
        raise RuntimeError("marking bug")

    monkeypatch.setattr(target, attribute, bug)

    response = client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK


def test_assigning_the_same_value_marks_none(app, session):
    """A row in session.dirty with no net change is not a write worth pushing."""
    project = factory_project_model()

    with app.test_request_context():
        project.name = str(project.name)
        session.commit()

        assert not committed_marks()
