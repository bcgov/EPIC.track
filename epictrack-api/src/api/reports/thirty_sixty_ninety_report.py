"""Classes for specific report types."""

from datetime import datetime, timedelta
from io import BytesIO
from typing import Dict, List

from operator import attrgetter
from dateutil import parser
from pytz import utc
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import NextPageTemplate, Paragraph, Table, TableStyle
from reportlab.platypus.doctemplate import BaseDocTemplate, PageTemplate
from reportlab.platypus.frames import Frame
from sqlalchemy import and_, func, or_, select
from sqlalchemy.dialects.postgresql import INTERVAL

from api.models import Event, Project, Work, WorkStatus, WorkType, db
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.special_field import EntityEnum
from api.models.work import WorkStateEnum
from api.models.work_issues import WorkIssues
from api.services.special_field import SpecialFieldService
from api.services.work_issues import WorkIssuesService
from api.schemas import response as res
from api.utils.constants import CANADA_TIMEZONE
from api.utils.enums import StalenessEnum
from api.utils.util import process_data

from .report_factory import ReportFactory


# pylint:disable=not-callable,no-member


class ThirtySixtyNinetyReport(ReportFactory):
    """EA 30-60-90 Report Generator"""

    def __init__(self, filters, color_intensity):
        """Initialize the ReportFactory"""
        data_keys = [
            "project_name",
            "work_report_title",
            "anticipated_decision_date",
            "work_short_description",
            "work_status_text",
            "decision_information",
            "pecp_explanation",
            "event_description",
            "work_id",
            "milestone_id",
            "event_id",
            "event_title",
            "event_date",
            "project_id",
            "status_date_updated",
        ]
        super().__init__(data_keys, filters=filters, color_intensity=color_intensity)
        self.report_date = None
        self.report_title = "30-60-90"
        self.pecp_configuration_ids = (
            db.session.execute(
                select(EventConfiguration.id).where(
                    EventConfiguration.event_category_id == EventCategoryEnum.PCP.value,
                )
            )
            .scalars()
            .all()
        )

        self.decision_configuration_ids = (
            db.session.execute(
                select(EventConfiguration.id).where(
                    EventConfiguration.event_type_id.in_(
                        [
                            EventTypeEnum.MINISTER_DECISION.value,
                            EventTypeEnum.CEAO_DECISION.value,
                        ]
                    )
                )
            )
            .scalars()
            .all()
        )

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA 30-60-90 Report"""
        max_date = report_date + timedelta(days=90)
        next_pecp_query = self._get_next_pcp_query(report_date, max_date)
        valid_event_ids = self._get_valid_event_ids(report_date, max_date)
        latest_status_updates = self._get_latest_status_update_query()

        results_qry = (
            Work.query.filter(
                Work.is_active.is_(True),
                Work.is_deleted.is_(False),
                Work.work_state.in_(
                    [WorkStateEnum.IN_PROGRESS.value, WorkStateEnum.SUSPENDED.value]
                ),
            )
            .join(Project)
            .join(WorkType)
            .join(
                Event,
                and_(
                    Event.work_id == Work.id,
                    Event.id.in_(valid_event_ids),
                ),
            )
            .join(
                EventConfiguration,
                EventConfiguration.id == Event.event_configuration_id,
            )
            .outerjoin(latest_status_updates, latest_status_updates.c.work_id == Work.id)
            .outerjoin(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == Work.id,
                ),
            )
            .outerjoin(WorkStatus)
            .add_columns(
                Project.name.label("project_name"),
                WorkType.report_title.label("work_report_title"),
                (
                    Event.anticipated_date
                    + func.cast(func.concat(Event.number_of_days, " DAYS"), INTERVAL)
                ).label("anticipated_decision_date"),
                Work.report_description.label("work_short_description"),
                Event.notes.label("decision_information"),
                Event.description.label("event_description"),
                next_pecp_query.c.topic.label("pecp_explanation"),
                latest_status_updates.c.posted_date.label("status_date_updated"),
                latest_status_updates.c.description.label("work_status_text"),
                Work.id.label("work_id"),
                Event.id.label("event_id"),
                Event.name.label("event_title"),
                func.coalesce(Event.actual_date, Event.anticipated_date).label(
                    "event_date"
                ),
                EventConfiguration.event_category_id.label("milestone_id"),
                Project.id.label("project_id"),
            )
        )

        return results_qry.all()

    def _format_data(self, data):
        data = super()._format_data(data)
        data = self._update_work_issues(data)
        response = {
            "30": [],
            "60": [],
            "90": [],
        }
        project_special_history = self._get_project_special_history(data)
        for work in data:
            next_major_decision_event = self._get_next_major_decision_event(
                work["work_id"], work["anticipated_decision_date"]
            )
            event_decision_date = work["anticipated_decision_date"]
            work["anticipated_decision_date"] = (
                next_major_decision_event.anticipated_date
            )
            work.update(
                {
                    "is_decision_event": False,
                    "is_pecp_event": False,
                    "is_reportable_event": False,
                }
            )
            if work["milestone_id"] in self.decision_configuration_ids:
                work["is_decision_event"] = True
            elif work["milestone_id"] in self.pecp_configuration_ids:
                work["is_pecp_event"] = True
            else:
                work["is_reportable_event"] = True
            if event_decision_date <= (self.report_date + timedelta(days=30)):
                special_history = self._get_project_special_history_id(
                    work["project_id"], project_special_history[30], event_decision_date
                )
                if special_history:
                    work["project_name"] = special_history.field_value
                response["30"].append(work)
            elif event_decision_date <= (self.report_date + timedelta(days=60)):
                special_history = self._get_project_special_history_id(
                    work["project_id"], project_special_history[60], event_decision_date
                )
                if special_history:
                    work["project_name"] = special_history.field_value
                response["60"].append(work)
            elif event_decision_date <= (self.report_date + timedelta(days=90)):
                special_history = self._get_project_special_history_id(
                    work["project_id"], project_special_history[90], event_decision_date
                )
                if special_history:
                    work["project_name"] = special_history.field_value
                response["90"].append(work)
        return response

    def _update_work_issues(self, data) -> List[WorkIssues]:
        """Combine the result with work issues"""
        work_ids = set((work["work_id"] for work in data))
        work_issues = WorkIssuesService.find_work_issues_by_work_ids(work_ids)
        for result_item in data:
            issue_per_work = [
                issue
                for issue in work_issues
                if issue.work_id == result_item["work_id"]
                and issue.is_high_priority is True
            ]
            for issue in issue_per_work:
                latest_update = max(
                    (
                        issue_update
                        for issue_update in issue.updates
                        if issue_update.is_approved
                    ),
                    key=attrgetter("posted_date"),
                )
                setattr(issue, "latest_update", latest_update)

            issues = res.WorkIssuesLatestUpdateResponseSchema(many=True).dump(
                issue_per_work
            )
            dates = [parser.isoparse(issue["latest_update"]["posted_date"]) for issue in issues]
            dates.append(result_item["status_date_updated"])

            if len(dates):
                result_item["oldest_update"] = min(dates)
            else:
                result_item["oldest_update"] = None

            result_item["work_issues"] = issues
        return data

    def generate_report(
        self, report_date: datetime, return_type
    ):  # pylint: disable=too-many-locals
        """Generates a report and returns it"""
        self.report_date = report_date.astimezone(utc)
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        data = self._update_staleness(data, report_date)
        if return_type == "json" or not data:
            return process_data(data, return_type)
        pdf_stream = BytesIO()
        stylesheet = getSampleStyleSheet()
        doc = BaseDocTemplate(pdf_stream, pagesize=A4)
        doc.page_width = doc.width + doc.leftMargin * 2
        doc.page_height = doc.height + doc.bottomMargin * 2
        page_table_frame = Frame(
            doc.leftMargin,
            doc.bottomMargin,
            doc.width,
            doc.height,
            id="large_table",
        )
        page_template = PageTemplate(
            id="LaterPages", frames=[page_table_frame], onPage=self.add_default_info
        )
        doc.addPageTemplates(page_template)
        heading_style = stylesheet["Heading2"]
        heading_style.alignment = TA_CENTER
        story = [NextPageTemplate(["*", "LaterPages"])]
        story.append(Paragraph("30-60-90", heading_style))
        story.append(Paragraph("Environmental Assessment Office", heading_style))
        story.append(
            Paragraph(f"Submitted for: {report_date:%B %d, %Y}", heading_style)
        )

        table_data = [["Issue", "Status/Key Milestones/Next Steps"]]

        normal_style = stylesheet["Normal"]
        normal_style.fontSize = 6.5
        data, styles = self._get_table_data_and_styles(data, normal_style)
        table_data.extend(data)
        table = Table(table_data)
        table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 6.5),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 2), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 0), (-1, 1), "Helvetica-Bold"),
                ]
                + styles
            )
        )
        story.append(table)
        doc.build(story)
        pdf_stream.seek(0)
        return pdf_stream.getvalue(), f"{self.report_title}_{report_date:%Y_%m_%d}.pdf"

    def add_default_info(self, canvas, doc):
        """Adds default information for each page."""
        canvas.saveState()
        last_updated = self.report_date + timedelta(days=-1)
        canvas.drawString(doc.leftMargin, doc.bottomMargin, "Draft and Confidential")
        canvas.drawRightString(
            doc.page_width - doc.rightMargin,
            doc.bottomMargin,
            f"Last updated: {last_updated:%B %d, %Y}",
        )
        canvas.restoreState()

    def _get_next_pcp_query(self, start_date, end_date):
        """Create and return the subquery for next PCP event based on start and end dates"""
        next_pcp_min_date_query = (
            db.session.query(
                Event.work_id,
                func.min(
                    func.coalesce(Event.actual_date, Event.anticipated_date)
                ).label("min_pcp_date"),
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date).between(
                    start_date.date(), end_date.date()
                ),
                Event.event_configuration_id.in_(self.pecp_configuration_ids),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        next_pecp_query = (
            db.session.query(
                Event,
            )
            .join(
                next_pcp_min_date_query,
                and_(
                    next_pcp_min_date_query.c.work_id == Event.work_id,
                    func.coalesce(Event.actual_date, Event.anticipated_date)
                    == next_pcp_min_date_query.c.min_pcp_date,
                ),
            )
            .filter(
                Event.event_configuration_id.in_(self.pecp_configuration_ids),
            )
            .subquery()
        )
        return next_pecp_query

    def _get_valid_event_ids(self, start_date, end_date):
        """Find and return set of valid decision or high priority event ids"""
        valid_events = db.session.query(Event).filter(
            func.coalesce(Event.actual_date, Event.anticipated_date).between(
                start_date.date(), end_date.date()
            ),
            or_(
                Event.event_configuration_id.in_(self.decision_configuration_ids),
                and_(Work.is_high_priority.is_(True), Event.high_priority.is_(True)),
            ),
        )
        valid_events = {x.id for x in valid_events}
        return valid_events

    def _get_next_major_decision_event(self, work_id, anticipated_decision_date):
        """Find and return the next major decision event based on work id and anticipated decision date"""
        next_major_decision_event_query = (
            db.session.query(
                Event.work_id,
                func.min(Event.anticipated_date).label("min_anticipated_start_date"),
            )
            .filter(
                Event.anticipated_date >= anticipated_decision_date,
                Event.event_configuration_id.in_(self.decision_configuration_ids),
            )
            .group_by(Event.work_id)
            .subquery()
        )
        next_major_decision_event = (
            Event.query.filter(Event.work_id == work_id)
            .join(
                next_major_decision_event_query,
                and_(
                    Event.work_id == next_major_decision_event_query.c.work_id,
                    Event.anticipated_date
                    == next_major_decision_event_query.c.min_anticipated_start_date,
                ),
            )
            .first()
        )
        return next_major_decision_event

    def _format_table_data(self, period_data, row_index, style):
        """Generates styled table rows for the given period data"""
        data = []
        for work in period_data:
            event_description = ""
            if work["is_decision_event"] and work["decision_information"]:
                event_description = work["decision_information"]
            elif work["is_pecp_event"] and work["pecp_explanation"]:
                event_description = work["pecp_explanation"]
            elif work["event_description"]:
                event_description = work["event_description"]
            data.append(
                [
                    [
                        Paragraph(
                            f"{work['project_name']} - {work['work_report_title']}",
                            style,
                        ),
                        Paragraph(
                            f"{work['anticipated_decision_date']: %B %d, %Y}",
                            style,
                        ),
                    ],
                    [
                        Paragraph(
                            (
                                work["work_short_description"]
                                if work["work_short_description"]
                                else ""
                            ),
                            style,
                        ),
                        Paragraph(
                            (
                                work["work_status_text"]
                                if work["work_status_text"]
                                else ""
                            ),
                            style,
                        ),
                        Paragraph(
                            event_description if event_description else "",
                            style,
                        ),
                    ],
                ]
            )
            row_index += 1
        return data, row_index

    def _get_table_data_and_styles(self, data, normal_style):
        """Create and return table data and styles"""
        table_data = []
        styles = []
        row_index = 1
        for period, item in data.items():
            table_data.append([f"{period} days", ""])
            styles.append(
                (
                    "SPAN",
                    (0, row_index),
                    (-1, row_index),
                )
            )
            styles.append(("ALIGN", (0, row_index), (-1, row_index), "LEFT"))
            styles.append(
                ("FONTNAME", (0, row_index), (-1, row_index), "Helvetica-Bold"),
            )
            row_index += 1
            period_data, row_index = self._format_table_data(
                item, row_index, normal_style
            )
            table_data.extend(period_data)
        return table_data, styles

    def _get_project_special_history_id(
        self, project_id: int, data: List[dict], date: datetime
    ) -> str:
        """Get the special field history value for project name for given period and date"""
        special_history = next(
            (
                sp_hist
                for sp_hist in data
                if sp_hist.entity_id == project_id and sp_hist.time_range.lower <= date
                and (sp_hist.time_range.upper is None or sp_hist.time_range.upper > date)
            ),
            None,
        )
        return special_history

    def _get_project_ids_by_period(self, data: List[dict]) -> Dict[int, List[int]]:
        """Finds project ids by that fall under 30/60/90 days from report date."""
        periods = {30: [], 60: [], 90: []}
        for index, period in enumerate(periods):
            periods[period] = [
                x["project_id"]
                for x in data
                if x["anticipated_decision_date"] <= self.report_date + timedelta(days=period)
                and x["anticipated_decision_date"] >= self.report_date + timedelta(days=index * 30)
            ]
        return periods

    def _get_project_special_history(self, data: List[dict]) -> Dict[int, List]:
        """Find special field entry for given project ids valid for 30/60/90 days from report date."""
        project_ids_by_period = self._get_project_ids_by_period(data)
        periods = {30: [], 60: [], 90: []}
        for index, period in enumerate(periods):
            periods[period] = SpecialFieldService.find_special_history_by_date_range(
                entity=EntityEnum.PROJECT.value,
                field_name="name",
                from_date=self.report_date + timedelta(days=index * 30),
                to_date=self.report_date + timedelta(days=period),
                entity_ids=project_ids_by_period[period],
            )
        return periods

    def _update_staleness(self, data: dict, report_date: datetime) -> dict:
        """Calculate the staleness based on report date"""
        date = report_date.astimezone(CANADA_TIMEZONE)
        for _, work_type_data in data.items():
            for work in work_type_data:
                if work["status_date_updated"]:
                    diff = (date - work["status_date_updated"]).days
                    if diff > 10:
                        work["status_staleness"] = StalenessEnum.CRITICAL.value
                    elif diff > 5:
                        work["status_staleness"] = StalenessEnum.WARN.value
                    else:
                        work["status_staleness"] = StalenessEnum.GOOD.value
                else:
                    work["status_staleness"] = StalenessEnum.CRITICAL.value
        return data
