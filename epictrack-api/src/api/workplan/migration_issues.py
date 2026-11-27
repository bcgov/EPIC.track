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
"""The rows each work backfill couldn't fully convert, kept in migration_issues."""
from typing import Iterable, List, NamedTuple

import sqlalchemy as sa


class Issue(NamedTuple):
    """A row a backfill had to assume something for, or couldn't convert."""

    work_id: int
    table_name: str
    row_id: int
    issue: str
    detail: str


def replace_issues(connection, work_ids: List[int], issues: List[Issue], codes: Iterable[str]) -> None:
    """Replace these works' issues with these codes, leaving other backfills' issues alone."""
    if not work_ids:
        return
    connection.execute(
        sa.text("DELETE FROM migration_issues WHERE work_id = ANY(:ids) AND issue = ANY(:codes)"),
        {"ids": work_ids, "codes": list(codes)},
    )
    if issues:
        connection.execute(
            sa.text("INSERT INTO migration_issues (work_id, table_name, row_id, issue, detail)"
                    " VALUES (:work_id, :table_name, :row_id, :issue, :detail)"),
            [issue._asdict() for issue in issues],
        )
