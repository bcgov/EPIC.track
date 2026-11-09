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
"""Request-scoped marks of the projects a committed write changed, for the push to DEMI."""
import logging
from dataclasses import dataclass, field
from functools import wraps

from flask import current_app, has_request_context, request
from sqlalchemy import event, inspect, select
from sqlalchemy.orm import Session

ENVIRON_KEY = "track.demi_marks"
REF_KEYS = ("project_id", "work_id", "work_phase_id", "event_configuration_id", "proponent_id")

# Per mirrored table: the column whose current and old values lead to the project.
_ROW_REFS = {
    "projects": ("id", "project_id"),
    "works": ("project_id", "project_id"),
    "work_phases": ("work_id", "work_id"),
    "events": ("work_id", "work_id"),
    "event_configurations": ("work_phase_id", "work_phase_id"),
    "outcome_configurations": ("event_configuration_id", "event_configuration_id"),
    "proponents": ("id", "proponent_id"),
}
_ENTITY_KEYS = {"projects": "project_id", "works": "work_id", "proponents": "proponent_id"}


@dataclass
class DemiMarks:
    """Ids one request changed, keyed by the column that leads to a project."""

    refs: dict = field(default_factory=lambda: {key: set() for key in REF_KEYS})
    delete_project_ids: set = field(default_factory=set)
    all_projects: bool = False

    def __bool__(self):
        """Return True when anything is marked."""
        return self.all_projects or any(self.refs.values())

    def merge(self, other: "DemiMarks"):
        """Add the marks of other to these."""
        for key, ids in other.refs.items():
            self.refs[key] |= ids
        self.delete_project_ids |= other.delete_project_ids
        self.all_projects = self.all_projects or other.all_projects

    def project_ids(self, session) -> set:
        """Resolve the marks to project ids by reading current rows, deleted rows included."""
        # pylint: disable=import-outside-toplevel,cyclic-import
        from api.models import EventConfiguration, Project, Work, WorkPhase

        if self.all_projects:
            return set(session.scalars(select(Project.id)))
        refs = self.refs
        phase_ids = refs["work_phase_id"] | _lookup(
            session, EventConfiguration.work_phase_id, EventConfiguration.id, refs["event_configuration_id"]
        )
        work_ids = refs["work_id"] | _lookup(session, WorkPhase.work_id, WorkPhase.id, phase_ids)
        project_ids = refs["project_id"] | _lookup(session, Work.project_id, Work.id, work_ids)
        return project_ids | _lookup(session, Project.id, Project.proponent_id, refs["proponent_id"])


def _lookup(session, wanted, key, values) -> set:
    if not values:
        return set()
    return set(session.scalars(select(wanted).where(key.in_(values)))) - {None}


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


def mark(**refs):
    """Mark ids for a write that leaves no ORM history, such as Query.update."""
    state = _state()
    if state is None:
        return
    for key, value in refs.items():
        if key in REF_KEYS and value is not None:
            state["pending"].refs[key].add(value)


def mark_entity(model_class, entity_id):
    """Mark a Project, Work or Proponent row by id; other models are not mirrored."""
    key = _ENTITY_KEYS.get(model_class.__tablename__)
    if key:
        mark(**{key: entity_id})


def mark_all():
    """Mark every project, resolved when the marks are read."""
    state = _state()
    if state is not None:
        state["pending"].all_projects = True


def committed_marks(environ=None) -> DemiMarks:
    """Return the marks this request has committed; empty when push is off.

    Reads request.environ by default, so call it inside the request, e.g. from after_request.
    """
    environ = request.environ if environ is None else environ
    state = environ.get(ENVIRON_KEY)
    return state["committed"] if state else DemiMarks()


def _note_row(pending: DemiMarks, obj, dirty: bool):
    state = inspect(obj)
    table = state.mapper.local_table.name
    if table not in _ROW_REFS:
        return
    column, key = _ROW_REFS[table]
    # sum() holds the old value as well, so a moved work marks both projects.
    ids = {value for value in state.attrs[column].history.sum() if value is not None}
    pending.refs[key] |= ids
    if dirty and table == "projects" and True in state.attrs["is_deleted"].history.added:
        pending.delete_project_ids |= ids


def _guarded(listener):
    """Log a marking bug instead of failing the user's write."""

    @wraps(listener)
    def guarded(*args):
        try:
            listener(*args)
        except Exception:  # noqa: B902 # pylint: disable=broad-except
            # The logger by name: a session can flush with no app context, where current_app raises.
            logging.getLogger("api").exception("demi-marks failed listener=%s", listener.__name__)

    return guarded


@_guarded
def _after_flush(session, _flush_context):
    state = _state()
    if state is None:
        return
    for obj in session.new:
        _note_row(state["pending"], obj, dirty=False)
    for obj in session.dirty:
        if session.is_modified(obj):
            _note_row(state["pending"], obj, dirty=True)
    for obj in session.deleted:
        _note_row(state["pending"], obj, dirty=False)


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
