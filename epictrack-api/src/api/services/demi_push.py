"""Sends the projects a committed Track write changed to DEMI, from a background thread."""
import logging
import threading
import time

import requests
from flask import current_app

from api.models import db
from api.services.demi_payload import build_project_payload
from api.utils.demi_marks import committed_marks


REQUEST_TIMEOUT = (5, 35)  # connect, read
RETRY_DELAY_SECONDS = 5
# Keeps an import under APIM's limit of 300 requests per 60 s for one subscription.
MARK_ALL_INTERVAL_SECONDS = 0.25

_RETRY = "retry"
_LOG_LEVELS = {
    "sent": logging.INFO,
    "stale": logging.INFO,
    "gone": logging.INFO,
    "refused": logging.ERROR,
}


def _start_thread(app, marks):
    # Tests share one database connection, which a second thread would corrupt.
    if not app.testing:
        threading.Thread(target=send_marks, args=(app, marks), daemon=True).start()


thread_starter = _start_thread  # pylint: disable=invalid-name


def start_push(app):
    """Start the push for this request's committed marks; never fails the request."""
    try:
        marks = committed_marks()
        if marks:
            thread_starter(app, marks)
    except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
        app.logger.error("demi-push failed step=start exception=%s", type(exc).__name__)


def send_marks(app, marks, http=requests.request, sleep=time.sleep, clock=time.monotonic):
    """Send every marked project to DEMI, one request at a time."""
    with app.app_context():
        base_url = app.config["DEMI_PUSH_URL"].rstrip("/")
        headers = {"Ocp-Apim-Subscription-Key": app.config.get("DEMI_PUSH_KEY")}
        pace = _pacer(MARK_ALL_INTERVAL_SECONDS if marks.all_projects else 0, sleep, clock)

        def transmit(method, project_id, body):
            # No database connection is held while waiting on DEMI.
            db.session.remove()
            pace()
            # Redirects off: requests would carry the subscription key to the new host.
            return http(
                method,
                f"{base_url}/track/projects/{project_id}",
                json=body,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
                allow_redirects=False,
            )

        try:
            project_ids = sorted(marks.project_ids(db.session))
        except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
            current_app.logger.error("demi-push failed step=resolve exception=%s", type(exc).__name__)
            return

        for project_id in project_ids:
            method = "DELETE" if project_id in marks.delete_project_ids else "PUT"
            try:
                _send_project(project_id, method, transmit, sleep)
            except Exception as exc:  # noqa: B902 # pylint: disable=broad-except
                # Only the class: send errors can quote the subscription key.
                current_app.logger.error(
                    "demi-push failed project_id=%s method=%s exception=%s", project_id, method, type(exc).__name__
                )
                # A failed statement leaves the transaction aborted for the next project's reads.
                db.session.remove()


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


def _send_project(project_id, method, transmit, sleep):
    """Send one project, with one retry after a 5xx, a timeout, a dropped connection or CREATED_BEHIND."""
    status = None
    for attempt in range(2):
        if attempt:
            sleep(RETRY_DELAY_SECONDS)
        body = None
        if method == "PUT":
            body = build_project_payload(project_id)
            if body is None:
                current_app.logger.info(
                    "demi-push skipped project_id=%s method=%s status=%s", project_id, method, status
                )
                return
        try:
            response = transmit(method, project_id, body)
        except (requests.Timeout, requests.ConnectionError) as exc:
            status = type(exc).__name__
            continue
        status = response.status_code
        answer = _answer(response)
        outcome = _outcome(method, status, answer)
        if outcome != _RETRY:
            current_app.logger.log(
                _LOG_LEVELS[outcome],
                "demi-push %s project_id=%s method=%s status=%s detail=%s",
                outcome,
                project_id,
                method,
                status,
                answer.get("code") or answer.get("action"),
            )
            return
    current_app.logger.error("demi-push failed project_id=%s method=%s status=%s", project_id, method, status)


def _answer(response) -> dict:
    """Return the JSON object DEMI answered, or {} for anything else, such as a gateway error page."""
    try:
        answer = response.json()
    except ValueError:
        return {}
    return answer if isinstance(answer, dict) else {}


def _outcome(method, status, answer) -> str:
    """Return what a DEMI answer means for this send."""
    if 200 <= status < 300:
        return "sent"
    if status >= 500:
        return _RETRY
    if method == "PUT" and status == 409 and answer.get("code") == "STALE_PUSH":
        return "stale"
    if method == "PUT" and status == 409 and answer.get("code") == "CREATED_BEHIND":
        return _RETRY
    if method == "DELETE" and status == 404:
        return "gone"
    return "refused"
