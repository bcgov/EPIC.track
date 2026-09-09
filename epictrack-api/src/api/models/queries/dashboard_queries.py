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
"""Select dashboard pages before loading status or issue histories."""
from sqlalchemy import and_, case, false, func, or_
from sqlalchemy.orm import joinedload, selectinload

from api.exceptions import BadRequestError
from api.models import db, Work, WorkIssues, WorkIssueUpdates, WorkStatus
from api.models.staleness_settings import StalenessTypeEnum
from api.utils.enums import StalenessEnum
from api.utils.staleness import get_staleness_policy


def _latest_ids(model, parent_id):
    """Rank updates before approval filtering so pending updates stay the latest."""
    return db.session.query(
        model.id.label("id"), parent_id.label("parent_id"),
        func.row_number().over(
            partition_by=parent_id, order_by=(model.posted_date.desc(), model.id.desc())
        ).label("rank"),
    ).subquery()


def _approval_filter(query, column, values):
    if values:
        query = query.filter(column.in_([value == "true" for value in values if value in ("true", "false")]))
    return query


def _ordered(query, model, options, tie_breakers):
    # "name" was the old status default even though statuses have no name column.
    key = options.sort_key or "posted_date"
    if key == "name":
        key = "posted_date"
    if key not in model.__table__.columns:
        raise BadRequestError("Unsupported dashboard sort key")
    column = getattr(model, key)
    ordering = column.desc().nullslast() if options.sort_order == "desc" else column.asc().nullsfirst()
    return query.order_by(ordering, *tie_breakers)


def _page(query, options):
    if (options.page is not None and options.page < 0) or (options.size is not None and options.size < 0):
        raise BadRequestError("Dashboard page and size must not be negative")
    total = query.order_by(None).count()
    size = options.size or total
    if not total:
        return [], 0
    return query.offset(((options.page or 1) - 1) * size).limit(size).all(), total


def status_page(options, search):
    """Return work/latest-status pairs; histories are fetched only for this page."""
    latest = _latest_ids(WorkStatus, WorkStatus.work_id)
    query = db.session.query(Work, WorkStatus).outerjoin(
        latest, and_(latest.c.parent_id == Work.id, latest.c.rank == 1)
    ).outerjoin(WorkStatus, WorkStatus.id == latest.c.id).filter(Work.is_deleted.is_(False))
    query = Work.filter_by_status_search_criteria(query, search)
    query = _approval_filter(query, WorkStatus.is_approved, search.is_approved)
    if search.staleness:
        policy = get_staleness_policy(StalenessTypeEnum.STATUS)
        query = query.filter(or_(WorkStatus.id.is_(None), policy.expression(WorkStatus.posted_date).in_(search.staleness)))
    query = _ordered(query, WorkStatus, options, (Work.start_date.desc(), Work.id.asc()))
    query = query.options(joinedload(Work.project), joinedload(Work.work_type))
    return _page(query, options)


def issue_page(options, search):
    """Return work/issue pairs, with update histories loaded after SQL pagination."""
    latest = _latest_ids(WorkIssueUpdates, WorkIssueUpdates.work_issue_id)
    query = db.session.query(Work, WorkIssues).join(WorkIssues, WorkIssues.work_id == Work.id).join(
        latest, and_(latest.c.parent_id == WorkIssues.id, latest.c.rank == 1)
    ).join(WorkIssueUpdates, WorkIssueUpdates.id == latest.c.id).filter(
        Work.is_deleted.is_(False), WorkIssues.is_deleted.is_(False)
    )
    query = Work.filter_by_issues_search_criteria(query, search)
    query = _approval_filter(query, WorkIssueUpdates.is_approved, search.is_approved)
    if search.staleness:
        policy = get_staleness_policy(StalenessTypeEnum.ISSUES)
        staleness = case(
            (or_(WorkIssues.is_active.is_(False), WorkIssues.is_resolved.is_(True)), StalenessEnum.GOOD.value),
            else_=policy.expression(WorkIssueUpdates.posted_date),
        )
        query = query.filter(staleness.in_(search.staleness))
    if search.issue_state:
        states = []
        for state in search.issue_state:
            parts = state.split(":")
            if len(parts) == 2 and parts[0] in ("is_active", "is_resolved", "is_high_priority"):
                states.append(getattr(WorkIssues, parts[0]).is_(parts[1].lower() == "true"))
        query = query.filter(or_(*states) if states else false())
    query = _ordered(query, WorkIssueUpdates, options, (WorkIssues.work_id.asc(), WorkIssues.start_date.desc(), WorkIssues.id.asc()))
    query = query.options(
        joinedload(Work.project), joinedload(Work.work_type), selectinload(WorkIssues.updates)
    )
    return _page(query, options)
