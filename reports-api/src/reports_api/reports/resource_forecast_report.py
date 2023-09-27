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
    EAAct, EAOTeam, Event, FederalInvolvement, PhaseCode, Project, Region, Staff, StaffWorkRole, SubType, Type, Work,
    WorkPhase, WorkType, db)
from reports_api.models.event_configuration import EventConfiguration

from .report_factory import ReportFactory


# pylint:disable=not-callable

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
            "ea_type_label",
            "sector(sub)",
            "ea_type_sort_order"
        ]
        group_by = "work_id"
        super().__init__(data_keys, group_by, None, filters)
        self.excluded_items = []
        if self.filters and "exclude" in self.filters:
            self.excluded_items = self.filters["exclude"]
        self.report_title = "EAO Resource Forecast"
        start_event_configurations = (
            db.session.query(
                func.min(EventConfiguration.id).label("event_configuration_id"), EventConfiguration.phase_id
            )
            .filter(EventConfiguration.mandatory.is_(True), EventConfiguration.start_at == '0')  # Is 0 needed?
            .group_by(EventConfiguration.phase_id)
            .all()
        )
        self.start_event_configurations = [x.event_configuration_id for x in start_event_configurations]
        self.months = []
        self.month_labels = []
        self.report_cells = {
            "[PROJECT BACKGROUND]": [
                {"data_key": "project_name", "label": "PROJECT NAME", "width": 0.053},
                {
                    "data_key": "capital_investment",
                    "label": "EST. CAP. INVESTMENT",
                    "width": 0.082,
                },
                {
                    "data_key": "project_phase",
                    "label": "PROJECT PHASE",
                    "width": 0.0579,
                },
                {"data_key": "ea_act", "label": "EA ACT", "width": 0.0424},
                {"data_key": "iaac", "label": "IAAC", "width": 0.0355},
                {"data_key": "sector(sub)", "label": "TYPE (SUB)", "width": 0.06},
                {"data_key": "env_region", "label": "MOE REGION", "width": 0.046},
                {"data_key": "nrs_region", "label": "NRS REGION", "width": 0.046},
            ],
            "[EAO RESOURCING]": [
                {"data_key": "responsible_epd", "label": "EPD LEAD", "width": 0.0407},
                {"data_key": "cairt_lead", "label": "FN CAIRT LEAD", "width": 0.0486},
                {"data_key": "eao_team", "label": "TEAM", "width": 0.028},
                {"data_key": "work_lead", "label": "PROJECT LEAD", "width": 0.0488},
                {
                    "data_key": "work_team_members",
                    "label": "WORK TEAM MEMBERS",
                    "width": 0.0811,
                },
            ],
            "QUARTERS": [],
            "Expected Referral Date": [
                {
                    "data_key": "referral_timing",
                    "label": "Expected Referral Date",
                    "width": 0.0725,
                }
            ],
        }
        self.end_date = None

    def _filter_work_events(self, work_id, events):
        work_events = list(filter(lambda x: work_id == x.work_id, events))
        return work_events

    def _get_report_meta_data(
        self, report_date: datetime, available_width: float
    ):  # pylint: disable=too-many-locals
        section_headings = []
        cell_headings = []
        styles = []
        cell_keys = []
        cell_widths = []
        report_start_date = report_date.date().replace(day=1)
        report_start_date = self._add_months(report_start_date, 1, False)
        quarter1, remaining = divmod(report_start_date.month, 3)
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
                cell_widths.extend([0.0625 * available_width] * 4)
            else:
                filtered_cells = [
                    x for x in cells if x["data_key"] not in self.excluded_items
                ]
                if len(filtered_cells) > 1:
                    section_headings.append(section_heading)
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
                cell_widths.append(available_width * cell["width"])
            cell_index += len(filtered_cells)
        headers = [section_headings, cell_headings]
        return headers, cell_keys, styles, cell_widths

    def _fetch_data(self, report_date: datetime):  # pylint: disable=too-many-locals
        """Fetches the relevant data for EA Resource Forecast Report"""
        report_start_date = report_date.date().replace(day=1)
        first_month = self._add_months(report_start_date, 1, False)
        self.end_date = self._add_months(first_month, 5)
        env_region = aliased(Region)
        nrs_region = aliased(Region)
        responsible_epd = aliased(Staff)
        work_lead = aliased(Staff)
        project_phase = aliased(PhaseCode)

        project_phase_query = (
            db.session.query(
                Event.work_id,
                func.max(Event.actual_date).label("max_start_date"),
            )
            .filter(
                Event.actual_date <= first_month,
                Event.event_configuration_id.in_(self.start_event_configurations),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        second_month = self._add_months(first_month, 1)
        third_month = self._add_months(second_month, 1)
        remaining_start_month = self._add_months(third_month, 1, False)
        self.months = [
            report_start_date.replace(
                day=monthrange(report_start_date.year, report_start_date.month)[1]
            ),
            first_month.replace(day=monthrange(first_month.year, first_month.month)[1]),
            second_month,
            third_month,
            self.end_date,
        ]
        self.month_labels = list(map(lambda x: f"{x:%B}", self.months[1:-1]))
        q2_month_labels = []
        for month in rrule.rrule(
            rrule.MONTHLY, dtstart=remaining_start_month, until=self.end_date
        ):
            month_label = f"{month:%b}"
            if month.month == 12:
                month_label += f"{month:%Y}"
            q2_month_labels.append(month_label)
        if self.end_date.year > first_month.year:
            q2_month_labels[-1] += f"{self.end_date:%Y}"
        self.month_labels.append(", ".join(q2_month_labels))

        works = (
            Project.query.filter(
                Project.is_project_closed.is_(False),
                Project.is_deleted.is_(False),
                Project.is_active.is_(True),
            )
            .join(Work, Work.project_id == Project.id)
            .join(WorkType, Work.work_type_id == WorkType.id)
            .join(EAAct, Work.ea_act_id == EAAct.id)
            .outerjoin(EAOTeam, Work.eao_team_id == EAOTeam.id)
            .join(FederalInvolvement)
            .join(project_phase_query, project_phase_query.c.work_id == Work.id)
            .join(
                Event,
                and_(
                    project_phase_query.c.work_id == Event.work_id,
                    Event.actual_date == project_phase_query.c.max_start_date,
                    # Event.event_configuration_id.in_(self.start_event_configurations),
                ),
            )
            .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
            .join(project_phase, EventConfiguration.phase_id == project_phase.id)
            .join(SubType, Project.sub_type_id == SubType.id)
            .join(Type, Project.type_id == Type.id)
            .join(env_region, env_region.id == Project.region_id_env)
            .join(nrs_region, nrs_region.id == Project.region_id_flnro)
            .outerjoin(StaffWorkRole, Work.id == StaffWorkRole.work_id)
            .outerjoin(
                Staff,
                and_(
                    StaffWorkRole.staff_id == Staff.id,
                    StaffWorkRole.role_id.in_([3, 4, 5]),
                ),
            )
            .outerjoin(responsible_epd, responsible_epd.id == Work.responsible_epd_id)
            .outerjoin(work_lead, work_lead.id == Work.work_lead_id)
            .filter(
                daterange(
                    Work.start_date.cast(Date),
                    func.coalesce(
                        Work.decision_date.cast(Date),
                        Work.anticipated_decision_date.cast(Date),
                    ),
                    "[)",
                ).overlaps(daterange(report_start_date, self.end_date, "[)"))
            )
            .add_columns(
                Project.name.label("project_name"),
                Project.capital_investment.label("capital_investment"),
                WorkType.name.label("ea_type"),
                WorkType.report_title.label("ea_type_label"),
                WorkType.sort_order.label("ea_type_sort_order"),
                project_phase.name.label("project_phase"),
                EAAct.name.label("ea_act"),
                FederalInvolvement.name.label("iaac"),
                SubType.short_name.label("sub_type"),
                Type.short_name.label("type"),
                EAOTeam.name.label("eao_team"),
                env_region.name.label("env_region"),
                nrs_region.name.label("nrs_region"),
                Work.id.label("work_id"),
                responsible_epd.full_name.label("responsible_epd"),
                work_lead.full_name.label("work_lead"),
                Staff.first_name.label("staff_first_name"),
                Staff.last_name.label("staff_last_name"),
                StaffWorkRole.role_id.label("role_id"),
                Work.id.label("work_id"),
                func.concat(SubType.short_name, " (", Type.short_name, ")").label(
                    "sector(sub)"
                ),
            )
            .all()
        )

        work_ids = set((work.work_id for work in works))
        works = super()._format_data(works)
        events = (
            Event.query.filter(
                Event.work_id.in_(work_ids),
                Event.event_configuration_id.in_(self.start_event_configurations),
                func.coalesce(Event.actual_date, Event.anticipated_date) <= self.end_date,
            )
            .join(EventConfiguration, Event.event_configuration_id == EventConfiguration.id)
            .join(PhaseCode, EventConfiguration.phase_id == PhaseCode.id)
            .order_by(func.coalesce(Event.actual_date, Event.anticipated_date))
            .add_columns(
                Event.work_id.label("work_id"),
                func.coalesce(Event.actual_date, Event.anticipated_date).label(
                    "start_date"
                ),
                PhaseCode.name.label("event_phase"),
                PhaseCode.color.label("phase_color"),
            )
            .all()
        )
        events = {y: self._filter_work_events(y, events) for y in work_ids}
        results = defaultdict(list)
        for work_id, work_data in works.items():
            work = work_data[0]
            for index, month in enumerate(self.months[1:]):
                month_events = list(
                    filter(
                        lambda x: x.start_date.date() <= month, events[work_id])  # pylint:disable=cell-var-from-loop
                )
                month_events = sorted(month_events, key=lambda x: x.start_date)
                latest_event = month_events[-1]
                work.update(
                    {
                        self.month_labels[index]: latest_event.event_phase,
                        f"{self.month_labels[index]}_color": latest_event.phase_color,
                    }
                )
            work_data[0] = work
            results[work_id] = work_data
        return results

    def _filter_data(self, data_items):
        if self.filters:
            filter_search = (
                self.filters["filter_search"]
                if self.filters and self.filters["filter_search"]
                else {}
            )
            global_search = self.filters.get("global_search", None)
            project_name = filter_search.pop("project_name", None)
            filtered_result = []
            for item in data_items:
                if project_name and item[0]["project_name"] in project_name:
                    continue
                if any(
                    item[0][key] not in filter_search[key]
                    for key in list(filter_search)
                ):
                    continue
                if global_search and all(
                    global_search.lower() not in str(item[0][key]).lower()
                    for key in item[0].keys()
                ):
                    continue
                filtered_result.append(item)
            if filter_search or global_search or project_name:
                return filtered_result
        return data_items

    def _format_data(self, data):  # pylint: disable=too-many-locals
        response = []
        data = data.values()
        data = self._filter_data(data)
        for values in data:
            staffs = []
            work_data = values[0]
            work_data["cairt_lead"] = ""
            for value in values:
                role = value.pop("role_id")
                first_name = value.pop("staff_first_name")
                last_name = value.pop("staff_last_name")
                if role == 4:
                    work_data["cairt_lead"] = f"{last_name}, {first_name}"
                elif role in [3, 5]:
                    staffs.append({"first_name": first_name, "last_name": last_name})
            staffs = sorted(staffs, key=lambda x: x["last_name"])
            staffs = [f"{x['last_name']}, {x['first_name']}" for x in staffs]
            work_data["work_team_members"] = "; ".join(staffs)
            if work_data.get("capital_investment", None):
                work_data[
                    "capital_investment"
                ] = f"{work_data['capital_investment']:,.0f}"
            referral_timing_query = (
                db.session.query(PhaseCode)
                .join(
                    WorkPhase,
                    and_(
                        PhaseCode.id == WorkPhase.phase_id,
                        WorkPhase.work_id == work_data["work_id"],
                    ),
                )
                .join(WorkType, PhaseCode.work_type_id == WorkType.id)
                .join(EventConfiguration, and_(EventConfiguration.phase_id == PhaseCode.id,
                                               EventConfiguration.mandatory.is_(True)))
                .join(Event, EventConfiguration.id == Event.event_configuration_id)
                .filter(
                    and_(
                        WorkType.id == PhaseCode.work_type_id,
                        Event.work_id == work_data["work_id"],
                    )
                )
                .add_columns(EventConfiguration.id.label('event_configuration_id'))
                .group_by(PhaseCode.id, EventConfiguration.id)
                .order_by(PhaseCode.id.desc())
            )

            if referral_timing_query.count() > 1:
                referral_timing_obj = referral_timing_query.offset(1).first()
            else:
                referral_timing_obj = referral_timing_query.first()
            referral_timing = (
                Event.query.filter(Event.event_configuration_id == referral_timing_obj.event_configuration_id)
                .add_column(
                    func.coalesce(Event.actual_date, Event.anticipated_date).label(
                        "event_start_date"
                    )
                )
                .first()
            )
            work_data[
                "referral_timing"
            ] = f"{referral_timing.event_start_date:%B %d, %Y}"
            months = []
            referral_month_index = len(self.month_labels)
            referral_month = next(
                (
                    x
                    for x in self.months
                    if referral_timing.event_start_date.date() <= x
                ),
                None,
            )

            if referral_month:
                referral_month_index = self.months.index(referral_month)
                for month in self.month_labels[referral_month_index:]:
                    month_data = work_data.pop(month)
                    color = work_data.pop(f"{month}_color")
                    months.append({"label": month, "phase": "Referred", "color": color})
            for month in self.month_labels[:referral_month_index]:
                month_data = work_data.pop(month)
                color = work_data.pop(f"{month}_color")
                months.append({"label": month, "phase": month_data, "color": color})
            months = sorted(months, key=lambda x: self.month_labels.index(x['label']))
            work_data["months"] = months
            response.append(work_data)

        return response

    def generate_report(
        self, report_date, return_type
    ):  # pylint: disable=too-many-locals,too-many-statements
        """Generates a report and returns it"""
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if not data:
            return {}, None
        data = sorted(data, key=lambda k: (k['ea_type_sort_order'], k['project_name']))
        if return_type == "json" and data:
            return data, None
        formatted_data = defaultdict(list)
        for item in data:
            formatted_data[item["ea_type_label"]].append(item)
        pdf_stream = BytesIO()
        page_size = landscape(A3)
        width, height = page_size
        side_margin = 0.5 * inch
        available_table_width = width - (side_margin * 2)
        canv = Canvas(pdf_stream, pagesize=page_size)
        table_headers, table_cells, styles, cell_widths = self._get_report_meta_data(
            report_date, available_table_width
        )
        table_data = []
        row_index = 2
        stylesheet = getSampleStyleSheet()
        normal_style = stylesheet["Normal"]
        normal_style.fontSize = 6.5

        for ea_type_label, projects in formatted_data.items():
            normal_style.textColor = colors.white
            table_data.append(
                [
                    Paragraph(
                        f"<b>{ea_type_label.upper()}({len(projects)})</b>", normal_style
                    )
                ] + [""] * (len(table_headers[1]) - 1)
            )
            normal_style.textColor = colors.black
            styles.append(("SPAN", (0, row_index), (-1, row_index)))
            styles.append(("BACKGROUND", (0, row_index), (-1, row_index), colors.black))
            styles.append(("TEXTCOLOR", (0, row_index), (-1, row_index), colors.white))
            row_index += 1
            for project in projects:
                row = []
                # Referral timing is manually added at the end since it is
                # always the last cell
                if "referral_timing" in table_cells:
                    table_cells.remove("referral_timing")
                for cell in table_cells:
                    row.append(
                        Paragraph(project[cell] if project[cell] else "", normal_style)
                    )
                month_cell_start = len(table_cells)
                for month_index, month in enumerate(self.month_labels):
                    month_data = next(
                        x for x in project["months"] if x["label"] == month
                    )
                    row.append(Paragraph(month_data["phase"], normal_style))
                    cell_index = month_cell_start + month_index
                    color = month_data["color"][1:]
                    bg_color = [int(color[i:i + 2], 16) / 255 for i in (0, 2, 4)]
                    styles.append(
                        (
                            "BACKGROUND",
                            (cell_index, row_index),
                            (cell_index, row_index),
                            bg_color,
                        )
                    )
                if "referral_timing" not in self.excluded_items:
                    row.append(Paragraph(project["referral_timing"], normal_style))
                table_data.append(row)
                row_index += 1
        table = Table(table_headers + table_data, repeatRows=3, colWidths=cell_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 6.5),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, 1), "CENTER"),
                    ("ALIGN", (0, 2), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 2), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 0), (-1, 1), "Helvetica-Bold"),
                ] + styles
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
            normal_style.fontSize = 7.5
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

    def _add_months(self, start: datetime, months: int, set_to_last: bool = True) -> datetime:
        """Adds x months to given date"""
        year_offset, month = divmod(start.month + months, 13)
        if year_offset > 0:
            month += 1
        result = start.replace(
            year=start.year + year_offset,
            month=month,
            day=1
        )
        if set_to_last:
            result = result.replace(day=monthrange(start.year + year_offset, month)[1])
        return result
