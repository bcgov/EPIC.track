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

from api import create_app
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


class _Builds(list):
    """Project ids built so far, and the ids that read as deleted."""

    deleted: set


@pytest.fixture(name="payloads")
def fixture_payloads(monkeypatch, own_session):
    """Replace the payload read with one that opens a real session and stamps each build."""
    builds = _Builds()
    builds.deleted = set()

    def build(project_id):
        _db.session.execute(text("select 1"))
        builds.append(project_id)
        return None if project_id in builds.deleted else {"pushedAt": len(builds), "project": {"id": project_id}}

    monkeypatch.setattr(demi_push, "build_project_payload", build)
    return builds


@pytest.fixture(name="threads")
def fixture_threads(app, monkeypatch):
    """Run as outside tests, with fresh slots and threads recorded rather than started."""
    monkeypatch.setitem(app.config, "TESTING", False)
    monkeypatch.setattr(demi_push, "_push_slots", threading.BoundedSemaphore(4))
    created = []

    def thread(**kwargs):
        created.append(kwargs)
        return SimpleNamespace(start=lambda: None)

    monkeypatch.setattr(demi_push.threading, "Thread", thread)
    return created


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


def _no_sleep(_seconds):
    return None


def _start_pushes(app, count):
    return [demi_push.thread_starter(app, _marks([1, 2])) for _ in range(count)]


OK = _answer(200, {"id": "1", "action": "updated"})
TIMEOUT = requests.ReadTimeout()
UNAVAILABLE = _answer(503)
DEMI_404 = {"error": "Project not found", "id": "7"}


@pytest.mark.parametrize(
    "method, answer, word, level, attempts",
    [
        ("PUT", _answer(200, {"id": "7", "action": "updated"}), "sent", "INFO", 1),
        ("PUT", _answer(201, {"id": "7", "action": "created"}), "sent", "INFO", 1),
        ("PUT", _answer(200, {"id": "7", "action": "skipped", "reason": "nativeClash"}), "skipped", "WARNING", 1),
        ("PUT", _answer(400, {"code": "PROJECT_ID_MISMATCH"}), "refused", "ERROR", 1),
        ("PUT", _answer(400, {"code": "PUSHED_AT_INVALID"}), "refused", "ERROR", 1),
        ("PUT", _answer(400, {"code": "PAYLOAD_INVALID"}), "refused", "ERROR", 1),
        ("PUT", _answer(401), "refused", "ERROR", 1),
        ("PUT", _answer(404), "refused", "ERROR", 1),
        ("PUT", _answer(302), "refused", "ERROR", 1),
        ("PUT", _answer(409, {"code": "STALE_PUSH"}), "stale", "INFO", 1),
        ("PUT", _answer(409, {"code": "DUPLICATE_ID"}), "refused", "ERROR", 1),
        ("PUT", _answer(409, {"code": "CREATED_BEHIND"}), "failed", "ERROR", 2),
        ("PUT", _answer(429), "failed", "ERROR", 2),
        ("PUT", _answer(500), "failed", "ERROR", 2),
        ("PUT", _answer(503), "failed", "ERROR", 2),
        ("PUT", _answer(504), "failed", "ERROR", 2),
        ("PUT", requests.ReadTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectionError(), "failed", "ERROR", 2),
        ("DELETE", _answer(200, {"action": "deleted"}), "sent", "INFO", 1),
        ("DELETE", _answer(200, {"action": "unchanged"}), "sent", "INFO", 1),
        ("DELETE", _answer(200, {"id": "7", "action": "skipped", "reason": "eagleLinked"}), "skipped", "WARNING", 1),
        ("DELETE", _answer(404, DEMI_404), "gone", "INFO", 1),
        ("DELETE", _answer(404), "refused", "ERROR", 1),
        ("DELETE", _answer(404, {"error": "Not found"}), "refused", "ERROR", 1),
        ("DELETE", _answer(400, {"code": "PAYLOAD_INVALID"}), "refused", "ERROR", 1),
        ("DELETE", _answer(409, {"code": "STALE_PUSH"}), "refused", "ERROR", 1),
        ("DELETE", _answer(409, {"code": "CREATED_BEHIND"}), "refused", "ERROR", 1),
        ("DELETE", _answer(429), "failed", "ERROR", 2),
        ("DELETE", _answer(500), "failed", "ERROR", 2),
        ("DELETE", _answer(503), "failed", "ERROR", 2),
        ("DELETE", requests.ReadTimeout(), "failed", "ERROR", 2),
        ("DELETE", requests.ConnectionError(), "failed", "ERROR", 2),
    ],
)
def test_each_answer_gets_its_log_line_and_retry(app, payloads, logs, method, answer, word, level, attempts):
    """An answer logs one line at its level, and only a retryable one is sent twice, 5 s apart."""
    payloads.deleted.update([7] if method == "DELETE" else [])
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
    [UNAVAILABLE, TIMEOUT, requests.ConnectionError(), _answer(429), _answer(409, {"code": "CREATED_BEHIND"})],
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


def test_one_http_session_serves_every_project(app, payloads, logs, monkeypatch):
    """A send reuses one connection pool across its projects."""
    created, sent = [], []

    class _Session(requests.Session):
        def __init__(self):
            super().__init__()
            created.append(self)

        def request(self, method, url, **kwargs):
            sent.append(url)
            return OK

    monkeypatch.setattr(demi_push.requests, "Session", _Session)

    send_marks(app, _marks([1, 2, 3]))

    assert len(created) == 1
    assert len(sent) == 3


def test_delete_sends_no_body(app, payloads, logs):
    """A project still deleted is sent as a DELETE with no body."""
    payloads.deleted.add(7)
    demi = _Demi(_answer(200, {"action": "deleted"}))

    send_marks(app, _marks([7], deletes=[7]), http=demi)

    assert demi.calls[0].method == "DELETE"
    assert demi.calls[0].url == "http://demi.invalid/machine/track/projects/7"
    assert demi.calls[0].json is None


def test_delete_of_a_project_live_again_sends_a_put(app, payloads, logs):
    """A project restored after its delete was marked goes out as a PUT with current state."""
    demi = _Demi(OK)

    send_marks(app, _marks([7], deletes=[7]), http=demi)

    assert [call.method for call in demi.calls] == ["PUT"]
    assert demi.calls[0].json["project"] == {"id": 7}
    assert logs[0].getMessage() == "demi-push restored project_id=7 method=PUT"
    assert logs[1].getMessage().startswith("demi-push sent project_id=7 method=PUT")


@pytest.mark.parametrize(
    "method, deleted, reason",
    [("PUT", [], "nativeClash"), ("DELETE", [7], "eagleLinked")],
)
def test_skipped_answer_logs_its_reason(app, payloads, logs, method, deleted, reason):
    """The reason DEMI gives for skipping reaches the log."""
    payloads.deleted.update(deleted)
    demi = _Demi(_answer(200, {"id": "7", "action": "skipped", "reason": reason}))

    send_marks(app, _marks([7], deletes=deleted), http=demi)

    assert logs[0].getMessage() == f"demi-push skipped project_id=7 method={method} status=200 reason={reason}"


def test_missing_project_is_skipped_without_a_send(app, own_session, monkeypatch, logs):
    """A project with no payload logs skipped, with no status because nothing was sent."""
    monkeypatch.setattr(demi_push, "build_project_payload", lambda project_id: None)
    demi = _Demi(OK)

    send_marks(app, _marks([7]), http=demi)

    assert demi.calls == []
    assert logs[0].getMessage() == "demi-push skipped project_id=7 method=PUT reason=missing-or-deleted"


def test_database_error_during_build_is_retried(app, own_session, monkeypatch, logs):
    """A failed read gets the 5 s retry, on a session the failure did not poison."""
    attempts = []

    def build(project_id):
        attempts.append(project_id)
        _db.session.execute(text("select 1/0" if len(attempts) == 1 else "select 1"))
        return {"pushedAt": 1, "project": {"id": project_id}}

    monkeypatch.setattr(demi_push, "build_project_payload", build)
    demi = _Demi(OK)
    clock = _Clock()

    send_marks(app, _marks([7]), http=demi, sleep=clock.sleep, clock=clock)

    assert clock.sleeps == [5]
    assert len(demi.calls) == 1
    assert logs[0].getMessage().startswith("demi-push sent project_id=7")


def test_database_error_on_one_project_still_sends_the_next(app, own_session, monkeypatch, logs):
    """A project whose reads keep failing does not poison project 2's reads."""

    def build(project_id):
        _db.session.execute(text("select 1/0" if project_id == 1 else "select 1"))
        return {"pushedAt": 1, "project": {"id": project_id}}

    monkeypatch.setattr(demi_push, "build_project_payload", build)
    demi = _Demi(OK)

    send_marks(app, _marks([1, 2]), http=demi, sleep=_no_sleep)

    assert [call.url.rsplit("/", 1)[1] for call in demi.calls] == ["2"]
    assert _lines(logs)[0] == ("ERROR", "demi-push failed project_id=1 method=PUT status=DataError")
    assert _lines(logs)[1][1].startswith("demi-push sent project_id=2")


def test_send_exception_logs_only_its_class(app, payloads, logs):
    """A send error quoting the key leaves the key out of the log, and is not retried."""
    demi = _Demi(ValueError(f"bad header {KEY}"), OK)

    send_marks(app, _marks([1, 2]), http=demi)

    assert len(demi.calls) == 2
    assert _lines(logs)[0] == ("ERROR", "demi-push failed project_id=1 method=PUT exception=ValueError")
    assert KEY not in " ".join(message for _, message in _lines(logs))


def test_resolve_failure_retries_on_a_fresh_session(app, own_session, payloads, logs):
    """A failed read of the marks is retried once, on a session the failure did not poison."""
    reads = []

    def project_ids(session):
        reads.append(1)
        session.execute(text("select 1/0" if len(reads) == 1 else "select 1"))
        return {7}

    demi = _Demi(OK)

    send_marks(app, SimpleNamespace(project_ids=project_ids, delete_project_ids=set(), all_projects=False), http=demi)

    assert len(reads) == 2
    assert len(demi.calls) == 1


def test_resolve_gives_up_after_its_retry(app, own_session, logs):
    """Marks that cannot be read after the retry send nothing and log the failure."""
    reads = []

    def project_ids(_session):
        reads.append(1)
        raise ValueError("bad read")

    demi = _Demi(OK)

    send_marks(app, SimpleNamespace(project_ids=project_ids, delete_project_ids=set(), all_projects=False), http=demi)

    assert len(reads) == 2
    assert demi.calls == []
    assert _lines(logs) == [("ERROR", "demi-push failed step=resolve exception=ValueError")]


def test_session_is_removed_before_each_send(app, payloads, logs):
    """No session, so no connection, is held across any send, the retry included."""
    held = []

    def demi(*_args, **_kwargs):
        held.append(_db.session.registry.has())
        return UNAVAILABLE if len(held) == 1 else OK

    send_marks(app, _marks([1, 2]), http=demi, sleep=_no_sleep)

    assert payloads == [1, 1, 2]
    assert held == [False, False, False]


def _paced_run(app, count, all_projects, seconds_per_send=0.01):
    clock = _Clock()
    sent_at = []

    def demi(*_args, **_kwargs):
        sent_at.append(clock())
        clock.now += seconds_per_send
        return OK

    send_marks(app, _marks(range(1, count + 1), all_projects=all_projects), http=demi, sleep=clock.sleep, clock=clock)
    return clock, [later - earlier for earlier, later in zip(sent_at, sent_at[1:])]


def test_mark_all_sends_one_project_per_second(app, payloads, logs):
    """An import of 382 projects sends one request per second, measured start to start."""
    _, gaps = _paced_run(app, 382, all_projects=True)

    assert len(gaps) == 381
    assert min(gaps) == pytest.approx(1)


def test_more_than_20_projects_are_paced(app, payloads, logs):
    """A write reaching 21 projects, such as a proponent rename, is paced like an import."""
    _, gaps = _paced_run(app, 21, all_projects=False)

    assert min(gaps) == pytest.approx(1)


def test_20_projects_are_not_paced(app, payloads, logs):
    """A send of up to 20 projects goes out without waiting."""
    clock, _ = _paced_run(app, 20, all_projects=False)

    assert clock.sleeps == []


def test_slow_answer_during_mark_all_adds_no_extra_wait(app, payloads, logs):
    """A send slower than the interval has already used up the wait."""
    clock, _ = _paced_run(app, 3, all_projects=True, seconds_per_send=2)

    assert clock.sleeps == []


def test_mark_all_stops_after_three_failures_in_a_row(app, payloads, logs):
    """An outage ends an import after three projects and says how many it left."""
    demi = _Demi(UNAVAILABLE)

    send_marks(app, _marks(range(1, 7), all_projects=True), http=demi, sleep=_no_sleep, clock=_Clock())

    assert len(payloads) == 6  # three projects, two attempts each
    assert len(demi.calls) == 6
    assert _lines(logs)[-1] == ("ERROR", "demi-push abandoned after=3 left=3")


def test_success_resets_the_mark_all_failure_count(app, payloads, logs):
    """Failures with a success between them do not stop the import."""
    fail_twice = [UNAVAILABLE, UNAVAILABLE]
    demi = _Demi(*fail_twice, *fail_twice, OK, *fail_twice, *fail_twice, OK)

    send_marks(app, _marks(range(1, 7), all_projects=True), http=demi, sleep=_no_sleep, clock=_Clock())

    assert demi.calls[-1].url.endswith("/track/projects/6")
    assert "abandoned" not in " ".join(message for _, message in _lines(logs))


def test_refused_answers_do_not_abandon_the_mark_all(app, payloads, logs):
    """A refusal means DEMI answered, so it is not an outage."""
    demi = _Demi(_answer(400, {"code": "PAYLOAD_INVALID"}))

    send_marks(app, _marks(range(1, 6), all_projects=True), http=demi, sleep=_no_sleep, clock=_Clock())

    assert len(demi.calls) == 5


def test_other_sends_do_not_stop_after_failures(app, payloads, logs):
    """Only an import is abandoned; a small send tries every project."""
    demi = _Demi(UNAVAILABLE)

    send_marks(app, _marks(range(1, 5)), http=demi, sleep=_no_sleep)

    assert len(demi.calls) == 8


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
    # Any read from this thread would land on the test's shared connection.
    monkeypatch.setattr(demi_push, "build_project_payload", lambda project_id: None)

    response = _delete_project(client, auth_header, factory_project_model())

    assert response.status_code == HTTPStatus.OK
    assert entered.wait(10)
    assert not finished.is_set()
    release.set()
    threads[0].join(10)
    assert finished.is_set()


@pytest.mark.parametrize("testing, thread_count", [(True, 0), (False, 1)])
def test_default_starter_only_starts_threads_outside_testing(app, monkeypatch, threads, testing, thread_count):
    """Under TESTING the default starter does nothing; otherwise it starts one daemon thread."""
    monkeypatch.setitem(app.config, "TESTING", testing)

    demi_push.thread_starter(app, _marks([1]))

    assert len(threads) == thread_count
    assert all(item["daemon"] for item in threads)


def test_fifth_live_push_is_dropped_and_logged(app, threads, logs):
    """A worker runs four push threads at most; the next push logs what it lost."""
    _start_pushes(app, 5)

    assert len(threads) == 4
    assert _lines(logs) == [("ERROR", "demi-push dropped projects=2")]


def test_finished_push_frees_its_slot_even_when_it_raises(app, threads, logs, monkeypatch):
    """A thread that dies still gives its slot back."""

    def explode(_app, _marks_arg):
        raise RuntimeError("send blew up")

    monkeypatch.setattr(demi_push, "send_marks", explode)
    _start_pushes(app, 4)

    with pytest.raises(RuntimeError):
        threads[0]["target"](*threads[0]["args"])
    _start_pushes(app, 1)

    assert len(threads) == 5
    assert logs == []


def test_thread_that_cannot_start_gives_its_slot_back(app, threads, monkeypatch):
    """A failed thread start does not use up a slot for the life of the worker."""

    def no_thread(**_kwargs):
        raise RuntimeError("can't start new thread")

    monkeypatch.setattr(demi_push.threading, "Thread", no_thread)

    with pytest.raises(RuntimeError):
        demi_push.thread_starter(app, _marks([1]))

    assert demi_push._push_slots.acquire(blocking=False)
    assert demi_push._push_slots._value == 3


@pytest.mark.parametrize("key, errors", [("", 1), (KEY, 0)])
def test_url_without_key_logs_one_error_at_start(monkeypatch, logs, key, errors):
    """App start reports a URL with no key once, and stays quiet when both are set."""
    # By dotted path: test_configuration reloads api.config, which replaces the class.
    monkeypatch.setattr("api.config.TestConfig.DEMI_PUSH_URL", "http://demi.invalid/machine")
    monkeypatch.setattr("api.config.TestConfig.DEMI_PUSH_KEY", key)

    create_app("testing")

    assert len([record for record in logs if "demi-push off" in record.getMessage()]) == errors
