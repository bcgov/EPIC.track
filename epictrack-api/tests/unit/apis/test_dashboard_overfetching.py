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
"""Database-backed contracts and bounded-query checks for Track-796."""
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from sqlalchemy import event, literal, select

from api.models import db, Work, WorkIssues, WorkIssueUpdates, WorkStatus
from api.models.staleness_settings import StalenessSettings, StalenessTypeEnum
from api.schemas.response.work_response import WorkResponseSchema
from api.utils.staleness import StalenessPolicy
from tests.utilities.factory_utils import factory_work_model


NOW = datetime(2026, 9, 9, 12, tzinfo=timezone.utc)


@contextmanager
def sql_calls():
    """Capture SELECT statements, parameters, and returned rows for one request."""
    calls = []

    def record(conn, cursor, statement, parameters, context, executemany):
        if statement.lstrip().upper().startswith("SELECT"):
            calls.append((statement, parameters, cursor.rowcount))

    event.listen(db.engine, "after_cursor_execute", record)
    try:
        yield calls
    finally:
        event.remove(db.engine, "after_cursor_execute", record)


def works(count):
    """Create a uniquely named scope, ordered independently of latest updates."""
    rows = []
    for index in range(count):
        work = factory_work_model()
        work.simple_title = f"Work {index}"
        work.start_date = NOW - timedelta(days=index)
        work.save()
        rows.append(work)
    rows[0].project.name = "Track796 baseline"
    rows[0].project.save()
    return rows


def status(work, days=0, approved=False):
    """Create a status with a controlled posted date."""
    row = WorkStatus(work_id=work.id, description="Status", posted_date=NOW - timedelta(days=days),
                     is_approved=approved)
    row.save()
    return row


def issue(work, days=0, approved=False, **kwargs):
    """Create an issue and its initial update."""
    row = WorkIssues(work_id=work.id, title="Issue", start_date=NOW - timedelta(days=30), **kwargs)
    row.save()
    update(row, days, approved)
    return row


def update(row, days=0, approved=False):
    """Create a dated issue update."""
    result = WorkIssueUpdates(work_issue_id=row.id, description="Update", posted_date=NOW - timedelta(days=days),
                              is_approved=approved)
    result.save()
    return result


def dashboard(client, headers, kind, **query):
    """Call a real dashboard with a fixed clock and isolated search scope."""
    with patch("api.utils.staleness.datetime") as clock:
        clock.now.return_value = NOW
        return client.get(f"/api/v1/work-{kind}/dashboard", headers=headers, query_string={
            "text": "Track796 baseline", "page": 1, "size": 2,
            "sort_key": "posted_date", "sort_order": "desc", **query,
        })


def test_status_latest_filtering_history_and_pagination(client, auth_header):
    """Select latest status before approval filtering and fetch only page histories."""
    rows = works(4)
    for index, work in enumerate(rows):
        status(work, 20, True)
        status(work, index, index % 2 == 0)
    expected = [row.id for row in rows]
    db.session.expunge_all()
    with sql_calls() as calls:
        response = dashboard(client, auth_header, "statuses")
    assert response.status_code == 200
    assert response.json["total"] == 4
    assert [item["work_id"] for item in response.json["items"]] == expected[:2]
    assert all(len(item["status_history"]) == 2 for item in response.json["items"])
    history_queries = [call for call in calls if "FROM work_statuses \nWHERE work_statuses.work_id IN" in call[0]]
    assert len(history_queries) == 1
    assert history_queries[0][2] == 4
    assert set(history_queries[0][1].values()) == set(expected[:2])
    assert sum("FROM staleness_settings" in call[0] for call in calls) == 1
    second = dashboard(client, auth_header, "statuses", page=2)
    assert [item["work_id"] for item in second.json["items"]] == expected[2:]
    approved = dashboard(client, auth_header, "statuses", **{"is_approved[]": "true"})
    assert approved.json["total"] == 2
    assert {item["work_id"] for item in approved.json["items"]} == {expected[0], expected[2]}
    empty = dashboard(client, auth_header, "statuses", page=10)
    assert empty.json == {"items": [], "total": 4}


def test_statusless_works_and_request_settings_cache(client, auth_header):
    """Retain statusless works and refresh settings on the next HTTP request."""
    with_status, without_status = works(2)
    status(with_status, 7)
    settings = StalenessSettings.query.filter_by(staleness_type=StalenessTypeEnum.STATUS).one()
    settings.warning_length, settings.staleness_length = 5, 10
    settings.save()
    response = dashboard(client, auth_header, "statuses", **{"staleness[]": "WARN"})
    assert response.json["total"] == 2
    assert any(item["status"] is None for item in response.json["items"])
    settings.staleness_length = 6
    settings.save()
    changed = dashboard(client, auth_header, "statuses", **{"staleness[]": "WARN"})
    assert [item["work_id"] for item in changed.json["items"]] == [without_status.id]
    approved = dashboard(client, auth_header, "statuses", **{"is_approved[]": "false"})
    assert [item["work_id"] for item in approved.json["items"]] == [with_status.id]


def test_issue_pagination_loads_only_page_updates(client, auth_header):
    """Multiple issues per work count as separate cards; updates stay page-scoped."""
    work = works(1)[0]
    issues = [issue(work, index) for index in range(5)]
    for row in issues:
        update(row, 25, True)
    expected = [row.id for row in issues]
    db.session.expunge_all()
    with sql_calls() as calls:
        response = dashboard(client, auth_header, "issues", page=2)
    assert response.status_code == 200
    assert response.json["total"] == 5
    assert [item["issue"]["id"] for item in response.json["items"]] == expected[2:4]
    assert all(len(item["issue"]["updates"]) == 2 for item in response.json["items"])
    history_queries = [call for call in calls if "FROM work_issue_updates \nWHERE work_issue_updates.work_issue_id IN" in call[0]]
    assert len(history_queries) == 1
    assert history_queries[0][2] == 4
    assert set(history_queries[0][1].values()) == set(expected[2:4])
    assert sum("FROM staleness_settings" in call[0] for call in calls) == 1
    assert dashboard(client, auth_header, "issues", **{"is_approved[]": "true"}).json["total"] == 0


def test_issue_state_staleness_and_missing_updates(client, auth_header):
    """Preserve OR state filters and the GOOD override for inactive/resolved issues."""
    work = works(1)[0]
    active = issue(work, 20)
    resolved = issue(work, 20, is_resolved=True)
    inactive = issue(work, 20, is_active=False)
    no_updates = WorkIssues(work_id=work.id, title="Empty", start_date=NOW)
    no_updates.save()
    good = dashboard(client, auth_header, "issues", **{"staleness[]": "GOOD"})
    assert {item["issue"]["id"] for item in good.json["items"]} == {resolved.id, inactive.id}
    critical = dashboard(client, auth_header, "issues", **{"staleness[]": "CRITICAL"})
    assert [item["issue"]["id"] for item in critical.json["items"]] == [active.id]
    states = dashboard(client, auth_header, "issues", **{"issue_state[]": ["is_resolved:true", "is_active:false"]})
    assert states.json["total"] == 2


@pytest.mark.parametrize("kind", ["statuses", "issues"])
def test_dashboard_query_count_stays_bounded(client, auth_header, kind):
    """More cards and histories must not introduce serializer N+1 queries."""
    for row in works(6):
        if kind == "statuses":
            for days in range(6):
                status(row, days)
        else:
            item = issue(row)
            for days in range(1, 6):
                update(item, days)
    counts = []
    for size in (1, 6):
        db.session.expunge_all()
        with sql_calls() as calls:
            response = dashboard(client, auth_header, kind, size=size)
        assert response.status_code == 200
        assert len(response.json["items"]) == size
        counts.append(len(calls))
    assert counts[0] == counts[1]
    assert counts[1] <= 5


@pytest.mark.parametrize("kind", ["statuses", "issues"])
def test_tied_latest_updates_and_unpaginated_requests(client, auth_header, kind):
    """Tie-break latest updates by ID and preserve requests that omit pagination."""
    for row in works(3):
        if kind == "statuses":
            status(row, approved=True)
            status(row, approved=False)
        else:
            item = issue(row, approved=True)
            update(item, approved=False)
    response = dashboard(client, auth_header, kind, size=0, **{"is_approved[]": "false"})
    assert response.json["total"] == len(response.json["items"]) == 3
    assert dashboard(client, auth_header, kind, **{"is_approved[]": "true"}).json["total"] == 0
    # page=0 falls back to the first page; a negative OFFSET would be a Postgres error.
    first = dashboard(client, auth_header, kind, page=1, **{"is_approved[]": "false"})
    zeroth = dashboard(client, auth_header, kind, page=0, **{"is_approved[]": "false"})
    assert zeroth.status_code == 200
    assert zeroth.json == first.json


@pytest.mark.parametrize("days", [-1, 0, 4.99999, 5, 9.99999, 10, 30])
def test_sql_staleness_matches_serialization(days):
    """SQL boundary comparisons match Python's elapsed whole-day calculation."""
    policy = StalenessPolicy(NOW, 5, 10)
    posted = NOW - timedelta(days=days)
    value = db.session.execute(select(policy.expression(literal(posted)))).scalar()
    assert value == policy.classify(posted)


def test_work_options_preserve_scope_and_titles(client, auth_header):
    """The option endpoint matches full-list labels, including inactive works."""
    active, inactive, deleted = works(3)
    inactive.is_active = False
    inactive.save()
    deleted.is_deleted = True
    deleted.save()
    expected = {row.id: row.title for row in (active, inactive)}
    db.session.expunge_all()
    with sql_calls() as calls:
        response = client.get("/api/v1/works/options", headers=auth_header)
    assert response.status_code == 200
    assert all(set(option) == {"id", "title"} for option in response.json)
    assert {option["id"]: option["title"] for option in response.json} == expected
    assert len(calls) == 1
    assert client.get("/api/v1/works/options").status_code == 401


def test_work_list_referrals_are_batched_including_missing_dates(client, auth_header):
    """Missing dates stay null without falling back to per-work aggregate queries."""
    works(4)
    db.session.expunge_all()
    with sql_calls() as calls:
        response = client.post("/api/v1/works/listing", headers=auth_header, json={"page": 1, "size": 4})
    assert response.status_code == 200
    assert len(response.json["items"]) == 4
    assert all(row["anticipated_referral_date"] is None for row in response.json["items"])
    assert sum("min(events.anticipated_date)" in sql for sql, _, _ in calls) == 1
    work = Work.query.first()
    with sql_calls() as single_calls:
        assert WorkResponseSchema(only=("anticipated_referral_date",)).dump(work)["anticipated_referral_date"] is None
    assert len(single_calls) == 1
