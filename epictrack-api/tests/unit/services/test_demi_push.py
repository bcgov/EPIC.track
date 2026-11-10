"""Tests for the sender that pushes committed Track writes to DEMI."""
import json
import logging
import threading
from http import HTTPStatus
from types import SimpleNamespace
from urllib.parse import urljoin

import pytest
import requests
from sqlalchemy import text
from sqlalchemy.orm import scoped_session, sessionmaker

from api.models import db as _db
from api.services import demi_push
from api.services.demi_push import send_marks
from tests.utilities.factory_utils import factory_project_model

API_BASE_URL = "/api/v1/"
KEY = "test-subscription-key"


@pytest.fixture(autouse=True)
def push_config(app, monkeypatch):
    """Turn the push on."""
    monkeypatch.setitem(app.config, "DEMI_PUSH_URL", "http://demi.invalid/machine/")
    monkeypatch.setitem(app.config, "DEMI_PUSH_KEY", KEY)


@pytest.fixture(name="logs")
def fixture_logs(app, monkeypatch):
    """Collect the app logger's records; that logger does not propagate to the root."""
    # The test database setup runs Alembic, whose fileConfig disables existing loggers.
    monkeypatch.setattr(app.logger, "disabled", False)
    records = []
    handler = logging.Handler(level=logging.INFO)
    handler.emit = records.append
    level = app.logger.level
    app.logger.addHandler(handler)
    app.logger.setLevel(logging.INFO)
    yield records
    app.logger.removeHandler(handler)
    app.logger.setLevel(level)


@pytest.fixture(name="own_session")
def fixture_own_session(session, monkeypatch):
    """Give the sender its own session, so its remove() leaves the test's savepoint session alone."""
    monkeypatch.setattr(_db, "session", scoped_session(sessionmaker(bind=_db.engine)))


@pytest.fixture(name="payloads")
def fixture_payloads(monkeypatch, own_session):
    """Replace the payload read with one that opens a real session and stamps each build."""
    builds = []

    def build(project_id):
        _db.session.execute(text("select 1"))
        builds.append(project_id)
        return {"pushedAt": len(builds), "project": {"id": project_id}}

    monkeypatch.setattr(demi_push, "build_project_payload", build)
    return builds


class _Demi:
    """HTTP stub that plays its answers in order, repeating the last, and records each call."""

    def __init__(self, *answers):
        self.answers = list(answers)
        self.calls = []

    def __call__(self, method, url, **kwargs):
        self.calls.append(SimpleNamespace(method=method, url=url, **kwargs))
        answer = self.answers.pop(0) if len(self.answers) > 1 else self.answers[0]
        if isinstance(answer, Exception):
            raise answer
        return answer


class _Clock:
    """Clock that only moves when something sleeps or advances it."""

    def __init__(self):
        self.now = 100.0
        self.sleeps = []

    def __call__(self):
        return self.now

    def sleep(self, seconds):
        self.sleeps.append(seconds)
        self.now += seconds


def _answer(status, body=None):
    response = requests.Response()
    response.status_code = status
    response._content = b"<html>gateway</html>" if body is None else json.dumps(body).encode()
    return response


def _marks(ids, deletes=(), all_projects=False):
    return SimpleNamespace(
        project_ids=lambda session: set(ids), delete_project_ids=set(deletes), all_projects=all_projects
    )


def _lines(logs):
    return [(record.levelname, record.getMessage()) for record in logs]


OK = _answer(200, {"id": "1", "action": "updated"})
TIMEOUT = requests.ReadTimeout()
UNAVAILABLE = _answer(503)


@pytest.mark.parametrize(
    "method, answer, word, level, attempts",
    [
        ("PUT", _answer(200, {"id": "7", "action": "updated"}), "sent", "INFO", 1),
        ("PUT", _answer(201, {"id": "7", "action": "created"}), "sent", "INFO", 1),
        ("PUT", _answer(200, {"action": "skipped", "reason": "no change"}), "sent", "INFO", 1),
        ("PUT", _answer(400, {"code": "PROJECT_ID_MISMATCH"}), "refused", "ERROR", 1),
        ("PUT", _answer(400, {"code": "PUSHED_AT_INVALID"}), "refused", "ERROR", 1),
        ("PUT", _answer(400, {"code": "PAYLOAD_INVALID"}), "refused", "ERROR", 1),
        ("PUT", _answer(401), "refused", "ERROR", 1),
        ("PUT", _answer(404), "refused", "ERROR", 1),
        ("PUT", _answer(429), "refused", "ERROR", 1),
        ("PUT", _answer(302), "refused", "ERROR", 1),
        ("PUT", _answer(409, {"code": "STALE_PUSH"}), "stale", "INFO", 1),
        ("PUT", _answer(409, {"code": "DUPLICATE_ID"}), "refused", "ERROR", 1),
        ("PUT", _answer(409, {"code": "CREATED_BEHIND"}), "failed", "ERROR", 2),
        ("PUT", _answer(500), "failed", "ERROR", 2),
        ("PUT", _answer(503), "failed", "ERROR", 2),
        ("PUT", _answer(504), "failed", "ERROR", 2),
        ("PUT", requests.ReadTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectionError(), "failed", "ERROR", 2),
        ("DELETE", _answer(200, {"action": "deleted"}), "sent", "INFO", 1),
        ("DELETE", _answer(200, {"action": "unchanged"}), "sent", "INFO", 1),
        ("DELETE", _answer(404), "gone", "INFO", 1),
        ("DELETE", _answer(400, {"code": "PAYLOAD_INVALID"}), "refused", "ERROR", 1),
        ("DELETE", _answer(409, {"code": "STALE_PUSH"}), "refused", "ERROR", 1),
        ("DELETE", _answer(409, {"code": "CREATED_BEHIND"}), "refused", "ERROR", 1),
        ("DELETE", _answer(500), "failed", "ERROR", 2),
        ("DELETE", _answer(503), "failed", "ERROR", 2),
        ("DELETE", requests.ReadTimeout(), "failed", "ERROR", 2),
        ("DELETE", requests.ConnectionError(), "failed", "ERROR", 2),
    ],
)
def test_each_answer_gets_its_log_line_and_retry(app, payloads, logs, method, answer, word, level, attempts):
    """An answer logs one line at its level, and only a retryable one is sent twice, 5 s apart."""
    demi = _Demi(answer)
    clock = _Clock()

    send_marks(
        app, _marks([7], deletes=[7] if method == "DELETE" else []), http=demi, sleep=clock.sleep, clock=clock
    )

    assert [call.method for call in demi.calls] == [method] * attempts
    assert clock.sleeps == [5] * (attempts - 1)
    assert len(logs) == 1
    assert logs[0].levelname == level
    assert logs[0].getMessage().startswith(f"demi-push {word} project_id=7 method={method} status=")


@pytest.mark.parametrize(
    "first",
    [UNAVAILABLE, TIMEOUT, requests.ConnectionError(), _answer(409, {"code": "CREATED_BEHIND"})],
)
def test_retry_rebuilds_the_payload_and_can_succeed(app, payloads, logs, first):
    """The retry carries current state, and a retry that lands logs as sent."""
    demi = _Demi(first, OK)
    clock = _Clock()

    send_marks(app, _marks([7]), http=demi, sleep=clock.sleep, clock=clock)

    assert [call.json["pushedAt"] for call in demi.calls] == [1, 2]
    assert payloads == [7, 7]
    assert logs[0].getMessage().startswith("demi-push sent project_id=7")


def test_put_targets_the_route_with_the_key_and_timeouts(app, payloads, logs):
    """The PUT goes to the APIM route, carries the body and key, and follows no redirect."""
    demi = _Demi(OK)

    send_marks(app, _marks([7]), http=demi)

    call = demi.calls[0]
    assert call.url == "http://demi.invalid/machine/track/projects/7"
    assert call.json["project"] == {"id": 7}
    assert call.headers["Ocp-Apim-Subscription-Key"] == KEY
    assert call.timeout == (5, 35)
    assert call.allow_redirects is False


def test_delete_sends_no_body_and_builds_no_payload(app, payloads, logs):
    """A project with DELETE intent is deleted, not read and sent."""
    demi = _Demi(_answer(200, {"action": "deleted"}))

    send_marks(app, _marks([7], deletes=[7]), http=demi)

    assert demi.calls[0].method == "DELETE"
    assert demi.calls[0].url == "http://demi.invalid/machine/track/projects/7"
    assert demi.calls[0].json is None
    assert payloads == []


def test_missing_project_is_skipped_without_a_send(app, own_session, monkeypatch, logs):
    """A project with no payload logs skipped and sends nothing."""
    monkeypatch.setattr(demi_push, "build_project_payload", lambda project_id: None)
    demi = _Demi(OK)

    send_marks(app, _marks([7]), http=demi)

    assert demi.calls == []
    assert logs[0].getMessage().startswith("demi-push skipped project_id=7")


def test_database_error_on_one_project_still_sends_the_next(app, own_session, monkeypatch, logs):
    """A failed statement on project 1 does not poison project 2's reads."""

    def build(project_id):
        _db.session.execute(text("select 1/0" if project_id == 1 else "select 1"))
        return {"pushedAt": 1, "project": {"id": project_id}}

    monkeypatch.setattr(demi_push, "build_project_payload", build)
    demi = _Demi(OK)

    send_marks(app, _marks([1, 2]), http=demi)

    assert [call.url.rsplit("/", 1)[1] for call in demi.calls] == ["2"]
    assert _lines(logs)[0] == ("ERROR", "demi-push failed project_id=1 method=PUT exception=DataError")
    assert _lines(logs)[1][1].startswith("demi-push sent project_id=2")


def test_send_exception_logs_only_its_class(app, payloads, logs):
    """A send error quoting the key leaves the key out of the log, and is not retried."""
    demi = _Demi(ValueError(f"bad header {KEY}"), OK)

    send_marks(app, _marks([1, 2]), http=demi)

    assert len(demi.calls) == 2
    assert _lines(logs)[0] == ("ERROR", "demi-push failed project_id=1 method=PUT exception=ValueError")
    assert KEY not in " ".join(message for _, message in _lines(logs))


def test_session_is_removed_before_each_send(app, payloads, logs):
    """No session, so no connection, is held across any send, the retry included."""
    held = []

    def demi(*_args, **_kwargs):
        held.append(_db.session.registry.has())
        return UNAVAILABLE if len(held) == 1 else OK

    send_marks(app, _marks([1, 2]), http=demi, sleep=lambda _seconds: None)

    assert payloads == [1, 1, 2]
    assert held == [False, False, False]


def test_mark_all_keeps_250ms_between_sends(app, payloads, logs):
    """An import of 382 projects sends one request per 250 ms, measured start to start."""
    clock = _Clock()
    sent_at = []

    def demi(*_args, **_kwargs):
        sent_at.append(clock())
        clock.now += 0.01
        return OK

    send_marks(app, _marks(range(1, 383), all_projects=True), http=demi, sleep=clock.sleep, clock=clock)

    gaps = [later - earlier for earlier, later in zip(sent_at, sent_at[1:])]
    assert len(sent_at) == 382
    assert min(gaps) == pytest.approx(0.25)


def test_slow_answer_during_mark_all_adds_no_extra_wait(app, payloads, logs):
    """A send slower than the interval has already used up the wait."""
    clock = _Clock()

    def demi(*_args, **_kwargs):
        clock.now += 1
        return OK

    send_marks(app, _marks([1, 2, 3], all_projects=True), http=demi, sleep=clock.sleep, clock=clock)

    assert clock.sleeps == []


def test_other_sends_are_not_paced(app, payloads, logs):
    """Only an import is paced."""
    clock = _Clock()

    send_marks(app, _marks([1, 2, 3]), http=_Demi(OK), sleep=clock.sleep, clock=clock)

    assert clock.sleeps == []


def _delete_project(client, auth_header, project):
    return client.delete(urljoin(API_BASE_URL, f"projects/{project.id}"), headers=auth_header)


def test_committed_write_starts_one_push(app, client, auth_header, monkeypatch):
    """A committed write hands its marks and the real app to the thread starter."""
    started = []
    monkeypatch.setattr(demi_push, "thread_starter", lambda real_app, marks: started.append((real_app, marks)))
    project = factory_project_model()

    response = _delete_project(client, auth_header, project)

    assert response.status_code == HTTPStatus.OK
    assert len(started) == 1
    assert started[0][0] is app
    assert started[0][1].delete_project_ids == {project.id}


def test_no_push_url_starts_no_thread(app, client, auth_header, monkeypatch):
    """Without a DEMI push URL a write starts nothing."""
    monkeypatch.setitem(app.config, "DEMI_PUSH_URL", "")
    started = []
    monkeypatch.setattr(demi_push, "thread_starter", lambda real_app, marks: started.append(marks))

    response = _delete_project(client, auth_header, factory_project_model())

    assert response.status_code == HTTPStatus.OK
    assert started == []


def test_failed_thread_start_cannot_fail_the_write(client, auth_header, monkeypatch):
    """A write that committed still answers 2xx when the thread cannot start."""

    def refuse(_app, _marks_arg):
        raise RuntimeError("can't start new thread")

    monkeypatch.setattr(demi_push, "thread_starter", refuse)

    response = _delete_project(client, auth_header, factory_project_model())

    assert response.status_code == HTTPStatus.OK


def test_hanging_demi_does_not_hold_the_request(client, auth_header, monkeypatch):
    """The write answers 2xx while its send is still stuck inside DEMI."""
    entered, release, finished = threading.Event(), threading.Event(), threading.Event()

    def hanging(*_args, **_kwargs):
        entered.set()
        release.wait(30)
        finished.set()
        return _answer(200, {"action": "deleted"})

    threads = []

    def start(real_app, marks):
        thread = threading.Thread(target=send_marks, args=(real_app, marks), kwargs={"http": hanging}, daemon=True)
        threads.append(thread)
        thread.start()

    monkeypatch.setattr(demi_push, "thread_starter", start)

    response = _delete_project(client, auth_header, factory_project_model())

    assert response.status_code == HTTPStatus.OK
    assert entered.wait(10)
    assert not finished.is_set()
    release.set()
    threads[0].join(10)
    assert finished.is_set()


@pytest.mark.parametrize("testing, thread_count", [(True, 0), (False, 1)])
def test_default_starter_only_starts_threads_outside_testing(app, monkeypatch, testing, thread_count):
    """Under TESTING the default starter does nothing; otherwise it starts one daemon thread."""
    created = []

    def thread(**kwargs):
        created.append(kwargs)
        return SimpleNamespace(start=lambda: None)

    monkeypatch.setattr(demi_push.threading, "Thread", thread)
    monkeypatch.setitem(app.config, "TESTING", testing)

    demi_push.thread_starter(app, _marks([1]))

    assert len(created) == thread_count
    assert all(item["daemon"] and item["target"] is send_marks for item in created)
