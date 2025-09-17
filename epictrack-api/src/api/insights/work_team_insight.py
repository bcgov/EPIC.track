"""Insight generator for work resource grouped by EAO team"""

from typing import List

from sqlalchemy import func
from api.models import db
from api.models.eao_team import EAOTeam
from api.models.work import Work
from api.models.project import Project
from api.models.work_type import WorkType
from api.models.work_phase import WorkPhase
from api.models.staff import Staff
from api.models.staff_work_role import StaffWorkRole
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class WorkTeamInsightGenerator:
    """Insight generator for work resource grouped by EAO team"""

    def generate_partition_query(self, filters: List = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters) if filters else []
        query = db.session.query(
            Work.eao_team_id,
            func.count(func.distinct(Work.id)).label("count"),
        )
        # Join necessary tables for filters
        if filters:
            query = query.join(EAOTeam, Work.eao_team_id == EAOTeam.id)
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
            query = query.join(WorkPhase, Work.current_work_phase_id == WorkPhase.id)
            query = query.join(StaffWorkRole, StaffWorkRole.work_id == Work.id)
            query = query.join(Staff, StaffWorkRole.staff_id == Staff.id)
        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            Work.is_completed.is_(False),
            *filter_exprs if filter_exprs else [],
        )
        query = query.group_by(Work.eao_team_id)
        return query.subquery()

    def fetch_data(self, filters: List = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters)

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
