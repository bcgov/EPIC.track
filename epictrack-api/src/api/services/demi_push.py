"""Sends the rows a committed Track write changed to DEMI, one record per call, from a background thread."""
import logging
import threading
import time
from dataclasses import dataclass
from typing import Optional
from urllib.parse import urlencode

import requests
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.services.demi_payload import RECORD_TABLES, related_rows, resolve_record, work_ids_of
from api.utils.demi_marks import CREATE, DELETE, UPDATE, committed_marks


REQUEST_TIMEOUT = (5, 35)  # connect, read
RETRY_DELAY_SECONDS = 5
MAX_PUSH_THREADS = 4
MAX_PACED_WAITERS = 4
PACED_WAIT_SECONDS = 300
MAX_CONSECUTIVE_FAILURES = 3
# Long sends run at one per second, so they stay light on the pod's 250m CPU limit.
PACED_INTERVAL_SECONDS = 1
PACE_ABOVE_RECORDS = 20

_RETRY = "retry"
_KINDS = {"projects": "project", "works": "work", "work_phases": "phase", "events": "event"}
_WARN_CODES = {"PARENT_NOT_FOUND", "NOT_BACKFILLED"}
_LOG_LEVELS = {
    "sent": logging.INFO,
    "stale": logging.INFO,
    "gone": logging.INFO,
    "skipped": logging.WARNING,
    "refused": logging.ERROR,
}

_push_slots = threading.BoundedSemaphore(MAX_PUSH_THREADS)  # pylint: disable=invalid-name
_paced_places = threading.BoundedSemaphore(MAX_PACED_WAITERS)  # pylint: disable=invalid-name
_paced_lane = threading.Lock()  # pylint: disable=invalid-name


@dataclass
class _Call:
    table: str
    row_id: int
    op: str
    nested: bool = False
    moved_from: Optional[int] = None

    @property
    def label(self):
        """kind:id, as the log names the record"""
        return f"{_KINDS[self.table]}:{self.row_id}"


def _send_holding_slot(app, marks):
    held = [True]

    def release_slot():
        if held[0]:
            held[0] = False
            _push_slots.release()

    try:
        send_marks(app, marks, release_slot=release_slot)
    finally:
        release_slot()


def _start_thread(app, marks):
    # Tests share one database connection, which a second thread would corrupt.
    if app.testing:
        return
    if not _push_slots.acquire(blocking=False):  # pylint: disable=consider-using-with
        app.logger.error("demi-push dropped records=%s", len(marks.rows))
        return
    try:
        threading.Thread(target=_send_holding_slot, args=(app, marks), daemon=True).start()
    except RuntimeError:
        _push_slots.release()
        raise


thread_starter = _start_thread  # pylint: disable=invalid-name


def log_missing_key(app):
    """Log once at app start when the push URL has no key, which leaves the push off."""
    if app.config.get("DEMI_PUSH_URL") and not app.config.get("DEMI_PUSH_KEY"):
        app.logger.error("demi-push off: DEMI_PUSH_URL is set but DEMI_PUSH_KEY is empty")


def start_push(app):
    """Start the push for this request's committed marks; never fails the request."""
    try:
        marks = committed_marks()
        if marks:
            thread_starter(app, marks)
    except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
        app.logger.error("demi-push failed step=start exception=%s", type(exc).__name__)


def send_marks(  # pylint: disable=too-many-arguments
    app, marks, http=None, sleep=time.sleep, clock=time.monotonic, release_slot=None
):
    """Send each marked record to DEMI, parents first; a run above 20 calls waits for the paced lane."""
    with app.app_context(), requests.Session() as http_session:
        send = http or http_session.request
        calls = _resolve(marks)
        size = len(calls)
        if size <= PACE_ABOVE_RECORDS:
            _send_calls(app, calls, send, sleep, _pacer(0, sleep, clock))
            return
        # A paced run can wait minutes for the lane, so it gives its slot to short runs meanwhile.
        if release_slot:
            release_slot()
        if not _paced_places.acquire(blocking=False):  # pylint: disable=consider-using-with
            current_app.logger.error("demi-push dropped records=%s reason=paced-full", size)
            return
        try:
            if not _paced_lane.acquire(timeout=PACED_WAIT_SECONDS):  # pylint: disable=consider-using-with
                current_app.logger.error("demi-push dropped records=%s reason=paced-timeout", size)
                return
            try:
                _send_calls(app, calls, send, sleep, _pacer(PACED_INTERVAL_SECONDS, sleep, clock))
            finally:
                _paced_lane.release()
        finally:
            _paced_places.release()


def _send_calls(app, calls, send, sleep, pace):
    base_url = app.config["DEMI_PUSH_URL"].rstrip("/")
    headers = {"Ocp-Apim-Subscription-Key": app.config.get("DEMI_PUSH_KEY")}

    def transmit(method, path, body):
        # No database connection is held while waiting on DEMI.
        db.session.remove()
        pace()
        # Redirects off: requests would carry the subscription key to the new host.
        return send(
            method,
            f"{base_url}/track/{path}",
            json=body,
            headers=headers,
            timeout=REQUEST_TIMEOUT,
            allow_redirects=False,
        )

    failed_new = {"project": set(), "work": set(), "phase": set(), "event": set()}
    failures_in_a_row = 0
    for index, call in enumerate(calls, start=1):
        outcome = _send_guarded(call, transmit, sleep, failed_new)
        if outcome in ("failed", "refused", "service") and (call.nested or call.op == CREATE):
            failed_new[_KINDS[call.table]].add(call.row_id)
        failures_in_a_row = failures_in_a_row + 1 if outcome in ("failed", "service") else 0
        left = len(calls) - index
        if left and failures_in_a_row >= MAX_CONSECUTIVE_FAILURES:
            current_app.logger.error("demi-push abandoned after=%s left=%s", failures_in_a_row, left)
            return


def _plan(marks) -> list:
    """Turn marks into calls: lookups fan out to their records, and a nested work takes its children."""
    rows = {}
    for (table, row_id), value in marks.rows.items():
        if table in RECORD_TABLES:
            rows[(table, row_id)] = value
    for (table, row_id), value in marks.rows.items():
        if table not in RECORD_TABLES:
            for related in related_rows(table, row_id):
                rows.setdefault(related, {"op": UPDATE, "from_project_id": None})
    nested = {
        row_id for (table, row_id), value in rows.items()
        if table == "works" and (value["op"] == CREATE or value["from_project_id"] is not None)
    }
    if nested:
        for table in ("work_phases", "events"):
            owners = work_ids_of(table, [row_id for (kind, row_id) in rows if kind == table])
            for row_id, work_id in owners.items():
                if work_id in nested:
                    del rows[(table, row_id)]
    calls = []
    for (table, row_id), value in sorted(rows.items(), key=lambda item: (RECORD_TABLES.index(item[0][0]), item[0][1])):
        if table == "works" and value["from_project_id"] is not None:
            calls.append(_Call(table, row_id, DELETE, moved_from=value["from_project_id"]))
        calls.append(_Call(table, row_id, value["op"], nested=table == "works" and row_id in nested))
    return calls


def _resolve(marks) -> list:
    """Return the run's calls, with one retry on a fresh session; empty when both reads fail."""
    error = None
    for _attempt in range(2):
        try:
            return _plan(marks)
        except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
            db.session.remove()
            error = type(exc).__name__
    current_app.logger.error("demi-push failed step=resolve exception=%s", error)
    return []


def _pacer(interval, sleep, clock):
    """Return a function that holds each call until interval has passed since the previous one."""
    last = None

    def pace():
        nonlocal last
        if last is not None and interval:
            remaining = last + interval - clock()
            if remaining > 0:
                sleep(remaining)
        last = clock()

    return pace


def _send_guarded(call, transmit, sleep, failed_new) -> str:
    """Send one record and return its outcome, so one bad record cannot stop the rest."""
    try:
        return _send_record(call, transmit, sleep, failed_new)
    except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
        # Only the class: send errors can quote the subscription key.
        current_app.logger.error("demi-push failed id=%s exception=%s", call.label, type(exc).__name__)
        # A failed statement leaves the transaction aborted for the next record's reads.
        db.session.remove()
        return "failed"


def _parent_failed(record, failed_new) -> bool:
    return (
        (record.kind != "project" and record.project_id in failed_new["project"])
        or (record.kind in ("phase", "event") and record.work_id in failed_new["work"])
        or (record.kind == "event" and record.work_phase_id in failed_new["phase"])
    )


def _request(call, record):
    """Return the method, path and body for a record; the verb follows the row's current state."""
    parts = record.path_parts
    query = f"?{urlencode({'pushedAt': record.pushed_at, 'workTypeId': record.work_type_id})}"
    if call.moved_from is not None:
        return "DELETE", _path(("projects", call.moved_from, *parts[2:])) + query, None
    if record.delete:
        return "DELETE", _path(parts) + ("" if record.kind == "project" else query), None
    if call.nested or call.op == CREATE:
        return "POST", _path(parts[:-1]), record.body
    return "PUT", _path(parts), record.body


def _path(parts):
    return "/".join(str(part) for part in parts)


def _send_record(call, transmit, sleep, failed_new) -> str:
    """Send one record and return its outcome.

    A 5xx, 429, timeout, dropped connection, database error, CREATED_BEHIND or PARENT_NOT_FOUND gets one retry.
    """
    method, status, code = None, None, None
    for attempt in range(2):
        if attempt:
            sleep(RETRY_DELAY_SECONDS)
        try:
            record = resolve_record(call.table, call.row_id, nested=call.nested)
            if record is None:
                current_app.logger.info("demi-push skipped id=%s reason=not-in-feed", call.label)
                return "none"
            if _parent_failed(record, failed_new):
                current_app.logger.warning("demi-push skipped id=%s reason=parent-failed", call.label)
                return "none"
            method, path, body = _request(call, record)
            response = transmit(method, path, body)
        except (requests.Timeout, requests.ConnectionError, SQLAlchemyError) as exc:
            # A failed statement leaves the transaction aborted for the retry's reads.
            db.session.remove()
            status = type(exc).__name__
            continue
        status = response.status_code
        answer = _answer(response)
        code = answer.get("code")
        outcome = _outcome(method, status, answer)
        if outcome != _RETRY:
            _log(outcome, call, method, status, answer)
            return "service" if status in (401, 403) else outcome
    if code == "PARENT_NOT_FOUND":
        _log("refused", call, method, status, {"code": code})
        return "refused"
    current_app.logger.error("demi-push failed id=%s method=%s status=%s", call.label, method, status)
    return "failed"


def _log(outcome, call, method, status, answer):
    detail = f"reason={answer.get('reason')}" if outcome == "skipped" else f"detail={_detail(answer)}"
    level = logging.WARNING if answer.get("code") in _WARN_CODES else _LOG_LEVELS[outcome]
    current_app.logger.log(level, "demi-push %s id=%s method=%s status=%s %s", outcome, call.label, method, status,
                           detail)


def _answer(response) -> dict:
    """Return the JSON object DEMI answered, or {} for anything else, such as a gateway error page."""
    try:
        answer = response.json()
    except ValueError:
        return {}
    return answer if isinstance(answer, dict) else {}


def _detail(answer):
    return answer.get("code") or answer.get("action")


def _outcome(method, status, answer) -> str:
    """Return what a DEMI answer means for this send."""
    code = answer.get("code")
    if 200 <= status < 300:
        return "skipped" if answer.get("action") == "skipped" else "sent"
    # PARENT_NOT_FOUND: the parent may be in flight from another thread.
    if status >= 500 or status == 429 or (status == 404 and code == "PARENT_NOT_FOUND"):
        return _RETRY
    if status == 409 and code == "STALE_PUSH":
        return "stale"
    if method in ("PUT", "POST") and status == 409 and code == "CREATED_BEHIND":
        return _RETRY
    # DEMI's own 404 names the id; a 404 without one is the gateway missing the route.
    if method == "DELETE" and status == 404 and "id" in answer:
        return "gone"
    return "refused"
