"""Insight generator for work resource grouped by EAO team"""

from typing import List

from sqlalchemy import func
from api.models import db
from api.models.eao_team import EAOTeam
from api.models.work import Work


# pylint: disable=not-callable
class WorkTeamInsightGenerator:
    """Insight generator for work resource grouped by EAO team"""

    def generate_partition_query(self):
        """Generates the group by subquery."""
        partition_query = (
            db.session.query(
                Work.eao_team_id,
                func.count()
                .over(order_by=Work.eao_team_id, partition_by=Work.eao_team_id)
                .label("count"),
            )
            .group_by(Work.eao_team_id, Work.id)
            .filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.is_completed.is_(False),
            )
            .distinct(Work.id)
            .subquery()
        )
        return partition_query

    def fetch_data(self) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query()

        team_insights = (
            db.session.query(EAOTeam)
            .join(partition_query, partition_query.c.eao_team_id == EAOTeam.id)
            .add_columns(
                EAOTeam.name.label("eao_team"),
                EAOTeam.id.label("eao_team_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(team_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        team_insights = [
            {
                "eao_team": row.eao_team,
                "eao_team_id": row.eao_team_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return team_insights
