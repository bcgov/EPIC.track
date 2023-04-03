"""Classes for specific report types."""
from calendar import monthrange
from collections import defaultdict
from datetime import datetime
from functools import partial
from io import BytesIO

from dateutil import rrule
from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import Paragraph, Table, TableStyle
from sqlalchemy import Date, and_, func
from sqlalchemy.dialects.postgresql import DATERANGE
from sqlalchemy.orm import aliased

from reports_api.models import (
    EAAct, EAOTeam, Event, FederalInvolvement, Milestone, PhaseCode, Project, Region, Staff, StaffWorkRole, SubType,
    Type, Work, WorkType, db)

# from .cdog_client import CDOGClient
from .report_factory import ReportFactory


daterange = partial(func.daterange, type_=DATERANGE)


class EAResourceForeCastReport(ReportFactory):
    """EA Resource Forecast Report Generator"""

    def __init__(self, filters):
        """Initialize the ReportFactory"""
        data_keys = [
            "project_name",
            "capital_investment",
            "ea_type",
            "project_phase",
            "ea_act",
            "iaac",
            "sub_type",
            "type",
            "eao_team",
            "responsible_epd",
            "work_lead",
            "env_region",
            "nrs_region",
            "staff_first_name",
            "staff_last_name",
            "role_id",
            "work_id",
            "ea_type_label"
        ]
        group_by = "project_name"
        super().__init__(data_keys, group_by, None, filters)
        self.excluded_items = []
        if self.filters and "exclude" in self.filters:
            self.excluded_items = self.filters["exclude"]
        self.report_title = "EAO Resource Forecast"
        start_event_milestones = (
            db.session.query(
                func.min(Milestone.id).label("milestone_id"), Milestone.phase_id
            )
            .group_by(Milestone.phase_id)
            .all()
        )
        self.start_event_milestones = [x.milestone_id for x in start_event_milestones]
        self.month_labels = []
        self.report_cells = {
            "[PROJECT BACKGROUND]": [
                {"data_key": "project_name", "label": "PROJECT NAME"},
                {
                    "data_key": "capital_investment",
                    "label": "ESTIMATED CAPITAL INVESTMENT"
                },
                {"data_key": "project_phase", "label": "PROJECT PHASE"},
                {
                    "data_key": "ea_act",
                    "label": "EA ACT"
                },
                {"data_key": "iaac", "label": "IAAC"},
                {"data_key": "sector(sub)", "label": "TYPE (SUB)"},
                {"data_key": "env_region", "label": "MOE REGION"},
                {"data_key": "nrs_region", "label": "NRS REGION"},
            ],
            "[EAO RESOURCING]": [
                {"data_key": "responsible_epd", "label": "EPD LEAD"},
                {"data_key": "cairt_lead", "label": "FN CAIRT LEAD"},
                {"data_key": "eao_team", "label": "TEAM"},
                {"data_key": "work_lead", "label": "PROJECT LEAD"},
                {"data_key": "work_team_members", "label": "WORK TEAM MEMBERS"},
            ],
            "QUARTERS": [],
            "Expected Referral Date": [
                {
                    "data_key": "referral_timing",
                    "label": "Expected Referral Date"
                }
            ],
        }
        self.end_date = None

    def _get_latest_event_subquery(self, date: datetime):
        """Return the subquery to find the latest event for a given date"""
        latest_event_query = (
            db.session.query(
                Event.work_id,
                func.max(
                    func.coalesce(Event.start_date, Event.anticipated_start_date)
                ).label("max_start_date"),
            )
            .filter(
                Event.milestone_id.in_(self.start_event_milestones),
                func.coalesce(Event.start_date, Event.anticipated_start_date) <= date,
            )
            .group_by(Event.work_id)
            .subquery()
        )
        return latest_event_query

    def _get_report_meta_data(self, report_date: datetime):
        section_headings = []
        cell_headings = []
        styles = []
        cell_keys = []
        quarter1, remaining = divmod(report_date.month, 3)
        if remaining > 0:
            quarter1 += 1
        if quarter1 == 4:
            quarter2 = 1
        else:
            quarter2 = quarter1 + 1
        cell_index = 0
        for section_heading, cells in self.report_cells.items():
            filtered_cells = []
            if section_heading == "QUARTERS":
                section_headings += [
                    f"{report_date.year} Q{quarter1}",
                    "",
                    "",
                    f"{self.end_date.year} Q{quarter2}",
                ]
                styles.append(("SPAN", (cell_index, 0), (cell_index + 2, 0)))
                styles.append(
                    (
                        "BACKGROUND",
                        (cell_index, 0),
                        (cell_index + 3, 2),
                        (0.3, 0.663, 0.749),
                    )
                )
                cell_index += 3
                cell_headings += self.month_labels
            else:
                filtered_cells = [
                    x for x in cells if x["data_key"] not in self.excluded_items
                ]
                section_headings.append(section_heading)
                if len(filtered_cells) > 1:
                    section_headings += [""] * (len(filtered_cells) - 1)  # for colspan
                    styles.append(
                        (
                            "SPAN",
                            (cell_index, 0),
                            (cell_index + len(filtered_cells) - 1, 0),
                        )
                    )
                    if section_heading == "[PROJECT BACKGROUND]":
                        styles.append(
                            (
                                "BACKGROUND",
                                (0, 0),
                                (len(filtered_cells) - 1, 2),
                                (0.749, 0.749, 0.749),
                            )
                        )
                    elif section_heading == "[EAO RESOURCING]":
                        styles.append(
                            (
                                "BACKGROUND",
                                (cell_index, 0),
                                (cell_index + len(filtered_cells) - 1, -1),
                                (0.949, 0.949, 0.949),
                            )
                        )
            for cell in filtered_cells:
                cell_headings.append(cell["label"])
                cell_keys.append(cell["data_key"])
            cell_index += len(filtered_cells)
        headers = [section_headings, cell_headings]
        return headers, cell_keys, styles

    def _fetch_data(self, report_date: datetime):  # pylint: disable=too-many-locals
        """Fetches the relevant data for EA Resource Forecast Report"""
        report_start_date = report_date.date()
        report_start_date = report_start_date.replace(month=report_start_date.month + 1)
        year = report_start_date.year
        year_offset, end_month = divmod(report_start_date.month + 5, 13)
        if year_offset > 0:
            end_month += 1
        start_date = report_start_date.replace(day=1)
        self.end_date = report_start_date.replace(
            year=year + year_offset,
            month=end_month,
            day=monthrange(year + year_offset, end_month)[1],
        )
        env_region = aliased(Region)
        nrs_region = aliased(Region)
        responsible_epd = aliased(Staff)
        work_lead = aliased(Staff)
        project_phase = aliased(PhaseCode)

        project_phase_query = (
            db.session.query(
                Event.work_id,
                func.max(Event.start_date).label("max_start_date"),
            )
            .filter(
                Event.start_date <= report_start_date,
                Event.milestone_id.in_(self.start_event_milestones),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        first_month_query = self._get_latest_event_subquery(report_start_date)
        first_month_aliases = {
            "phase": aliased(PhaseCode),
            "event": aliased(Event),
            "milestone": aliased(Milestone),
            "label": f"{report_start_date:%B}",
        }
        year_offset, second_month = divmod(report_start_date.month + 1, 13)
        second_date = report_start_date.replace(
            year=year + year_offset,
            month=second_month,
            day=monthrange(year + year_offset, second_month)[1],
        )
        second_month_query = self._get_latest_event_subquery(second_date)
        second_month_aliases = {
            "phase": aliased(PhaseCode),
            "event": aliased(Event),
            "milestone": aliased(Milestone),
            "label": f"{second_date:%B}",
        }
        year_offset, third_month = divmod(report_start_date.month + 2, 13)
        third_date = report_start_date.replace(
            year=year + year_offset,
            month=third_month,
            day=monthrange(year + year_offset, third_month)[1],
        )
        third_month_query = self._get_latest_event_subquery(third_date)
        third_month_aliases = {
            "phase": aliased(PhaseCode),
            "event": aliased(Event),
            "milestone": aliased(Milestone),
            "label": f"{third_date:%B}",
        }
        year_offset, remaining_start = divmod(report_start_date.month + 3, 13)
        remaining_start_date = report_start_date.replace(
            year=year + year_offset,
            month=remaining_start,
            day=1,
        )
        remaining_month_query = self._get_latest_event_subquery(self.end_date)
        month_labels = []
        for date in rrule.rrule(
            rrule.MONTHLY, dtstart=remaining_start_date, until=self.end_date
        ):
            month_label = f"{date:%b}"
            if date.month == 12:
                month_label += f"{date:%Y}"
            month_labels.append(month_label)
        if self.end_date.year > report_start_date.year:
            month_labels[-1] += f"{self.end_date:%Y}"
        remaining_month_aliases = {
            "phase": aliased(PhaseCode),
            "event": aliased(Event),
            "milestone": aliased(Milestone),
            "label": ", ".join(month_labels),
        }

        self.month_labels = [
            first_month_aliases["label"],
            second_month_aliases["label"],
            third_month_aliases["label"],
            remaining_month_aliases["label"],
        ]

        self.data_keys += self.month_labels
        self.data_keys += [
            f'{first_month_aliases["label"]}_color',
            f'{second_month_aliases["label"]}_color',
            f'{third_month_aliases["label"]}_color',
            f'{remaining_month_aliases["label"]}_color',
        ]

        results_qry = (
            Project.query.filter(
                Project.is_project_closed.is_(False),
                Project.is_deleted.is_(False),
                Project.is_active.is_(True),
            )
            .join(Work)
            .join(WorkType)
            .join(EAAct)
            .outerjoin(EAOTeam)
            .join(FederalInvolvement)
            .join(project_phase_query, project_phase_query.c.work_id == Work.id)
            .join(
                Event,
                and_(
                    project_phase_query.c.work_id == Event.work_id,
                    Event.start_date == project_phase_query.c.max_start_date,
                    Event.milestone_id.in_(self.start_event_milestones),
                ),
            )
            .join(Milestone, Event.milestone_id == Milestone.id)
            .join(project_phase, Milestone.phase_id == project_phase.id)
            .join(SubType)
            .join(Type)
            .join(env_region, env_region.id == Project.region_id_env)
            .join(nrs_region, nrs_region.id == Project.region_id_flnro)
            .outerjoin(StaffWorkRole)
            .outerjoin(
                Staff,
                and_(
                    StaffWorkRole.staff_id == Staff.id,
                    StaffWorkRole.role_id.in_([3, 4, 5]),
                ),
            )
            .outerjoin(responsible_epd, responsible_epd.id == Work.responsible_epd_id)
            .outerjoin(work_lead, work_lead.id == Work.work_lead_id)
            .join(first_month_query, first_month_query.c.work_id == Work.id)
            .join(
                first_month_aliases["event"],
                and_(
                    first_month_query.c.work_id == first_month_aliases["event"].work_id,
                    func.coalesce(
                        first_month_aliases["event"].start_date,
                        first_month_aliases["event"].anticipated_start_date,
                    ) ==
                    first_month_query.c.max_start_date,
                ),
            )
            .join(
                first_month_aliases["milestone"],
                first_month_aliases["event"].milestone_id ==
                first_month_aliases["milestone"].id,
            )
            .join(
                first_month_aliases["phase"],
                first_month_aliases["milestone"].phase_id ==
                first_month_aliases["phase"].id,
            )
            .join(second_month_query, second_month_query.c.work_id == Work.id)
            .join(
                second_month_aliases["event"],
                and_(
                    second_month_query.c.work_id ==
                    second_month_aliases["event"].work_id,
                    func.coalesce(
                        second_month_aliases["event"].start_date,
                        second_month_aliases["event"].anticipated_start_date,
                    ) ==
                    second_month_query.c.max_start_date,
                ),
            )
            .join(
                second_month_aliases["milestone"],
                second_month_aliases["event"].milestone_id ==
                second_month_aliases["milestone"].id,
            )
            .join(
                second_month_aliases["phase"],
                second_month_aliases["milestone"].phase_id ==
                second_month_aliases["phase"].id,
            )
            .join(third_month_query, third_month_query.c.work_id == Work.id)
            .join(
                third_month_aliases["event"],
                and_(
                    third_month_query.c.work_id == third_month_aliases["event"].work_id,
                    func.coalesce(
                        third_month_aliases["event"].start_date,
                        third_month_aliases["event"].anticipated_start_date,
                    ) ==
                    third_month_query.c.max_start_date,
                ),
            )
            .join(
                third_month_aliases["milestone"],
                third_month_aliases["event"].milestone_id ==
                third_month_aliases["milestone"].id,
            )
            .join(
                third_month_aliases["phase"],
                third_month_aliases["milestone"].phase_id ==
                third_month_aliases["phase"].id,
            )
            .join(remaining_month_query, remaining_month_query.c.work_id == Work.id)
            .join(
                remaining_month_aliases["event"],
                and_(
                    remaining_month_query.c.work_id ==
                    remaining_month_aliases["event"].work_id,
                    func.coalesce(
                        remaining_month_aliases["event"].start_date,
                        remaining_month_aliases["event"].anticipated_start_date,
                    ) ==
                    remaining_month_query.c.max_start_date,
                ),
            )
            .join(
                remaining_month_aliases["milestone"],
                remaining_month_aliases["event"].milestone_id ==
                remaining_month_aliases["milestone"].id,
            )
            .join(
                remaining_month_aliases["phase"],
                remaining_month_aliases["milestone"].phase_id ==
                remaining_month_aliases["phase"].id,
            )
            .filter(
                daterange(
                    Work.start_date.cast(Date),
                    func.coalesce(
                        Work.decision_date.cast(Date),
                        Work.anticipated_decision_date.cast(Date),
                    ),
                    "[)",
                ).overlaps(daterange(start_date, self.end_date, "[)"))
            )
            .add_columns(
                Project.name.label("project_name"),
                Project.capital_investment.label("capital_investment"),
                WorkType.name.label("ea_type"),
                WorkType.report_title.label("ea_type_label"),
                project_phase.name.label("project_phase"),
                EAAct.name.label("ea_act"),
                FederalInvolvement.name.label("iaac"),
                SubType.name.label("sub_type"),
                Type.name.label("type"),
                EAOTeam.name.label("eao_team"),
                env_region.name.label("env_region"),
                nrs_region.name.label("nrs_region"),
                Work.id.label("work_id"),
                responsible_epd.full_name.label("responsible_epd"),
                work_lead.full_name.label("work_lead"),
                first_month_aliases["phase"].name.label(first_month_aliases["label"]),
                first_month_aliases["phase"].color.label(
                    f'{first_month_aliases["label"]}_color'
                ),
                second_month_aliases["phase"].name.label(second_month_aliases["label"]),
                second_month_aliases["phase"].color.label(
                    f'{second_month_aliases["label"]}_color'
                ),
                third_month_aliases["phase"].name.label(third_month_aliases["label"]),
                third_month_aliases["phase"].color.label(
                    f'{third_month_aliases["label"]}_color'
                ),
                remaining_month_aliases["phase"].name.label(
                    remaining_month_aliases["label"]
                ),
                remaining_month_aliases["phase"].color.label(
                    f'{remaining_month_aliases["label"]}_color'
                ),
                Staff.first_name.label("staff_first_name"),
                Staff.last_name.label("staff_last_name"),
                StaffWorkRole.role_id.label("role_id"),
            )
        )
        return results_qry.all()

    def _format_data(self, data):  # pylint: disable=too-many-locals
        result = super()._format_data(data)
        response = []
        for _, values in result.items():
            staffs = []
            project_data = values[0]
            project_data["cairt_lead"] = ""
            for value in values:
                role = value.pop("role_id")
                first_name = value.pop("staff_first_name")
                last_name = value.pop("staff_last_name")
                if role == 4:
                    project_data["cairt_lead"] = f"{last_name}, {first_name}"
                elif role in [3, 5]:
                    staffs.append({"first_name": first_name, "last_name": last_name})
            staffs = sorted(staffs, key=lambda x: x["last_name"])
            staffs = [f"{x['last_name']}, {x['first_name']}" for x in staffs]
            project_data["work_team_members"] = "; ".join(staffs)
            if project_data.get("capital_investment", None):
                project_data[
                    "capital_investment"
                ] = f"{project_data['capital_investment']:,.0f}"
            months = []
            for month in self.month_labels:
                month_data = project_data.pop(month)
                color = project_data.pop(f"{month}_color")
                months.append({"label": month, "phase": month_data, "color": color})
            project_data["months"] = months
            project_data[
                "sector(sub)"
            ] = f"{project_data['type']}({project_data['sub_type']})"
            referral_timing_query = (
                db.session.query(PhaseCode)
                .join(WorkType)
                .join(Milestone)
                .join(Event)
                .filter(
                    and_(
                        WorkType.id == PhaseCode.work_type_id,
                        WorkType.name == project_data["ea_type"],
                        Event.work_id == project_data["work_id"],
                    )
                )
                .group_by(PhaseCode.id)
                .order_by(PhaseCode.id.desc())
            )
            if project_data["ea_type"] == "Assessment":
                referral_timing_obj = referral_timing_query.offset(1).first()
                referral_timing_milestone = next(
                    obj
                    for obj in referral_timing_obj.milestones
                    if obj.milestone_type_id == 14
                )
            else:
                referral_timing_obj = referral_timing_query.first()
                referral_timing_milestone = next(
                    obj
                    for obj in referral_timing_obj.milestones
                    if obj.milestone_type_id == 13
                )
            # else:
            #     pass
            referral_timing = Event.query.filter(
                Event.milestone_id == referral_timing_milestone.id
            ).first()
            project_data[
                "referral_timing"
            ] = f"{referral_timing.anticipated_start_date:%B %d, %Y}"
            response.append(project_data)

        return response

    def generate_report(
        self, report_date, return_type
    ):  # pylint: disable=too-many-locals,too-many-statements
        """Generates a report and returns it"""
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" and data:
            return {"data": data}, None
        if not data:
            return {}, None
        formatted_data = defaultdict(list)
        for item in data:
            formatted_data[item["ea_type_label"]].append(item)
        pdf_stream = BytesIO()
        page_size = landscape(A3)
        width, height = page_size
        side_margin = (.75 * inch)
        available_table_width = width - (side_margin * 2)
        canv = Canvas(pdf_stream, pagesize=page_size)
        table_headers, table_cells, styles = self._get_report_meta_data(report_date)
        table_data = []
        row_index = 2
        stylesheet = getSampleStyleSheet()
        normal_style = stylesheet["Normal"]
        normal_style.fontSize = 5
        for ea_type_label, projects in formatted_data.items():
            table_data.append([f"{ea_type_label.upper()}({len(projects)})"] + [""] * (len(table_headers[1]) - 1))
            styles.append(("SPAN", (0, row_index), (-1, row_index)))
            styles.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.black))
            styles.append(("TEXTCOLOR", (0, row_index), (-1, row_index), colors.white))
            row_index += 1
            for project in projects:
                row = []
                for cell in table_cells[:-1]:
                    row.append(Paragraph(project[cell], normal_style))
                month_cell_start = len(table_cells) - 1
                for month_index, month in enumerate(self.month_labels):
                    month_data = next(
                        x for x in project["months"] if x["label"] == month
                    )
                    row.append(Paragraph(month_data["phase"], normal_style))
                    cell_index = month_cell_start + month_index
                    color = month_data["color"][1:]
                    bg_color = [int(color[i: i + 2], 16) / 255 for i in (0, 2, 4)]
                    styles.append(
                        (
                            "BACKGROUND",
                            (cell_index, row_index),
                            (cell_index, row_index),
                            bg_color,
                        )
                    )
                row.append(Paragraph(project[table_cells[-1]], normal_style))
                table_data.append(row)
                row_index += 1
        table = Table(
            table_headers + table_data, repeatRows=3
        )
        table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 5),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, 1), "CENTER"),
                    ("ALIGN", (0, 2), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 2), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 0), (-1, 1), "Helvetica-Bold"),
                ] +
                styles
            )
        )

        tables = table.split(available_table_width, height - 100)
        for table in tables:
            top_margin = 25
            para = Paragraph(
                "<b>Document Title: EAO Resource Forecast</b>", normal_style
            )
            _, top_offset = para.wrap(width, height)
            para.drawOn(canv, side_margin, height - (top_offset + top_margin))
            top_margin = top_margin + top_offset
            para = Paragraph(f"Month of {report_date:%B %Y}", normal_style)
            _, top_offset = para.wrap(width, height)
            para.drawOn(canv, side_margin, height - (top_offset + top_margin))
            top_margin = top_margin + top_offset
            para = Paragraph("EAO Operations Division ADMO", normal_style)
            _, top_offset = para.wrap(width, height)
            para.drawOn(canv, side_margin, height - (top_offset + top_margin))
            top_margin = top_margin + top_offset
            normal_style.fontSize = 6
            para = Paragraph(
                "<b>PREPARED FOR INTERNAL DISCUSSION PURPOSES</b>", normal_style
            )
            _, top_offset = para.wrap(width, height)
            para.drawOn(canv, side_margin + 300, height - (top_offset + top_margin))
            top_margin = top_margin + top_offset
            _, top_offset = table.wrap(available_table_width, height - 100)
            table.drawOn(canv, side_margin, height - (top_offset + top_margin))
            canv.showPage()
        canv.save()
        pdf_stream.seek(0)
        return pdf_stream.getvalue(), f"{self.report_title}_{report_date:%Y_%m_%d}.pdf"
