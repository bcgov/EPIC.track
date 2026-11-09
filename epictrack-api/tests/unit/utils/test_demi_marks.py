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
"""Tests for the request-scoped marks of projects a write changed."""
from copy import copy
from http import HTTPStatus
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from urllib.parse import urljoin

import pytest
from werkzeug.datastructures import FileStorage

from api.models import Event, Project, Staff, Work
from api.models.action_configuration import ActionConfiguration
from api.models.special_field import EntityEnum
from api.services.event import EventService
from api.services.special_field import SpecialFieldService
from api.services.sync_form_data import SyncFormDataService
from api.utils import demi_marks
from api.utils.demi_marks import DemiMarks, committed_marks, mark_entity
from tests.unit.apis.test_event_actions_auth import _complete_event, _work_with_pending_create_work_decision
from tests.utilities.factory_scenarios import TestJwtClaims, TestProjectInfo, TestWorkInfo
from tests.utilities.factory_utils import factory_project_model, factory_work_model
from tests.utilities.helpers import prepare_work_payload

API_BASE_URL = "/api/v1/"


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


def test_complete_event_with_action_marks_project(client, jwt, session, seen):
    """Completing a milestone whose outcome runs actions marks the work's project."""
    work_id, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)
    project_id = session.get(Work, work_id).project_id

    response = _complete_event(client, jwt, session, event, outcome_config, TestJwtClaims.staff_admin_role)

    assert response.status_code == HTTPStatus.OK, response.json
    marks = seen[-1]
    assert project_id in marks.project_ids(session)
    assert not marks.delete_project_ids


def test_delete_event_marks_project(client, auth_header, session, seen):
    """Deleting a milestone goes through Query.update, so the helper must mark it."""
    response = client.post(urljoin(API_BASE_URL, "works"), json=prepare_work_payload(), headers=auth_header)
    assert response.status_code == HTTPStatus.CREATED, response.json
    work = session.get(Work, response.json["id"])
    event = session.query(Event).filter(Event.work_id == work.id, Event.actual_date.is_(None)).first()

    response = client.delete(urljoin(API_BASE_URL, f"milestones/events/{event.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK, response.json
    assert seen[-1].project_ids(session) == {work.project_id}


def test_import_projects_marks_all_without_delete(client, auth_header, session, seen):
    """An import marks every project and never asks for a DELETE."""
    factory_project_model()
    file_path = Path("./src/api/templates/master_templates/Projects.xlsx").resolve()
    with open(file_path, "rb") as stream:
        response = client.post(
            urljoin(API_BASE_URL, "projects/import"),
            data={"file": FileStorage(stream=stream, filename="projects.xlsx")},
            content_type="multipart/form-data",
            headers=auth_header,
        )

    assert response.status_code == HTTPStatus.CREATED
    marks = seen[-1]
    assert marks.project_ids(session) == set(session.scalars(Project.query.with_entities(Project.id).statement))
    assert not marks.delete_project_ids


def test_delete_project_marks_delete(client, auth_header, session, seen):
    """Deleting a project marks it with DELETE intent."""
    project = factory_project_model()

    response = client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    marks = seen[-1]
    assert marks.project_ids(session) == {project.id}
    assert marks.delete_project_ids == {project.id}


def test_move_work_marks_old_and_new_project(client, auth_header, session, seen):
    """Moving a work to another project marks both projects."""
    work = factory_work_model()
    old_project_id = work.project_id
    new_project = _another_project()
    payload = copy(TestWorkInfo.work1.value)
    payload["project_id"] = new_project.id

    response = client.put(urljoin(API_BASE_URL, f"works/{work.id}"), headers=auth_header, json=payload)

    assert response.status_code == HTTPStatus.OK, response.json
    assert seen[-1].project_ids(session) == {old_project_id, new_project.id}


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


def test_requests_do_not_share_marks(client, auth_header, session, seen):
    """Marks from one request never reach the next, though tests keep one app context open."""
    first = factory_project_model()
    second = _another_project()

    client.delete(urljoin(API_BASE_URL, f"projects/{first.id}"), headers=auth_header)
    client.delete(urljoin(API_BASE_URL, f"projects/{second.id}"), headers=auth_header)

    assert seen[-1].project_ids(session) == {second.id}


def test_process_actions_marks_project_without_any_row_change(app, client, jwt, session):
    """Actions can write through Query.update alone, so running them marks the project by itself."""
    work_id, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)
    event.actual_date = event.anticipated_date
    session.commit()

    with app.test_request_context(), patch("api.services.event.ActionHandler"):
        EventService._process_actions(event, outcome_config.id)  # pylint: disable=protected-access
        session.commit()

        assert committed_marks().project_ids(session) == {session.get(Work, work_id).project_id}


def test_sync_form_data_delete_marks_delete(client, auth_header, session, seen):
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
    assert seen[-1].delete_project_ids == {project.id}


def test_marks_resolve_through_parent_rows(client, jwt, session):
    """Event configuration and proponent marks resolve to their projects."""
    work_id, event, _ = _work_with_pending_create_work_decision(client, jwt, session)
    project = session.get(Project, session.get(Work, work_id).project_id)

    by_configuration = DemiMarks()
    by_configuration.refs["event_configuration_id"].add(event.event_configuration_id)
    by_proponent = DemiMarks()
    by_proponent.refs["proponent_id"].add(project.proponent_id)

    assert by_configuration.project_ids(session) == {project.id}
    assert project.id in by_proponent.project_ids(session)


def test_mark_entity_marks_mirrored_models_only(app, session):
    """A special field on a work marks its project; one on staff marks nothing."""
    work = factory_work_model()

    with app.test_request_context():
        mark_entity(Staff, 1)
        session.commit()
        assert not committed_marks()

        mark_entity(Work, work.id)
        session.commit()
        assert committed_marks().project_ids(session) == {work.project_id}


@pytest.mark.parametrize("setting", ["DEMI_PUSH_URL", "DEMI_PUSH_KEY"])
def test_push_config_missing_marks_none(app, client, auth_header, monkeypatch, seen, setting):
    """Without both the DEMI push URL and its key nothing is marked."""
    monkeypatch.setitem(app.config, setting, "")
    project = factory_project_model()

    response = client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)

    assert response.status_code == HTTPStatus.OK
    assert not seen[-1]


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


def test_process_actions_without_configurations_marks_none(app, client, jwt, session):
    """An outcome with no active action configurations changes nothing, so it marks nothing."""
    _, event, outcome_config = _work_with_pending_create_work_decision(client, jwt, session)
    event.actual_date = event.anticipated_date
    session.query(ActionConfiguration).filter_by(outcome_configuration_id=outcome_config.id).update(
        {"is_active": False}
    )
    session.commit()

    with app.test_request_context(), patch("api.services.event.ActionHandler"):
        EventService._process_actions(event, outcome_config.id)  # pylint: disable=protected-access
        session.commit()

        assert not committed_marks()


def test_import_proponents_marks_all(client, auth_header, seen):
    """A proponent import can touch any project, so it marks them all."""
    file_path = Path("./src/api/templates/master_templates/Proponents.xlsx").resolve()
    with open(file_path, "rb") as stream:
        response = client.post(
            urljoin(API_BASE_URL, "proponents/import"),
            data={"file": FileStorage(stream=stream, filename="proponents.xlsx")},
            content_type="multipart/form-data",
            headers=auth_header,
        )

    assert response.status_code == HTTPStatus.CREATED
    assert seen[-1].all_projects


def test_special_field_query_update_marks_project(app, session):
    """The special field write goes through Query.update, which only the helper can see."""
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

        assert committed_marks().project_ids(session) == {project.id}


def test_sync_deletions_marks_parent_project(app, session):
    """Sync-form-data deletions go through Query.update, which only the helper can see."""
    work = factory_work_model()

    with app.test_request_context():
        SyncFormDataService._sync_deletions("work_phases", [0], {"work_id": work.id})  # pylint: disable=protected-access
        session.commit()

        assert committed_marks().project_ids(session) == {work.project_id}
