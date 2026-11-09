"""Sends the projects a committed Track write changed to DEMI, from a background thread."""
import logging
import threading
import time

import requests
from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from api.models import db
from api.services.demi_payload import build_project_payload
from api.utils.demi_marks import committed_marks


REQUEST_TIMEOUT = (5, 35)  # connect, read
RETRY_DELAY_SECONDS = 5
MAX_PUSH_THREADS = 4
MAX_CONSECUTIVE_FAILURES = 3
# Long sends run at one per second, so they stay light on the pod's 250m CPU limit.
PACED_INTERVAL_SECONDS = 1
PACE_ABOVE_PROJECTS = 20

_RETRY = "retry"
_LOG_LEVELS = {
    "sent": logging.INFO,
    "stale": logging.INFO,
    "gone": logging.INFO,
    "skipped": logging.WARNING,
    "refused": logging.ERROR,
}

_push_slots = threading.BoundedSemaphore(MAX_PUSH_THREADS)  # pylint: disable=invalid-name


def _send_holding_slot(app, marks):
    try:
        send_marks(app, marks)
    finally:
        _push_slots.release()


def _project_count(marks):
    try:
        return len(marks.project_ids(db.session))
    except Exception:  # noqa: B902 # pylint: disable=broad-except
        return "unknown"


def _start_thread(app, marks):
    # Tests share one database connection, which a second thread would corrupt.
    if app.testing:
        return
    if not _push_slots.acquire(blocking=False):  # pylint: disable=consider-using-with
        app.logger.error("demi-push dropped projects=%s", _project_count(marks))
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


def send_marks(app, marks, http=None, sleep=time.sleep, clock=time.monotonic):
    """Send every marked project to DEMI, one request at a time."""
    with app.app_context(), requests.Session() as http_session:
        send = http or http_session.request
        base_url = app.config["DEMI_PUSH_URL"].rstrip("/")
        headers = {"Ocp-Apim-Subscription-Key": app.config.get("DEMI_PUSH_KEY")}
        project_ids = _resolve(marks)
        paced = marks.all_projects or len(project_ids) > PACE_ABOVE_PROJECTS
        pace = _pacer(PACED_INTERVAL_SECONDS if paced else 0, sleep, clock)

        def transmit(method, project_id, body):
            # No database connection is held while waiting on DEMI.
            db.session.remove()
            pace()
            # Redirects off: requests would carry the subscription key to the new host.
            return send(
                method,
                f"{base_url}/track/projects/{project_id}",
                json=body,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=False,
            )

        failures_in_a_row = 0
        for index, project_id in enumerate(project_ids, start=1):
            intent = "DELETE" if project_id in marks.delete_project_ids else "PUT"
            failures_in_a_row = failures_in_a_row + 1 if _send_guarded(project_id, intent, transmit, sleep) else 0
            left = len(project_ids) - index
            if marks.all_projects and left and failures_in_a_row >= MAX_CONSECUTIVE_FAILURES:
                current_app.logger.error("demi-push abandoned after=%s left=%s", failures_in_a_row, left)
                return


def _resolve(marks) -> list:
    """Return the marked project ids, with one retry on a fresh session; empty when both reads fail."""
    error = None
    for _attempt in range(2):
        try:
            return sorted(marks.project_ids(db.session))
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


def _send_guarded(project_id, intent, transmit, sleep) -> bool:
    """Send one project and return True when it failed, so one bad project cannot stop the rest."""
    try:
        return _send_project(project_id, intent, transmit, sleep)
    except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
        # Only the class: send errors can quote the subscription key.
        current_app.logger.error(
            "demi-push failed project_id=%s method=%s exception=%s", project_id, intent, type(exc).__name__
        )
        # A failed statement leaves the transaction aborted for the next project's reads.
        db.session.remove()
        return True


def _send_project(project_id, intent, transmit, sleep) -> bool:
    """Send one project and return True when it failed.

    A 5xx, 429, timeout, dropped connection, database error or CREATED_BEHIND gets one retry.
    """
    method = intent
    status = None
    for attempt in range(2):
        if attempt:
            sleep(RETRY_DELAY_SECONDS)
        try:
            # Also the DELETE's re-read of state: a project restored since the mark has a body.
            body = build_project_payload(project_id)
            if body is None and intent == "PUT":
                current_app.logger.info(
                    "demi-push skipped project_id=%s method=%s reason=missing-or-deleted", project_id, intent
                )
                return False
            method = "PUT" if body else "DELETE"
            if method != intent:
                current_app.logger.info("demi-push restored project_id=%s method=%s", project_id, method)
            response = transmit(method, project_id, body)
        except (requests.Timeout, requests.ConnectionError, SQLAlchemyError) as exc:
            # A failed statement leaves the transaction aborted for the retry's reads.
            db.session.remove()
            status = type(exc).__name__
            continue
        status = response.status_code
        answer = _answer(response)
        outcome = _outcome(method, status, answer)
        if outcome != _RETRY:
            detail = f"reason={answer.get('reason')}" if outcome == "skipped" else f"detail={_detail(answer)}"
            current_app.logger.log(
                _LOG_LEVELS[outcome],
                "demi-push %s project_id=%s method=%s status=%s %s",
                outcome,
                project_id,
                method,
                status,
                detail,
            )
            return False
    current_app.logger.error("demi-push failed project_id=%s method=%s status=%s", project_id, method, status)
    return True


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
    if 200 <= status < 300:
        return "skipped" if answer.get("action") == "skipped" else "sent"
    if status >= 500 or status == 429:
        return _RETRY
    if method == "PUT" and status == 409 and answer.get("code") == "STALE_PUSH":
        return "stale"
    if method == "PUT" and status == 409 and answer.get("code") == "CREATED_BEHIND":
        return _RETRY
    # DEMI's own 404 names the id; a 404 without one is the gateway missing the route.
    if method == "DELETE" and status == 404 and "id" in answer:
        return "gone"
    return "refused"
