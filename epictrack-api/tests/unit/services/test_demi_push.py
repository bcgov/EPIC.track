"""Tests for the sender that pushes committed Track writes to DEMI, one record per call."""
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
from api.services.demi_payload import DemiRecord
from api.services.demi_push import send_marks
from api.utils.demi_marks import DemiMarks
from tests.utilities.factory_utils import factory_project_model

API_BASE_URL = "/api/v1/"
KEY = "test-subscription-key"
BASE = "http://demi.invalid/machine/track"


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


class _Rows:
    """Track rows as the sender reads them: current state per (table, id), and every read."""

    def __init__(self):
        self.state = {}
        self.related = {}
        self.reads = []

    def project(self, project_id, delete=False):
        self.state[("projects", project_id)] = {"kind": "project", "delete": delete, "project_id": project_id,
                                                "path_parts": ("projects", project_id)}

    def work(self, work_id, project_id, delete=False):
        self.state[("works", work_id)] = {
            "kind": "work", "delete": delete, "project_id": project_id, "work_id": work_id, "work_type_id": 6,
            "path_parts": ("projects", project_id, "works", work_id),
        }

    def phase(self, phase_id, work_id, project_id, delete=False):
        self.state[("work_phases", phase_id)] = {
            "kind": "phase", "delete": delete, "project_id": project_id, "work_id": work_id, "work_type_id": 6,
            "work_phase_id": phase_id, "path_parts": ("projects", project_id, "phases", phase_id),
        }

    def event(self, event_id, phase_id, work_id, project_id, delete=False):
        self.state[("events", event_id)] = {
            "kind": "event", "delete": delete, "project_id": project_id, "work_id": work_id, "work_type_id": 6,
            "work_phase_id": phase_id, "path_parts": ("projects", project_id, "events", event_id),
        }

    def resolve(self, table, row_id, nested=False):
        _db.session.execute(text("select 1"))
        self.reads.append((table, row_id))
        spec = self.state.get((table, row_id))
        if spec is None:
            return None
        body = None if spec["delete"] else {"pushedAt": len(self.reads), "nested": nested, "id": row_id}
        return DemiRecord(record_id=row_id, pushed_at=len(self.reads), body=body, **spec)

    def work_ids_of(self, table, row_ids):
        return {row_id: self.state[(table, row_id)]["work_id"] for row_id in row_ids}


@pytest.fixture(name="rows")
def fixture_rows(monkeypatch, own_session):
    """Replace the record reads with ones that open a real session and stamp each read."""
    rows = _Rows()
    monkeypatch.setattr(demi_push, "resolve_record", rows.resolve)
    monkeypatch.setattr(demi_push, "work_ids_of", rows.work_ids_of)
    monkeypatch.setattr(demi_push, "related_rows", lambda table, row_id: rows.related.get((table, row_id), []))
    return rows


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

    def sent(self):
        return [(call.method, call.url.removeprefix(BASE)) for call in self.calls]


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


def _marks(*rows):
    """Marks from (table, id, op) or (table, id, op, from_project_id) tuples."""
    marks = DemiMarks()
    for row in rows:
        marks.add(*row)
    return marks


def _projects(rows, ids, op="update"):
    for project_id in ids:
        rows.project(project_id)
    return _marks(*[("projects", project_id, op) for project_id in ids])


def _lines(logs):
    return [(record.levelname, record.getMessage()) for record in logs]


def _no_sleep(_seconds):
    return None


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
        ("PUT", _answer(400, {"code": "PAYLOAD_INVALID"}), "refused", "ERROR", 1),
        ("PUT", _answer(401), "refused", "ERROR", 1),
        ("PUT", _answer(404), "refused", "ERROR", 1),
        ("PUT", _answer(302), "refused", "ERROR", 1),
        ("PUT", _answer(409, {"code": "STALE_PUSH"}), "stale", "INFO", 1),
        ("PUT", _answer(409, {"code": "NOT_BACKFILLED"}), "refused", "WARNING", 1),
        ("PUT", _answer(404, {"code": "PARENT_NOT_FOUND", "id": "7"}), "refused", "WARNING", 2),
        ("PUT", _answer(409, {"code": "CREATED_BEHIND"}), "failed", "ERROR", 2),
        ("PUT", _answer(429), "failed", "ERROR", 2),
        ("PUT", _answer(500), "failed", "ERROR", 2),
        ("PUT", requests.ReadTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectTimeout(), "failed", "ERROR", 2),
        ("PUT", requests.ConnectionError(), "failed", "ERROR", 2),
        ("POST", _answer(201, {"id": "7", "action": "created"}), "sent", "INFO", 1),
        ("POST", _answer(409, {"code": "STALE_PUSH"}), "stale", "INFO", 1),
        ("POST", _answer(409, {"code": "CREATED_BEHIND"}), "failed", "ERROR", 2),
        ("DELETE", _answer(200, {"action": "deleted"}), "sent", "INFO", 1),
        ("DELETE", _answer(200, {"id": "7", "action": "skipped", "reason": "eagleLinked"}), "skipped", "WARNING", 1),
        ("DELETE", _answer(404, DEMI_404), "gone", "INFO", 1),
        ("DELETE", _answer(404), "refused", "ERROR", 1),
        ("DELETE", _answer(409, {"code": "STALE_PUSH"}), "stale", "INFO", 1),
        ("DELETE", _answer(409, {"code": "CREATED_BEHIND"}), "refused", "ERROR", 1),
        ("DELETE", _answer(500), "failed", "ERROR", 2),
        ("DELETE", requests.ReadTimeout(), "failed", "ERROR", 2),
    ],
)
def test_each_answer_gets_its_log_line_and_retry(app, rows, logs, method, answer, word, level, attempts):
    """An answer logs one line at its level, and only a retryable one is sent twice, 5 s apart."""
    rows.project(7)
    rows.work(70, 7, delete=method == "DELETE")
    demi = _Demi(answer)
    clock = _Clock()

    send_marks(app, _marks(("works", 70, "create" if method == "POST" else "update")), http=demi,
               sleep=clock.sleep, clock=clock)

    assert [call.method for call in demi.calls] == [method] * attempts
    assert clock.sleeps == [5] * (attempts - 1)
    assert len(logs) == 1
    assert logs[0].levelname == level
    assert logs[0].getMessage().startswith(f"demi-push {word} id=work:70 method={method} status=")


@pytest.mark.parametrize(
    "first",
    [UNAVAILABLE, TIMEOUT, requests.ConnectionError(), _answer(429), _answer(409, {"code": "CREATED_BEHIND"})],
)
def test_retry_reads_the_record_again_and_can_succeed(app, rows, logs, first):
    """The retry carries current state with a fresh stamp, and a retry that lands logs as sent."""
    demi = _Demi(first, OK)
    clock = _Clock()

    send_marks(app, _projects(rows, [7]), http=demi, sleep=clock.sleep, clock=clock)

    assert [call.json["pushedAt"] for call in demi.calls] == [1, 2]
    assert logs[0].getMessage().startswith("demi-push sent id=project:7")


def test_put_targets_the_route_with_the_key_and_timeouts(app, rows, logs):
    """The PUT goes to the APIM route, carries the body and key, and follows no redirect."""
    demi = _Demi(OK)

    send_marks(app, _projects(rows, [7]), http=demi)

    call = demi.calls[0]
    assert call.url == f"{BASE}/projects/7"
    assert call.json["id"] == 7
    assert call.headers["Ocp-Apim-Subscription-Key"] == KEY
    assert call.timeout == (5, 35)
    assert call.allow_redirects is False


@pytest.mark.parametrize(
    "mark, delete, method, path",
    [
        (("projects", 7, "create"), False, "POST", "/projects"),
        (("projects", 7, "update"), False, "PUT", "/projects/7"),
        (("projects", 7, "delete"), True, "DELETE", "/projects/7"),
        (("works", 70, "update"), False, "PUT", "/projects/7/works/70"),
        (("works", 70, "delete"), True, "DELETE", "/projects/7/works/70?pushedAt=1&workTypeId=6"),
        (("work_phases", 700, "create"), False, "POST", "/projects/7/phases"),
        (("work_phases", 700, "update"), False, "PUT", "/projects/7/phases/700"),
        (("work_phases", 700, "update"), True, "DELETE", "/projects/7/phases/700?pushedAt=1&workTypeId=6"),
        (("events", 7000, "create"), False, "POST", "/projects/7/events"),
        (("events", 7000, "update"), False, "PUT", "/projects/7/events/7000"),
        (("events", 7000, "update"), True, "DELETE", "/projects/7/events/7000?pushedAt=1&workTypeId=6"),
    ],
)
def test_each_record_gets_its_verb_and_path(app, rows, logs, mark, delete, method, path):
    """The verb follows the row's state: new rows POST, changed rows PUT, rows out of the feed DELETE."""
    rows.project(7, delete=mark[0] == "projects" and delete)
    rows.work(70, 7, delete=mark[0] == "works" and delete)
    rows.phase(700, 70, 7, delete=mark[0] == "work_phases" and delete)
    rows.event(7000, 700, 70, 7, delete=mark[0] == "events" and delete)
    demi = _Demi(OK)

    send_marks(app, _marks(mark), http=demi)

    assert demi.sent() == [(method, path)]
    assert (demi.calls[0].json is None) is delete


def test_parents_go_first(app, rows, logs):
    """A run sends projects, then works, phases and events, each by id."""
    rows.project(7)
    rows.work(70, 7)
    rows.phase(700, 70, 7)
    rows.event(7000, 700, 70, 7)
    rows.event(6999, 700, 70, 7)
    demi = _Demi(OK)

    marks = _marks(("events", 7000, "update"), ("work_phases", 700, "update"), ("events", 6999, "update"),
                   ("projects", 7, "update"), ("works", 70, "update"))
    send_marks(app, marks, http=demi)

    assert [path for _, path in demi.sent()] == [
        "/projects/7", "/projects/7/works/70", "/projects/7/phases/700", "/projects/7/events/6999",
        "/projects/7/events/7000",
    ]


def test_new_work_is_one_nested_post(app, rows, logs):
    """A work created with its phases and events goes out as one call holding all of them."""
    rows.project(7)
    rows.work(70, 7)
    rows.phase(700, 70, 7)
    rows.event(7000, 700, 70, 7)
    demi = _Demi(OK)

    send_marks(app, _marks(("works", 70, "create"), ("work_phases", 700, "create"), ("events", 7000, "create")),
               http=demi)

    assert demi.sent() == [("POST", "/projects/7/works")]
    assert demi.calls[0].json["nested"] is True


def test_new_work_leaves_other_records_their_own_call(app, rows, logs):
    """Only the new work's own children ride along; another work's event still goes out by itself."""
    rows.project(7)
    rows.work(70, 7)
    rows.work(80, 7)
    rows.phase(800, 80, 7)
    rows.event(8000, 800, 80, 7)
    demi = _Demi(OK)

    send_marks(app, _marks(("works", 70, "create"), ("events", 8000, "update"), ("projects", 7, "update")),
               http=demi)

    assert demi.sent() == [("PUT", "/projects/7"), ("POST", "/projects/7/works"), ("PUT", "/projects/7/events/8000")]


def test_moved_work_leaves_its_old_project_then_arrives_whole(app, rows, logs):
    """A moved work is removed under the project it left, then posted with its children under the new one."""
    rows.project(8)
    rows.work(70, 8)
    demi = _Demi(OK)

    send_marks(app, _marks(("works", 70, "update", 7)), http=demi)

    assert demi.sent() == [("DELETE", "/projects/7/works/70?pushedAt=1&workTypeId=6"), ("POST", "/projects/8/works")]
    assert demi.calls[1].json["nested"] is True


def test_proponent_rename_sends_each_of_its_projects(app, rows, logs):
    """DEMI keeps the proponent name on each project, so each project of that proponent is sent."""
    rows.project(7)
    rows.project(8)
    rows.related[("proponents", 3)] = [("projects", 7), ("projects", 8)]
    demi = _Demi(OK)

    send_marks(app, _marks(("proponents", 3, "update"), ("projects", 8, "update")), http=demi)

    assert demi.sent() == [("PUT", "/projects/7"), ("PUT", "/projects/8")]


def test_failed_new_parent_skips_its_children(app, rows, logs):
    """When a new project's POST fails, its new work is not sent to a parent DEMI does not have."""
    rows.project(7)
    rows.work(70, 7)
    demi = _Demi(_answer(400, {"code": "PAYLOAD_INVALID"}))

    send_marks(app, _marks(("projects", 7, "create"), ("works", 70, "create")), http=demi)

    assert demi.sent() == [("POST", "/projects")]
    assert _lines(logs)[-1] == ("WARNING", "demi-push skipped id=work:70 reason=parent-failed")


def test_one_http_session_serves_every_record(app, rows, logs, monkeypatch):
    """A send reuses one connection pool across its records."""
    created, sent = [], []

    class _Session(requests.Session):
        def __init__(self):
            super().__init__()
            created.append(self)

        def request(self, method, url, **kwargs):
            sent.append(url)
            return OK

    monkeypatch.setattr(demi_push.requests, "Session", _Session)

    send_marks(app, _projects(rows, [1, 2, 3]))

    assert len(created) == 1
    assert len(sent) == 3


@pytest.mark.parametrize("method, delete, reason", [("PUT", False, "nativeClash"), ("DELETE", True, "eagleLinked")])
def test_skipped_answer_logs_its_reason(app, rows, logs, method, delete, reason):
    """The reason DEMI gives for skipping reaches the log."""
    rows.project(7, delete=delete)
    demi = _Demi(_answer(200, {"id": "7", "action": "skipped", "reason": reason}))

    send_marks(app, _marks(("projects", 7, "update")), http=demi)

    assert logs[0].getMessage() == f"demi-push skipped id=project:7 method={method} status=200 reason={reason}"


def test_row_outside_the_feed_is_skipped_without_a_send(app, rows, logs):
    """A row with no record logs skipped, with no status because nothing was sent."""
    demi = _Demi(OK)

    send_marks(app, _marks(("events", 7, "update")), http=demi)

    assert demi.calls == []
    assert _lines(logs) == [("INFO", "demi-push skipped id=event:7 reason=not-in-feed")]


def test_database_error_during_read_is_retried(app, own_session, monkeypatch, logs):
    """A failed read gets the 5 s retry, on a session the failure did not poison."""
    attempts = []

    def resolve(table, row_id, nested=False):
        attempts.append(row_id)
        _db.session.execute(text("select 1/0" if len(attempts) == 1 else "select 1"))
        return DemiRecord("project", row_id, False, row_id, ("projects", row_id), 1, body={"pushedAt": 1})

    monkeypatch.setattr(demi_push, "resolve_record", resolve)
    demi = _Demi(OK)
    clock = _Clock()

    send_marks(app, _marks(("projects", 7, "update")), http=demi, sleep=clock.sleep, clock=clock)

    assert clock.sleeps == [5]
    assert len(demi.calls) == 1
    assert logs[0].getMessage().startswith("demi-push sent id=project:7")


def test_database_error_on_one_record_still_sends_the_next(app, own_session, monkeypatch, logs):
    """A record whose reads keep failing does not poison record 2's reads."""

    def resolve(table, row_id, nested=False):
        _db.session.execute(text("select 1/0" if row_id == 1 else "select 1"))
        return DemiRecord("project", row_id, False, row_id, ("projects", row_id), 1, body={"pushedAt": 1})

    monkeypatch.setattr(demi_push, "resolve_record", resolve)
    demi = _Demi(OK)

    send_marks(app, _marks(("projects", 1, "update"), ("projects", 2, "update")), http=demi, sleep=_no_sleep)

    assert demi.sent() == [("PUT", "/projects/2")]
    assert _lines(logs)[0] == ("ERROR", "demi-push failed id=project:1 method=None status=DataError")


def test_send_exception_logs_only_its_class(app, rows, logs):
    """A send error quoting the key leaves the key out of the log, and is not retried."""
    demi = _Demi(ValueError(f"bad header {KEY}"), OK)

    send_marks(app, _projects(rows, [1, 2]), http=demi)

    assert len(demi.calls) == 2
    assert _lines(logs)[0] == ("ERROR", "demi-push failed id=project:1 exception=ValueError")
    assert KEY not in " ".join(message for _, message in _lines(logs))


def test_plan_failure_retries_on_a_fresh_session(app, rows, logs, monkeypatch):
    """A failed read while planning the run is retried once, on a session the failure did not poison."""
    reads = []
    rows.project(7)

    def related(_table, _row_id):
        reads.append(1)
        _db.session.execute(text("select 1/0" if len(reads) == 1 else "select 1"))
        return [("projects", 7)]

    monkeypatch.setattr(demi_push, "related_rows", related)
    demi = _Demi(OK)

    send_marks(app, _marks(("proponents", 3, "update")), http=demi)

    assert len(reads) == 2
    assert demi.sent() == [("PUT", "/projects/7")]


def test_plan_gives_up_after_its_retry(app, rows, logs, monkeypatch):
    """Marks that cannot be planned after the retry send nothing and log the failure."""

    def related(_table, _row_id):
        raise ValueError("bad read")

    monkeypatch.setattr(demi_push, "related_rows", related)
    demi = _Demi(OK)

    send_marks(app, _marks(("proponents", 3, "update")), http=demi)

    assert demi.calls == []
    assert _lines(logs) == [("ERROR", "demi-push failed step=resolve exception=ValueError")]


def test_session_is_removed_before_each_send(app, rows, logs):
    """No session, so no connection, is held across any send, the retry included."""
    held = []

    def demi(*_args, **_kwargs):
        held.append(_db.session.registry.has())
        return UNAVAILABLE if len(held) == 1 else OK

    send_marks(app, _projects(rows, [1, 2]), http=demi, sleep=_no_sleep)

    assert held == [False, False, False]


def _paced_run(app, rows, count, seconds_per_send=0.01):
    clock = _Clock()
    sent_at = []

    def demi(*_args, **_kwargs):
        sent_at.append(clock())
        clock.now += seconds_per_send
        return OK

    send_marks(app, _projects(rows, range(1, count + 1)), http=demi, sleep=clock.sleep, clock=clock)
    return clock, [later - earlier for earlier, later in zip(sent_at, sent_at[1:])]


def test_more_than_20_records_are_paced(app, rows, logs):
    """A run of 21 calls, such as a large cascade, sends one per second, measured start to start."""
    _, gaps = _paced_run(app, rows, 21)

    assert len(gaps) == 20
    assert min(gaps) == pytest.approx(1)


def test_20_records_are_not_paced(app, rows, logs):
    """A run of up to 20 calls goes out without waiting."""
    clock, _ = _paced_run(app, rows, 20)

    assert clock.sleeps == []


def test_slow_answer_during_paced_run_adds_no_extra_wait(app, rows, logs):
    """A send slower than the interval has already used up the wait."""
    clock, _ = _paced_run(app, rows, 21, seconds_per_send=2)

    assert clock.sleeps == []


def test_paced_run_gives_back_its_push_slot(app, rows, logs):
    """A paced run can wait minutes, so it frees its push slot for short runs first."""
    released = []

    def demi(*_args, **_kwargs):
        return OK

    send_marks(app, _projects(rows, range(1, 22)), http=demi, sleep=_no_sleep, release_slot=lambda: released.append(1))

    assert released == [1]


def test_paced_run_is_dropped_when_every_waiting_place_is_taken(app, rows, logs, monkeypatch):
    """With all paced places taken a new paced run is dropped and logged, not queued."""
    monkeypatch.setattr(demi_push, "_paced_places", threading.BoundedSemaphore(1))
    demi_push._paced_places.acquire()  # pylint: disable=consider-using-with
    demi = _Demi(OK)

    send_marks(app, _projects(rows, range(1, 22)), http=demi, sleep=_no_sleep)

    assert demi.calls == []
    assert _lines(logs) == [("ERROR", "demi-push dropped records=21 reason=paced-full")]


@pytest.mark.parametrize("answer", [UNAVAILABLE, TIMEOUT, _answer(401), _answer(403)])
def test_run_stops_after_three_service_failures_in_a_row(app, rows, logs, answer):
    """An outage or a bad key ends a run after three records and says how many it left."""
    demi = _Demi(answer)

    send_marks(app, _projects(rows, range(1, 7)), http=demi, sleep=_no_sleep, clock=_Clock())

    assert [path for _, path in demi.sent()][-1] == "/projects/3"
    assert _lines(logs)[-1] == ("ERROR", "demi-push abandoned after=3 left=3")


def test_success_resets_the_failure_count(app, rows, logs):
    """Failures with a success between them do not stop the run."""
    fail_twice = [UNAVAILABLE, UNAVAILABLE]
    demi = _Demi(*fail_twice, *fail_twice, OK, *fail_twice, *fail_twice, OK)

    send_marks(app, _projects(rows, range(1, 7)), http=demi, sleep=_no_sleep, clock=_Clock())

    assert demi.calls[-1].url.endswith("/track/projects/6")
    assert "abandoned" not in " ".join(message for _, message in _lines(logs))


@pytest.mark.parametrize("code", ["NOT_BACKFILLED", "PAYLOAD_INVALID"])
def test_refusals_do_not_stop_the_run(app, rows, logs, code):
    """A refusal means DEMI answered for that record, so it is not an outage."""
    demi = _Demi(_answer(409, {"code": code}))

    send_marks(app, _projects(rows, range(1, 6)), http=demi, sleep=_no_sleep, clock=_Clock())

    assert len(demi.calls) == 5


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
    assert started[0][1].rows[("projects", project.id)]["op"] == "delete"


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
    monkeypatch.setattr(
        demi_push, "resolve_record",
        lambda table, row_id, nested=False: DemiRecord("project", row_id, True, row_id, ("projects", row_id), 1),
    )

    response = _delete_project(client, auth_header, factory_project_model())

    assert response.status_code == HTTPStatus.OK
    assert entered.wait(10)
    assert not finished.is_set()
    release.set()
    threads[0].join(10)
    assert finished.is_set()


def _start_pushes(app, count):
    return [demi_push.thread_starter(app, _marks(("projects", 1, "update"), ("works", 2, "update")))
            for _ in range(count)]


@pytest.mark.parametrize("testing, thread_count", [(True, 0), (False, 1)])
def test_default_starter_only_starts_threads_outside_testing(app, monkeypatch, threads, testing, thread_count):
    """Under TESTING the default starter does nothing; otherwise it starts one daemon thread."""
    monkeypatch.setitem(app.config, "TESTING", testing)

    _start_pushes(app, 1)

    assert len(threads) == thread_count
    assert all(item["daemon"] for item in threads)


def test_fifth_live_push_is_dropped_and_logged(app, threads, logs):
    """A worker runs four push threads at most; the next push logs its mark count without a read."""
    _start_pushes(app, 5)

    assert len(threads) == 4
    assert _lines(logs) == [("ERROR", "demi-push dropped records=2")]


def test_finished_push_frees_its_slot_even_when_it_raises(app, threads, logs, monkeypatch):
    """A thread that dies still gives its slot back."""

    def explode(_app, _marks_arg, **_kwargs):
        raise RuntimeError("send blew up")

    monkeypatch.setattr(demi_push, "send_marks", explode)
    _start_pushes(app, 4)

    with pytest.raises(RuntimeError):
        threads[0]["target"](*threads[0]["args"])
    _start_pushes(app, 1)

    assert len(threads) == 5
    assert logs == []


def test_slot_released_early_is_not_released_twice(app, threads, monkeypatch):
    """A paced run that gave its slot back does not free a second slot when it ends."""
    monkeypatch.setattr(demi_push, "send_marks", lambda _app, _marks_arg, release_slot: release_slot())
    _start_pushes(app, 4)

    threads[0]["target"](*threads[0]["args"])

    assert demi_push._push_slots._value == 1


def test_thread_that_cannot_start_gives_its_slot_back(app, threads, monkeypatch):
    """A failed thread start does not use up a slot for the life of the worker."""

    def no_thread(**_kwargs):
        raise RuntimeError("can't start new thread")

    monkeypatch.setattr(demi_push.threading, "Thread", no_thread)

    with pytest.raises(RuntimeError):
        _start_pushes(app, 1)

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
