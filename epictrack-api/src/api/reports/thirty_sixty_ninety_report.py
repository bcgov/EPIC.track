"""Classes for specific report types."""
from datetime import datetime, timedelta
from io import BytesIO

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
from sqlalchemy.orm import aliased

from api.models import Event, Project, Work, WorkStatus, WorkType, db
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration

from .report_factory import ReportFactory


# pylint:disable=not-callable


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
            "event_description",
            "work_id",
            "milestone_id",
            "event_id",
            "event_title",
            "event_date",
        ]
        super().__init__(data_keys, filters=filters)
        self.report_date = None
        self.report_title = "30-60-90"
        self.pecp_configuration_ids = db.session.execute(
            select(EventConfiguration.id)
            .where(
                EventConfiguration.event_category_id == EventCategoryEnum.PCP.value,
            )
        ).scalars().all()

        self.decision_configuration_ids = db.session.execute(
            select(EventConfiguration.id)
            .where(
                EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            )
        ).scalars().all()

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA 30-60-90 Report"""
        max_date = report_date + timedelta(days=90)
        pecp_event = aliased(Event)
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
                Event.work_id,
                func.min(
                    func.coalesce(Event.actual_date, Event.anticipated_date)
                ).label("min_start_date"),
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date).between(
                    report_date.date(), max_date.date()
                ),
                Event.event_configuration_id.in_(self.pecp_configuration_ids),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        results_qry = (
            Work.query.filter(Work.is_active.is_(True), Work.is_deleted.is_(False))
            .join(Project)
            .join(WorkType)
            .join(
                Event,
                or_(
                    and_(
                        Event.work_id == Work.id,
                        func.coalesce(
                            Event.actual_date, Event.anticipated_date
                        ).between(report_date.date(), max_date.date()),
                        Event.event_configuration_id.in_(self.decision_configuration_ids),
                    ),
                    and_(
                        Event.work_id == Work.id,
                        Work.is_high_priority.is_(True),
                        Event.high_priority.is_(True),
                        func.coalesce(
                            Event.actual_date, Event.anticipated_date
                        ).between(report_date.date(), max_date.date()),
                    ),
                ),
            )
            .join(EventConfiguration, EventConfiguration.id == Event.event_configuration_id)
            .outerjoin(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == Work.id,
                ),
            )
            .outerjoin(
                pecp_event,
                and_(
                    next_pecp_query.c.work_id == pecp_event.work_id,
                    next_pecp_query.c.min_start_date == pecp_event.actual_date,
                    pecp_event.event_configuration_id.in_(self.pecp_configuration_ids),
                ),
            )
            .outerjoin(WorkStatus)
            .outerjoin(
                status_update_max_date_query,
                and_(
                    status_update_max_date_query.c.work_id == WorkStatus.work_id,
                    status_update_max_date_query.c.max_posted_date == WorkStatus.posted_date,
                ),
            )
            .add_columns(
                Project.name.label("project_name"),
                WorkType.report_title.label("work_report_title"),
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"),
                                                       INTERVAL)
                ).label("anticipated_decision_date"),
                # Event.anticipated_end_date.label("anticipated_decision_date"),
                Work.report_description.label("work_short_description"),
                WorkStatus.description.label("work_status_text"),
                Event.notes.label("decision_information"),
                Event.description.label("event_description"),
                pecp_event.topic.label("pecp_explanation"),
                Work.id.label("work_id"),
                Event.id.label("event_id"),
                Event.name.label("event_title"),
                func.coalesce(Event.actual_date, Event.anticipated_date).label(
                    "event_date"
                ),
                EventConfiguration.event_category_id.label("milestone_id"),
            )
        )

        # print(results_qry.statement.compile(compile_kwargs={"literal_binds": True}))
        return results_qry.all()

    def _format_data(self, data):
        data = super()._format_data(data)
        # major_decision_miletones =  Milestone.query.filter(
        #     Milestone.milestone_type_id.in_((1, 4))
        # ).all()
        # major_decision_miletones = [x.id for x in major_decision_miletones]
        response = {
            "30": [],
            "60": [],
            "90": [],
        }
        for work in data:
            next_major_decision_event_query = (
                db.session.query(
                    Event.work_id,
                    func.min(Event.anticipated_date).label(
                        "min_anticipated_start_date"
                    ),
                )
                .filter(
                    Event.anticipated_date >= work["anticipated_decision_date"],
                    Event.event_configuration_id.in_(self.decision_configuration_ids),
                )
                .group_by(Event.work_id)
                .subquery()
            )
            next_major_decision_event = (
                Event.query.filter(Event.work_id == work["work_id"])
                .join(
                    next_major_decision_event_query,
                    and_(
                        Event.work_id == next_major_decision_event_query.c.work_id,
                        Event.anticipated_date == next_major_decision_event_query.c.min_anticipated_start_date,
                    ),
                )
                .first()
            )
            event_decision_date = work["anticipated_decision_date"]
            work[
                "anticipated_decision_date"
            ] = next_major_decision_event.anticipated_date
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
                response["30"].append(work)
            elif event_decision_date <= (self.report_date + timedelta(days=60)):
                response["60"].append(work)
            elif event_decision_date <= (self.report_date + timedelta(days=90)):
                response["90"].append(work)
        return response

    def generate_report(
        self, report_date: datetime, return_type
    ):  # pylint: disable=too-many-locals
        """Generates a report and returns it"""
        self.report_date = report_date.astimezone(utc)
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" and data:
            return {"data": data}, None
        if not data:
            return {}, None
        pdf_stream = BytesIO()
        stylesheet = getSampleStyleSheet()
        doc = BaseDocTemplate(pdf_stream, pagesize=A4)
        doc.page_width = doc.width + doc.leftMargin * 2  # pylint: disable=no-member
        doc.page_height = doc.height + doc.bottomMargin * 2  # pylint: disable=no-member
        page_table_frame = Frame(
            doc.leftMargin,  # pylint: disable=no-member
            doc.bottomMargin,  # pylint: disable=no-member
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
        styles = []
        row_index = 1

        normal_style = stylesheet["Normal"]
        normal_style.fontSize = 6.5
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
            for work in item:
                event_description = ""
                if work["is_decision_event"] and work["decision_information"]:
                    event_description = work["decision_information"]
                elif work["is_pecp_event"] and work["pecp_explanation"]:
                    event_description = work["pecp_explanation"]
                elif work["event_description"]:
                    event_description = work["event_description"]
                table_data.append(
                    [
                        [
                            Paragraph(
                                f"{work['project_name']} - {work['work_report_title']}",
                                normal_style,
                            ),
                            Paragraph(
                                f"{work['anticipated_decision_date']: %B %d, %Y}",
                                normal_style,
                            ),
                        ],
                        [
                            Paragraph(
                                work["work_short_description"]
                                if work["work_short_description"]
                                else "",
                                normal_style,
                            ),
                            Paragraph(
                                work["work_status_text"]
                                if work["work_status_text"]
                                else "",
                                normal_style,
                            ),
                            Paragraph(
                                event_description if event_description else "",
                                normal_style,
                            ),
                        ],
                    ]
                )
                row_index += 1
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
                ] + styles
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
