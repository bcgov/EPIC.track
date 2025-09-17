"""Insight generator for assessment works grouped by phase"""

from typing import List

from sqlalchemy import func

from api.models import db
from api.models.phase_code import PhaseCode
from api.models.work import Work
from api.models.work_phase import WorkPhase
from api.models.work_type import WorkType
from api.models.project import Project
from api.models.work_type import WorkTypeEnum
from api.insights.insights_table_filters import build_insights_filters


# pylint: disable=not-callable
class AssessmentWorksByPhaseInsightGenerator:
    """Insight generator for assessment works grouped by phase"""

    def generate_partition_query(self, filters: List = None):
        """Generates the group by subquery."""
        filter_exprs = build_insights_filters(filters) if filters else []
        query = db.session.query(
            WorkPhase.phase_id,
            func.count(func.distinct(Work.id)).label("count"),
        )
        # Join necessary tables for filters
        if filters:
            query = query.join(Work, Work.id == WorkPhase.work_id)
            query = query.join(WorkType, Work.work_type_id == WorkType.id)
            query = query.join(Project, Work.project_id == Project.id)
        query = query.filter(
            Work.is_active.is_(True),
            Work.is_deleted.is_(False),
            Work.is_completed.is_(False),
            Work.work_type_id == WorkTypeEnum.ASSESSMENT.value,
            WorkPhase.id == Work.current_work_phase_id,
            *filter_exprs if filter_exprs else [],
        )
        query = query.group_by(WorkPhase.phase_id)
        return query.subquery()

    def fetch_data(self, filters: List = None) -> List[dict]:
        """Fetch data from db"""
        partition_query = self.generate_partition_query(filters)

        assessment_insights = (
            db.session.query(PhaseCode)
            .join(partition_query, partition_query.c.phase_id == PhaseCode.id)
            .add_columns(
                PhaseCode.name.label("phase"),
                PhaseCode.id.label("phase_id"),
                partition_query.c.count.label("work_count"),
            )
            .order_by(partition_query.c.count.desc())
            .all()
        )
        return self._format_data(assessment_insights)

    def _format_data(self, data) -> List[dict]:
        """Format data to the response format"""
        assessment_insights = [
            {
                "phase": row.phase,
                "phase_id": row.phase_id,
                "count": row.work_count,
            }
            for row in data
        ]
        return assessment_insights
