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
"""Request-scoped marks of the rows a committed write changed, for the push to DEMI."""
import logging
from dataclasses import dataclass, field
from functools import wraps

from flask import current_app, has_request_context, request
from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

ENVIRON_KEY = "track.demi_marks"
CREATE, UPDATE, DELETE = "create", "update", "delete"

# Only a change to one of these columns is worth a push.
MIRRORED_COLUMNS = {
    "projects": {
        "name", "description", "epic_guid", "latitude", "longitude", "address", "abbreviation", "is_active",
        "is_deleted", "proponent_id", "sub_type_id", "type_id", "project_state_id", "ea_certificate",
        "eac_signed", "eac_expires",
    },
    "works": {
        "project_id", "work_type_id", "simple_title", "ea_act_id", "start_date", "is_active", "is_deleted",
        "work_state", "work_decision_date", "anticipated_decision_date",
    },
    "work_phases": {
        "work_id", "phase_id", "name", "start_date", "end_date", "number_of_days", "legislated", "sort_order",
        "is_completed", "is_suspended", "suspended_date", "is_active", "is_deleted", "visibility",
    },
    "events": {
        "work_id", "event_configuration_id", "name", "anticipated_date", "actual_date", "number_of_days",
        "outcome_id", "is_active", "is_deleted",
    },
    "event_configurations": {"name", "event_position", "event_type_id", "visibility", "sort_order"},
    "outcome_configurations": {"name"},
    "proponents": {"name"},
}


@dataclass
class DemiMarks:
    """Rows one request changed, keyed (table, id), each with its op and a moved work's old project."""

    rows: dict = field(default_factory=dict)

    def __bool__(self):
        """Return True when anything is marked."""
        return bool(self.rows)

    def add(self, table, row_id, op, from_project_id=None):
        """Mark one row; create then update stays create, create then delete drops the mark."""
        key = (table, row_id)
        old = self.rows.get(key)
        if old is None:
            self.rows[key] = {"op": op, "from_project_id": from_project_id}
        elif old["op"] == CREATE and op == DELETE:
            del self.rows[key]
        elif old["op"] != CREATE:
            old["op"] = op
            old["from_project_id"] = old["from_project_id"] or from_project_id

    def merge(self, other: "DemiMarks"):
        """Add the marks of other to these."""
        for (table, row_id), value in other.rows.items():
            self.add(table, row_id, value["op"], value["from_project_id"])


def _state(create=True):
    """Return this request's pending and committed marks, or None when push is off."""
    if not has_request_context():
        return None
    config = current_app.config
    if not config.get("DEMI_PUSH_URL") or not config.get("DEMI_PUSH_KEY"):
        return None
    if not create:
        return request.environ.get(ENVIRON_KEY)
    # request.environ, not g: tests keep one app context open across requests.
    return request.environ.setdefault(ENVIRON_KEY, {"pending": DemiMarks(), "committed": DemiMarks()})


def committed_marks(environ=None) -> DemiMarks:
    """Return the marks this request has committed; empty when push is off.

    Reads request.environ by default, so call it inside the request, e.g. from after_request.
    """
    environ = request.environ if environ is None else environ
    state = environ.get(ENVIRON_KEY)
    return state["committed"] if state else DemiMarks()


def _changed_op(state, table):
    """Return the op for a dirty row, or None when no mirrored column changed."""
    attrs = state.attrs
    if not any(attrs[column].history.has_changes() for column in MIRRORED_COLUMNS[table]):
        return None
    if "is_deleted" in MIRRORED_COLUMNS[table]:
        added = attrs["is_deleted"].history.added
        if True in added:
            return DELETE
        # A restored work comes back with its phases and events.
        if table == "works" and False in added:
            return CREATE
    return UPDATE


def _note_row(pending: DemiMarks, obj, op):
    state = inspect(obj)
    table = state.mapper.local_table.name
    if table not in MIRRORED_COLUMNS:
        return
    from_project_id = None
    if op == UPDATE:
        op = _changed_op(state, table)
        if op is None:
            return
        if table == "works":
            from_project_id = next(iter(state.attrs["project_id"].history.deleted), None)
    # obj.id, since a row inserted by this flush has no identity key until the flush ends.
    pending.add(table, obj.id, op, from_project_id)


def _guarded(listener):
    """Log a marking bug instead of failing the user's write."""

    @wraps(listener)
    def guarded(*args, **kwargs):
        try:
            listener(*args, **kwargs)
        except Exception:  # noqa: B902 # pylint: disable=broad-except
            # The logger by name: a session can flush with no app context, where current_app raises.
            logging.getLogger("api").exception("demi-marks failed listener=%s", listener.__name__)

    return guarded


@_guarded
def mark_rows(query, op=UPDATE, column=None):
    """Mark each row a Query.update is about to change: one extra SELECT, only when push is on.

    column names the one column the write sets; a column DEMI does not mirror marks nothing.
    """
    model = query.column_descriptions[0]["entity"]
    table = model.__tablename__
    if table not in MIRRORED_COLUMNS or (column and column not in MIRRORED_COLUMNS[table]):
        return
    state = _state()
    if state is None:
        return
    for (row_id,) in query.with_entities(model.id):
        state["pending"].add(table, row_id, op)


@_guarded
def _after_flush(session, _flush_context):
    state = _state()
    if state is None:
        return
    for obj in session.new:
        _note_row(state["pending"], obj, CREATE)
    for obj in session.dirty:
        if session.is_modified(obj):
            _note_row(state["pending"], obj, UPDATE)
    for obj in session.deleted:
        _note_row(state["pending"], obj, DELETE)


@_guarded
def _after_commit(_session):
    state = _state(create=False)
    if state:
        state["committed"].merge(state["pending"])
        state["pending"] = DemiMarks()


@_guarded
def _after_rollback(_session):
    state = _state(create=False)
    if state:
        state["pending"] = DemiMarks()


def register():
    """Listen on the Session base class, which reaches every session, the test fixture's too."""
    event.listen(Session, "after_flush", _after_flush)
    event.listen(Session, "after_commit", _after_commit)
    event.listen(Session, "after_rollback", _after_rollback)
