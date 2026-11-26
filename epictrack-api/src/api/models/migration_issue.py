# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Rows the work backfill couldn't fully convert, kept until the legacy tables are dropped."""
import sqlalchemy as sa

from api.utils.utcnow import utcnow

from .db import db


class MigrationIssue(db.Model):  # pylint: disable=too-few-public-methods
    """One row of a work that the backfill left with an assumption or without a link."""

    __tablename__ = "migration_issues"

    id = sa.Column(sa.Integer, primary_key=True, autoincrement=True)
    work_id = sa.Column(sa.ForeignKey("works.id", ondelete="CASCADE"), nullable=False, index=True)
    table_name = sa.Column(sa.String(50), nullable=False)
    row_id = sa.Column(sa.Integer, nullable=False)
    # A short code, such as empty_start_at.
    issue = sa.Column(sa.String(50), nullable=False)
    detail = sa.Column(sa.Text)
    created_at = sa.Column(sa.DateTime(timezone=True), server_default=utcnow())
