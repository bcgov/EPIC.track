"""Classes for specific report types."""
from datetime import timedelta

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import aliased

from reports_api.models import Engagement, Event, Milestone, Project, Work, WorkEngagement, WorkStatus, WorkType, db

from .report_factory import ReportFactory


class ThirtySixtyNinetyReport(ReportFactory):
    """EA 30-60-90 Report Generator"""

    def __init__(self, filters):
        """Initialize the ReportFactory"""
        data_keys = [
            "project_name",
            "work_report_title",
            "anticipated_decision_date",
            "work_short_description",
            "work_status_text",
            "decision_information",
            "pecp_explanation",
        ]
        super().__init__(data_keys, filters=filters)
        self.report_date = None

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA 30-60-90 Report"""
        max_date = report_date + timedelta(days=90)
        decision_miletones = Milestone.query.filter(Milestone.outcomes.any())
        decision_miletones = [x.id for x in decision_miletones]
        pecp_event = aliased(Event)
        pecps = Milestone.query.filter(Milestone.milestone_type_id == 11).all()
        pecps = [x.id for x in pecps]
        status_update_max_date_query = (
            db.session.query(
                WorkStatus.work_id,
                func.max(WorkStatus.posted_date).label("max_posted_date"),
            )
            .filter(WorkStatus.posted_date <= report_date)
            .group_by(WorkStatus.work_id)
            .subquery()
        )
        next_pecp_query = (
            db.session.query(
                Engagement.work_id,
                func.min(Engagement.start_date).label("min_start_date"),
            )
            .join(WorkEngagement)
            .filter(
                Engagement.start_date >= report_date,
                WorkEngagement.milestone_id.in_(pecps),
            )
            .group_by(Engagement.work_id)
            .subquery()
        )

        results_qry = (
            Work.query.filter()
            .join(Project)
            .join(WorkType)
            .join(
                Event,
                or_(
                    and_(
                        Event.work_id == Work.id,
                        Event.anticipated_start_date.between(
                            report_date.date(), max_date.date()
                        ),
                        Event.milestone_id.in_(decision_miletones),
                    ),
                    and_(
                        Event.work_id == Work.id,
                        Work.is_watched.is_(True),
                        Event.is_reportable.is_(True),
                        Event.anticipated_start_date.between(
                            report_date.date(), max_date.date()
                        ),
                    ),
                ),
            )
            .join(
                WorkEngagement,
                and_(
                    WorkEngagement.project_id == Work.project_id,
                    WorkEngagement.work_type_id == Work.work_type_id,
                ),
            )
            .join(
                Engagement,
                and_(
                    Engagement.id == WorkEngagement.engagement_id,
                    Engagement.start_date.between(report_date.date(), max_date.date()),
                ),
            )
            .outerjoin(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == Work.id,
                    WorkEngagement.project_id == Work.project_id,
                ),
            )
            # FILTER ENTRIES MATCHING MIN DATE FOR NEXT PECP OR NO WORK ENGAGEMENTS (FOR AMENDMENTS)
            .filter(
                or_(
                    next_pecp_query.c.min_start_date == Engagement.start_date,
                    WorkEngagement.id.is_(None),
                )
            )
            .outerjoin(
                pecp_event,
                and_(
                    next_pecp_query.c.work_id == pecp_event.work_id,
                    next_pecp_query.c.min_start_date == pecp_event.start_date,
                    pecp_event.milestone_id.in_(pecps),
                ),
            )
            .outerjoin(WorkStatus)
            .join(
                status_update_max_date_query,
                or_(
                    and_(
                        status_update_max_date_query.c.work_id == WorkStatus.work_id,
                        status_update_max_date_query.c.max_posted_date ==
                        WorkStatus.posted_date,
                    ),
                    WorkStatus.id.is_(None),
                ),
            )
            .add_columns(
                Project.name.label("project_name"),
                WorkType.report_title.label("work_report_title"),
                Event.anticipated_end_date.label("anticipated_decision_date"),
                Work.short_description.label("work_short_description"),
                WorkStatus.status_text.label("work_status_text"),
                Event.decision_information.label("decision_information"),
                pecp_event.explanation.label("pecp_explanation"),
            )
        )

        print(results_qry.statement.compile(compile_kwargs={"literal_binds": True}))
        return results_qry.all()

    def _format_data(self, data):
        data = super()._format_data(data)
        response = {
            "30": [],
            "60": [],
            "90": [],
        }
        for work in data:
            if work["anticipated_decision_date"] <= (
                self.report_date + timedelta(days=30)
            ):
                response["30"].append(work)
            elif work["anticipated_decision_date"] <= (
                self.report_date + timedelta(days=60)
            ):
                response["60"].append(work)
            elif work["anticipated_decision_date"] <= (
                self.report_date + timedelta(days=90)
            ):
                response["90"].append(work)
        return response

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        self.report_date = report_date
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" and data:
            return {"data": data}, None
        if not data:
            return {}, None
        return None, None
