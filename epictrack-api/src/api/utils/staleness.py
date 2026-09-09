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
"""Request-scoped staleness rules shared by SQL filters and response schemas."""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from flask import has_request_context, request
from sqlalchemy import case

from api.models import db
from api.models.staleness_settings import StalenessSettings
from api.utils.enums import StalenessEnum


@dataclass(frozen=True)
class StalenessPolicy:
    """Evaluate elapsed whole days against one request's settings and clock."""

    now: datetime
    warning_days: int
    critical_days: int

    def classify(self, posted_date):
        """Return the response value for an update date."""
        if posted_date is None:
            return StalenessEnum.CRITICAL.value
        days = (self.now - posted_date).days
        if days >= self.critical_days:
            return StalenessEnum.CRITICAL.value
        if days >= self.warning_days:
            return StalenessEnum.WARN.value
        return StalenessEnum.GOOD.value

    def expression(self, posted_date):
        """Return the SQL equivalent of classify()."""
        return case(
            (posted_date.is_(None), StalenessEnum.CRITICAL.value),
            (posted_date <= self.now - timedelta(days=self.critical_days), StalenessEnum.CRITICAL.value),
            (posted_date <= self.now - timedelta(days=self.warning_days), StalenessEnum.WARN.value),
            else_=StalenessEnum.GOOD.value,
        )


def get_staleness_policy(staleness_type):
    """Load each settings type at most once per HTTP request."""
    # request.environ is request-scoped even when a caller keeps an app context open.
    cache = request.environ.setdefault("track.staleness", {}) if has_request_context() else {}
    if staleness_type not in cache:
        settings = db.session.query(StalenessSettings).filter_by(
            is_active=True, staleness_type=staleness_type
        ).one_or_none()
        now = cache.setdefault("now", datetime.now(timezone.utc))
        cache[staleness_type] = StalenessPolicy(
            now, getattr(settings, "warning_length", 5) or 5,
            getattr(settings, "staleness_length", 10) or 10,
        )
    return cache[staleness_type]
