"""Classes for specific report types."""

from calendar import monthrange
from collections import defaultdict
from datetime import datetime
from functools import partial
from io import BytesIO
from typing import IO, Dict, List, Tuple

from dateutil import rrule
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import NextPageTemplate, Paragraph, Table, TableStyle
from reportlab.platypus.doctemplate import BaseDocTemplate, PageTemplate
from reportlab.platypus.frames import Frame
from sqlalchemy import INTEGER, and_, func, or_
from sqlalchemy.dialects.postgresql import DATERANGE
from sqlalchemy.orm import aliased

from api.models import (
    EAAct, EAOTeam, Event, FederalInvolvement, PhaseCode, Project, Region, Staff, StaffWorkRole, SubType, Type, Work,
    WorkPhase, WorkType, db)
from api.models.event_configuration import EventConfiguration
from api.models.event_template import EventPositionEnum, EventTemplateVisibilityEnum
from api.models.event_type import EventTypeEnum
from api.models.phase_code import PhaseVisibilityEnum
from api.models.special_field import EntityEnum, SpecialField
from api.models.work import WorkStateEnum
from api.models.work_type import WorkTypeEnum
from api.models.role import RoleEnum
from api.services.work_phase import WorkPhaseService
from api.utils.color_utils import color_with_opacity
from api.utils.constants import CANADA_TIMEZONE

from .report_factory import ReportFactory


# pylint:disable=not-callable,cell-var-from-loop,too-many-locals,no-member

daterange = partial(func.daterange, type_=DATERANGE)


class EAResourceForeCastReport(ReportFactory):
    """EA Resource Forecast Report Generator"""

    def __init__(self, filters, color_intensity):
        """Initialize the ReportFactory"""
        data_keys = [
            "work_title",
            "capital_investment",
            "ea_type",
            "project_phase",
            "ea_act",
            "iaac",
            "sub_type",
            "type",
            "eao_team",
            "env_region",
            "nrs_region",
            "work_id",
            "ea_type_label",
            "sector(sub)",
            "ea_type_sort_order",
            # "responsible_epd",
            # "cairt_lead",
            # "work_lead",
            "fte_positions_construction",
            "fte_positions_operation",
            "work_type_id",
        ]
        group_by = "work_id"
        super().__init__(data_keys, group_by, None, filters, color_intensity)
        self.excluded_items = []
        if self.filters and "exclude" in self.filters:
            self.excluded_items = self.filters["exclude"]
        self.report_title = "EAO Resource Forecast"
        self.months = []
        self.month_labels = []
        self.report_cells = {
            "[PROJECT BACKGROUND]": [
                {"data_key": "work_title", "label": "WORK TITLE", "width": 0.050},
                {
                    "data_key": "capital_investment",
                    "label": "EST. CAP. INVESTMENT",
                    "width": 0.071,
                },
                {
                    "data_key": "fte_positions_construction",
                    "label": "Est. FTEs in constructions",
                    "width": 0.075,
                },
                {
                    "data_key": "fte_positions_operation",
                    "label": "Est. FTEs in operations",
                    "width": 0.070,
                },
                {
                    "data_key": "project_phase",
                    "label": "PROJECT PHASE",
                    "width": 0.057,
                },
                {"data_key": "ea_act", "label": "EA ACT", "width": 0.03},
                {"data_key": "iaac", "label": "IAAC", "width": 0.0355},
                {"data_key": "sector(sub)", "label": "TYPE (SUB)", "width": 0.038},
                {"data_key": "env_region", "label": "MOE REGION", "width": 0.041},
                {"data_key": "nrs_region", "label": "NRS REGION", "width": 0.041},
            ],
            "[EAO RESOURCING]": [
                {"data_key": "responsible_epd", "label": "EPD LEAD", "width": 0.037},
                {"data_key": "cairt_lead", "label": "FN CAIRT LEAD", "width": 0.0486},
                {"data_key": "eao_team", "label": "TEAM", "width": 0.028},
                {"data_key": "work_lead", "label": "PROJECT LEAD", "width": 0.045},
                {
                    "data_key": "work_team_members",
                    "label": "WORK TEAM MEMBERS",
                    "width": 0.072,
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

    def _filter_work_events(self, work_id: int, events: List[Event]) -> List[Event]:
        """Filter the events based on given work id"""
        return [event for event in events if event["work_id"] == work_id]

    def _get_pdf_output_layout(self, report_date: datetime, available_width: float):
        """Returns the pdf output layout"""
        section_headings = []
        cell_headings = []
        styles = []
        cell_keys = []
        cell_widths = []
        cell_index = 0
        for section_heading, cells in self.report_cells.items():
            filtered_cells = []
            if section_heading == "QUARTERS":
                (
                    s_headings,
                    c_headings,
                    c_widths,
                    s_styles,
                ) = self._get_quarter_section_meta_data(
                    report_date, cell_index, available_width
                )
                section_headings.extend(s_headings)
                cell_headings.extend(c_headings)
                cell_widths.extend(c_widths)
                styles.extend(s_styles)
                cell_index += 3
            else:
                (
                    s_headings,
                    s_styles,
                    filtered_cells,
                ) = self._get_other_section_meta_data(
                    section_heading, cells, cell_index
                )
                section_headings.extend(s_headings)
                styles.extend(s_styles)
            for cell in filtered_cells:
                cell_headings.append(cell["label"])
                cell_keys.append(cell["data_key"])
                cell_widths.append(available_width * cell["width"])
            cell_index += len(filtered_cells)
        headers = [section_headings, cell_headings]
        return headers, cell_keys, styles, cell_widths

    def _fetch_data(self, report_date: datetime):
        """Find and return works that are started before end date and did not end before report date"""
        env_region = aliased(Region)
        nrs_region = aliased(Region)
        less_than_end_date_query = self._get_less_than_end_date_query()
        greater_than_report_date_query = self._get_greater_than_report_date_query(
            report_date
        )

        works = (
            Project.query.filter(
                Project.is_project_closed.is_(False),
                Project.is_deleted.is_(False),
                Project.is_active.is_(True),
            )
            .join(
                Work,
                and_(
                    Work.project_id == Project.id,
                    Work.work_state.in_(
                        [
                            WorkStateEnum.IN_PROGRESS.value,
                            WorkStateEnum.SUSPENDED.value,
                        ]
                    ),
                    Work.is_active.is_(True),
                    Work.is_deleted.is_(False),
                ),
            )
            .join(WorkPhase, WorkPhase.id == Work.current_work_phase_id)
            .join(PhaseCode, PhaseCode.id == WorkPhase.phase_id)
            .join(WorkType, Work.work_type_id == WorkType.id)
            .join(EAAct, Work.ea_act_id == EAAct.id)
            .outerjoin(EAOTeam, Work.eao_team_id == EAOTeam.id)
            .join(
                FederalInvolvement, Work.federal_involvement_id == FederalInvolvement.id
            )
            .join(SubType, Project.sub_type_id == SubType.id)
            .join(Type, Project.type_id == Type.id)
            .join(env_region, env_region.id == Project.region_id_env)
            .join(nrs_region, nrs_region.id == Project.region_id_flnro)
            .join(
                less_than_end_date_query, Work.id == less_than_end_date_query.c.work_id
            )
            .join(
                greater_than_report_date_query,
                Work.id == greater_than_report_date_query.c.work_id,
            )
            .add_columns(
                Work.title.label("work_title"),
                Project.capital_investment.label("capital_investment"),
                WorkType.name.label("ea_type"),
                WorkType.report_title.label("ea_type_label"),
                WorkType.sort_order.label("ea_type_sort_order"),
                WorkPhase.name.label("project_phase"),
                EAAct.name.label("ea_act"),
                FederalInvolvement.name.label("iaac"),
                SubType.short_name.label("sub_type"),
                Type.short_name.label("type"),
                EAOTeam.name.label("eao_team"),
                env_region.name.label("env_region"),
                nrs_region.name.label("nrs_region"),
                Work.id.label("work_id"),
                func.concat(SubType.short_name, " (", Type.short_name, ")").label(
                    "sector(sub)"
                ),
                Project.fte_positions_operation.label("fte_positions_operation"),
                Project.fte_positions_construction.label("fte_positions_construction"),
                WorkType.id.label("work_type_id"),
            )
            .all()
        )

        return works

    def _get_less_than_end_date_query(self):
        """Returns subquery which returns work_ids which matches the less than end_date condition"""
        return (
            db.session.query(Event.work_id)
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_position == EventPositionEnum.START.value,
                ),
            )
            .join(
                WorkPhase,
                and_(
                    WorkPhase.id == EventConfiguration.work_phase_id,
                    WorkPhase.is_active.is_(True),
                    WorkPhase.sort_order
                    == 1,  # indicate the work phase is the first one
                    WorkPhase.is_deleted.is_(False),
                ),
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date)
                <= self.end_date
            )
            .subquery()
        )

    def _get_greater_than_report_date_query(self, report_date):
        """Returns work_ids matches event actual >= report date"""
        end_work_phase_query = (
            db.session.query(
                func.max(WorkPhase.id).label("end_phase_id"),
            )
            .filter(WorkPhase.is_active.is_(True), WorkPhase.is_deleted.is_(False))
            .group_by(WorkPhase.work_id)
            .subquery()
        )
        return (
            db.session.query(Event.work_id)
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_position == EventPositionEnum.END.value,
                ),
            )
            .join(
                end_work_phase_query,
                end_work_phase_query.c.end_phase_id == EventConfiguration.work_phase_id,
            )
            .filter(or_(Event.actual_date.is_(None), Event.actual_date >= report_date))
            .subquery()
        )

    def _filter_data(self, data_items):
        """Filter the data based on applied filters"""
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

    def _format_capital_investment(self, work_data):
        """Format the capital investment"""
        if work_data.get("capital_investment", None):
            work_data["capital_investment"] = (
                f"{work_data['capital_investment']:,.0f}"
            )
        return work_data

    def _format_ea_type(self, work_data):
        """Format the capital investment"""
        if work_data.get("project_phase", None) == 'Pre-EA (EAC Assessment)':
            work_data["ea_type"] = 'Pre-EA'
        return work_data

    def _format_data(self, data):
        """Format the data into required format"""
        response = []
        data = data.values()
        data = self._filter_data(data)
        for values in data:
            work_data = values[0]
            staffs, cairt_lead, responsible_epd, work_lead = self._get_work_team_members(work_data["work_id"])
            work_data["cairt_lead"] = cairt_lead
            work_data["responsible_epd"] = responsible_epd
            work_data["work_lead"] = work_lead
            work_data["work_team_members"] = "; ".join(staffs)
            work_data = self._format_capital_investment(work_data)
            work_data = self._handle_months(work_data)
            work_data = self._format_ea_type(work_data)
            response.append(work_data)
        return response

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        self._set_month_labels(report_date)
        works = self._fetch_data(report_date)
        work_ids = set((work.work_id for work in works))
        works = super()._format_data(works)
        events = self._get_events(work_ids)
        start_events = self._filter_start_events(events)
        start_events = {y: self._filter_work_events(y, start_events) for y in work_ids}
        work_data = self._update_month_labels(works, start_events)
        special_histories = self._fetch_works_special_history(work_ids, report_date)
        work_data = self._update_special_history(work_data, special_histories)
        data = self._format_data(work_data)
        if not data:
            return {}, None
        second_phases = self._fetch_second_phases(events, work_ids)
        data = self._sort_data(data, second_phases)
        if return_type == "json" and data:
            return data, None
        formatted_data = defaultdict(list)
        for item in data:
            formatted_data[item["ea_type_label"]].append(item)
        pdf_stream = self._generate_pdf(formatted_data, report_date)
        return pdf_stream.getvalue(), f"{self.report_title}_{report_date:%Y_%m_%d}.pdf"

    def _update_month_labels(self, works, start_events):
        """Update month labels in the work result"""
        results = defaultdict(list)
        for work_id, work_data in works.items():
            work = work_data[0]
            for index, month in enumerate(self.months[1:]):
                month_events = list(
                    filter(
                        lambda x: x["start_date"].date() <= month,
                        start_events[work_id],
                    )
                )
                if month_events:
                    month_events = sorted(month_events, key=lambda x: x["start_date"])
                    latest_event = month_events[-1]
                    work.update(
                        {
                            self.month_labels[index]: latest_event["event_phase"],
                            f"{self.month_labels[index]}_color": color_with_opacity(
                                latest_event["phase_color"], self.color_intensity
                            ),
                        }
                    )
                else:
                    work.update(
                        {
                            self.month_labels[index]: "",
                            f"{self.month_labels[index]}_color": "#FFFFFF",
                        }
                    )
            work_data[0] = work
            results[work_id] = work_data
        return results

    def _filter_start_events(self, events: [Event]) -> [Event]:
        """Filter the start events of each phase per work"""
        start_events = [
            {
                "work_id": event.work_id,
                "start_date": (
                    event.actual_date if event.actual_date else event.anticipated_date
                ),
                "event_phase": event.event_configuration.work_phase.name,
                "phase_color": event.event_configuration.work_phase.phase.color,
            }
            for event in events
            if event.event_configuration.event_position.value
            == EventPositionEnum.START.value
        ]
        return start_events

    def _add_months(
        self, start: datetime, months: int, set_to_last: bool = True
    ) -> datetime:
        """Adds x months to given date"""
        year_offset, month = divmod(start.month + months, 13)
        if year_offset > 0:
            month += 1
        result = start.replace(year=start.year + year_offset, month=month, day=1)
        if set_to_last:
            result = result.replace(day=monthrange(start.year + year_offset, month)[1])
        return result

    def _set_month_labels(self, report_date: datetime) -> None:
        """Calculate and set month related attributes to the self"""
        report_start_date = report_date.date().replace(day=1)
        first_month = self._add_months(report_start_date, 1, False)
        self.end_date = self._add_months(first_month, 5)

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

    def _sort_data(self, data, second_phases) -> List:
        """Sort the data based on priority of work types"""
        assessments = self._sort_data_by_work_type(
            data, WorkTypeEnum.ASSESSMENT.value, second_phases
        )
        exemption_orders = self._sort_data_by_work_type(
            data, WorkTypeEnum.EXEMPTION_ORDER.value
        )
        amendments = self._sort_data_by_work_type(
            data, WorkTypeEnum.AMENDMENT.value, second_phases
        )
        order_transfers = self._sort_data_by_work_type(
            data, WorkTypeEnum.EAC_ORDER_TRANSFER.value
        )
        minister_designations = self._sort_data_by_work_type(
            data, WorkTypeEnum.MINISTERS_DESIGNATION.value
        )
        ceao_designations = self._sort_data_by_work_type(
            data, WorkTypeEnum.CEAOS_DESIGNATION.value
        )
        project_notifications = self._sort_data_by_work_type(
            data, WorkTypeEnum.PROJECT_NOTIFICATION.value
        )
        extensions = self._sort_data_by_work_type(
            data, WorkTypeEnum.EAC_EXTENSION.value
        )
        substantial_start_decisions = self._sort_data_by_work_type(
            data, WorkTypeEnum.SUBSTANTIAL_START_DECISION.value
        )
        order_suspensions = self._sort_data_by_work_type(
            data, WorkTypeEnum.EAC_ORDER_SUSPENSION.value
        )
        order_cancellations = self._sort_data_by_work_type(
            data, WorkTypeEnum.EAC_ORDER_CANCELLATION.value
        )
        others = self._sort_data_by_work_type(data, WorkTypeEnum.OTHER.value)

        sorted_data = (
            assessments
            + exemption_orders
            + amendments
            + order_transfers
            + minister_designations
        )
        sorted_data += (
            ceao_designations
            + project_notifications
            + extensions
            + substantial_start_decisions
        )
        sorted_data += order_suspensions + order_cancellations + others
        return sorted_data

    def _fetch_second_phases(self, events, work_ids) -> List[WorkPhase]:
        """Fetch the second work phases for given work ids"""
        work_phases = WorkPhaseService.find_work_phases_by_work_ids(work_ids)
        second_work_phases = [
            {
                "work_phase": event.event_configuration.work_phase,
                "actual_date": event.actual_date,
                "anticipated_date": event.anticipated_date,
            }
            for event in events
            if self._is_second_work_phase(event, work_phases[0])
            and event.event_configuration.event_position.value
            == EventPositionEnum.START.value
        ]
        return second_work_phases

    def _is_second_work_phase(self, event: Event, work_phases):
        """Return true if the given event belongs to the second phase"""
        w_phases = work_phases[event.work_id]
        return event.event_configuration.work_phase_id == w_phases[1].id

    def _find_work_second_phase(self, second_phases, work_id) -> WorkPhase:
        """Find the second work phase for given work id"""
        second_phase = next(
            (x for x in second_phases if x["work_phase"].work_id == work_id), None
        )
        return second_phase

    def _sort_data_by_work_type(self, data, work_type_id, second_phases=None) -> List:
        """Filter data based on work type and do natural sort"""
        if work_type_id == WorkTypeEnum.ASSESSMENT.value:
            temp_data = [x for x in data if x["work_type_id"] == work_type_id]
            high_priority = [
                x
                for x in temp_data
                if self._find_work_second_phase(second_phases, x["work_id"])[
                    "actual_date"
                ]
            ]
            high_priority = sorted(high_priority, key=lambda k: k["work_title"])
            rest = [
                x
                for x in temp_data
                if self._find_work_second_phase(second_phases, x["work_id"])[
                    "actual_date"
                ]
                is None
            ]
            rest = sorted(rest, key=lambda k: k["work_title"])
            sorted_data = high_priority + rest
        else:
            sorted_data = [x for x in data if x["work_type_id"] == work_type_id]
            sorted_data = sorted(sorted_data, key=lambda k: k["work_title"])
        return sorted_data

    def _get_events(self, work_ids: [int]) -> List[Event]:
        """Returns the start event of each of the work phases for the works"""
        return (
            Event.query.filter(
                Event.work_id.in_(work_ids),
            )
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.visibility
                    == EventTemplateVisibilityEnum.MANDATORY.value,
                    EventConfiguration.is_active.is_(True),
                    EventConfiguration.is_deleted.is_(False),
                ),
            )
            .join(
                WorkPhase,
                and_(
                    EventConfiguration.work_phase_id == WorkPhase.id,
                    WorkPhase.is_active.is_(True),
                    WorkPhase.is_deleted.is_(False),
                ),
            )
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .order_by(func.coalesce(Event.actual_date, Event.anticipated_date))
            .all()
        )

    def _prepare_fetch_results(self, works, events) -> dict:
        """Matches events with corresponding works and returns formatted data"""
        results = defaultdict(list)
        for work_id, work_data in works.items():
            work = work_data[0]
            for index, month in enumerate(self.months[1:]):
                month_events = list(
                    filter(
                        lambda x: x.start_date.date() <= month,
                        events[work_id],
                    )
                )
                if month_events:
                    month_events = sorted(month_events, key=lambda x: x.start_date)
                    latest_event = month_events[-1]
                    work.update(
                        {
                            self.month_labels[index]: latest_event.event_phase,
                            f"{self.month_labels[index]}_color": latest_event.phase_color,
                        }
                    )
                else:
                    work.update(
                        {
                            self.month_labels[index]: "",
                            f"{self.month_labels[index]}_color": "#FFFFFF",
                        }
                    )
            work_data[0] = work
            results[work_id] = work_data
        return results

    def _get_referral_timing(self, work_id) -> Event:
        """Find the referral event for given work id"""
        referral_date = (
            db.session.query(func.coalesce(Event.actual_date, Event.anticipated_date))
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                    EventConfiguration.visibility
                    == EventTemplateVisibilityEnum.MANDATORY.value,
                ),
            )
            .join(
                WorkPhase,
                and_(
                    EventConfiguration.work_phase_id == WorkPhase.id,
                    WorkPhase.is_active.is_(True),
                    WorkPhase.is_deleted.is_(False),
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                    WorkPhase.is_completed.is_(False),
                    WorkPhase.work_id == work_id,
                ),
            )
            .order_by(WorkPhase.sort_order.desc())
            .limit(1)
            .scalar()
        )
        return referral_date

    def _get_work_team_members(self, work_id) -> Tuple[List[str], str]:
        """Fetch and return team members by work id"""
        staffs = []
        cairt_lead = ""
        responsible_epd = ""
        work_lead = ""
        work_team_members = (
            db.session.query(StaffWorkRole)
            .filter(StaffWorkRole.work_id == work_id)
            .filter(StaffWorkRole.is_active.is_(True))
            .join(Staff, Staff.id == StaffWorkRole.staff_id)
            .add_columns(
                Staff.first_name.label("first_name"),
                Staff.last_name.label("last_name"),
                Staff.full_name.label("full_name"),
                StaffWorkRole.role_id.label("role_id"),
            )
        )
        for work_team_member in work_team_members:
            first_name = work_team_member.first_name
            last_name = work_team_member.last_name
            if work_team_member.role_id == RoleEnum.FN_CAIRT.value:
                cairt_lead = work_team_member.full_name
            if work_team_member.role_id == RoleEnum.TEAM_LEAD.value:
                work_lead = work_team_member.full_name
            if work_team_member.role_id == RoleEnum.RESPONSIBLE_EPD.value:
                responsible_epd = work_team_member.full_name
            elif work_team_member.role_id in [RoleEnum.OFFICER_ANALYST.value, RoleEnum.OTHER.value]:
                staffs.append({"first_name": first_name, "last_name": last_name})
        staffs = sorted(staffs, key=lambda x: x["last_name"])
        staffs = [f"{x['last_name']}, {x['first_name']}" for x in staffs]
        return staffs, cairt_lead, responsible_epd, work_lead

    def _get_styles(self) -> Tuple[dict, dict]:
        """Returns basic styles needed for the PDF report."""
        stylesheet = getSampleStyleSheet()
        normal_style = stylesheet["Normal"]
        normal_style.fontSize = 6.0
        body_text_style = stylesheet["BodyText"]
        body_text_style.fontSize = 6.0
        body_text_style.alignment = TA_LEFT
        body_text_style.wordWrap = None
        body_text_style.spaceShrinkage = 0.05
        body_text_style.splitLongWords = 0
        body_text_style.hyphenationLang = ""
        body_text_style.embeddedHyphenation = 1
        return normal_style, body_text_style

    def _get_table_data(self, data, column_count, cells):
        """Returns the tabulated data and relevant style information."""
        table_data = []
        styles = []
        row_index = 2
        normal_style, body_text_style = self._get_styles()
        for ea_type_label, projects in data.items():
            normal_style.textColor = colors.white
            table_data.append(
                [
                    Paragraph(
                        f"<b>{ea_type_label.upper()}({len(projects)})</b>", normal_style
                    )
                ]
                + [""] * (column_count - 1)
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
                if "referral_timing" in cells:
                    cells.remove("referral_timing")
                for cell in cells:
                    row.append(
                        Paragraph(
                            str(project[cell]) if project[cell] else "", body_text_style
                        )
                    )
                month_cell_start = len(cells)
                for month_index, month in enumerate(self.month_labels):
                    month_data = next(
                        x for x in project["months"] if x["label"] == month
                    )
                    row.append(Paragraph(month_data["phase"], body_text_style))
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
                if "referral_timing" not in self.excluded_items:
                    row.append(Paragraph(project["referral_timing"], body_text_style))
                table_data.append(row)
                row_index += 1
        return table_data, styles

    def _handle_months(self, work_data) -> dict:
        """Update the work data to include relevant month information."""
        referral_date = self._get_referral_timing(work_data["work_id"])
        work_data["referral_timing"] = f"{referral_date:%B %d, %Y}"
        months = []
        referral_month_index = len(self.month_labels)
        referral_month = next(
            (x for x in self.months if referral_date.date() <= x),
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
        months = sorted(months, key=lambda x: self.month_labels.index(x["label"]))
        work_data["months"] = months
        return work_data

    def _generate_pdf(self, data, report_date) -> IO:
        pdf_stream = BytesIO()
        doc = BaseDocTemplate(pdf_stream, pagesize=landscape(A3))
        doc.page_width = doc.width + doc.leftMargin * 2
        doc.page_height = doc.height + doc.bottomMargin * 2
        page_table_frame = Frame(
            doc.leftMargin,
            doc.bottomMargin - inch * 0.5,
            doc.width,
            doc.height + inch * 0.5,
            id="large_table",
        )
        page_template = PageTemplate(
            id="LaterPages",
            frames=[page_table_frame],
            onPage=self._on_every_page(report_date),
        )
        doc.addPageTemplates(page_template)
        story = [NextPageTemplate(["*", "LaterPages"])]
        table_headers, table_cells, styles, cell_widths = self._get_pdf_output_layout(
            report_date, doc.width
        )

        data, table_styles = self._get_table_data(
            data, len(table_headers[1]), table_cells
        )
        table = Table(table_headers + data, repeatRows=2, colWidths=cell_widths)
        table.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.25, colors.black),
                    ("INNERGRID", (0, 0), (-1, -1), 0.25, colors.black),
                    ("FONTSIZE", (0, 0), (-1, -1), 6.0),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                    ("ALIGN", (0, 0), (-1, 1), "CENTER"),
                    ("ALIGN", (0, 2), (-1, -1), "LEFT"),
                    ("FONTNAME", (0, 2), (-1, -1), "Helvetica"),
                    ("FONTNAME", (0, 0), (-1, 1), "Helvetica-Bold"),
                ]
                + styles
                + table_styles
            )
        )
        story.append(table)
        doc.build(story)
        pdf_stream.seek(0)
        return pdf_stream

    def _on_every_page(self, report_date: datetime):
        """Adds default information for each page."""

        def add_default_info(canvas, doc):
            """Adds default information to the page."""
            normal_style, _ = self._get_styles()
            canvas.saveState()
            heading = Paragraph(
                "<b>Document Title: EAO Resource Forecast</b>", normal_style
            )
            heading.wrap(doc.width, inch * 0.5)
            heading.drawOn(canvas, doc.leftMargin, doc.height + inch * 1.5)
            # Draw subheading.
            subheading = Paragraph(f"Month of {report_date:%B %Y}", normal_style)
            subheading.wrap(doc.width, inch * 0.5)
            subheading.drawOn(canvas, doc.leftMargin, doc.height + inch * 1.25)

            subheading = Paragraph("EAO Operations Division ADMO", normal_style)
            subheading.wrap(doc.width, inch * 0.5)
            subheading.drawOn(canvas, doc.leftMargin, doc.height + inch * 1)

            normal_style.fontSize = 7.5
            normal_style.alignment = TA_CENTER
            subheading = Paragraph(
                "<b>PREPARED FOR INTERNAL DISCUSSION PURPOSES</b>", normal_style
            )
            subheading.wrap(doc.width, inch * 0.5)
            subheading.drawOn(canvas, doc.leftMargin, doc.height + inch * 1)
            canvas.restoreState()

        return add_default_info

    def _get_quarter_section_meta_data(
        self, report_date: datetime, cell_index: int, available_width: int
    ):
        report_start_date = report_date.date().replace(day=1)
        report_start_date = self._add_months(report_start_date, 1, False)
        quarter1, remaining = divmod(report_start_date.month, 3)
        if remaining > 0:
            quarter1 += 1
        if quarter1 == 4:
            quarter2 = 1
        else:
            quarter2 = quarter1 + 1
        styles = []
        cell_widths = []
        section_headings = [
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
        cell_headings = self.month_labels
        cell_widths.extend([0.051 * available_width] * 3)
        cell_widths.extend([0.058 * available_width])
        return section_headings, cell_headings, cell_widths, styles

    def _get_other_section_meta_data(self, section_heading, cells, cell_index):
        section_headings = []
        styles = []
        filtered_cells = [x for x in cells if x["data_key"] not in self.excluded_items]
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
        return section_headings, styles, filtered_cells

    def _fetch_works_special_history(
        self, work_ids: List[int], report_date: datetime
    ) -> List:
        """Fetch special history entries for given work ids and date"""
        date = report_date.astimezone(CANADA_TIMEZONE)
        special_histories = (
            db.session.query(SpecialField)
            .filter(
                SpecialField.entity == EntityEnum.WORK.value,
                SpecialField.entity_id.in_(work_ids),
                SpecialField.time_range.contains(date),
                SpecialField.field_name.in_(["responsible_epd_id", "work_lead_id"]),
            )
            .join(Staff, Staff.id == func.cast(SpecialField.field_value, INTEGER))
            .add_column(Staff.full_name.label("staff_name"))
            .all()
        )
        return special_histories

    def _update_special_history(
        self, work_data: Dict[str, List], special_histories: List
    ) -> List[dict]:
        """Update work data with corresponding special history value(s)"""
        for work_id, work in work_data.items():
            work_special_histories = {
                history.SpecialField.field_name.replace("_id", ""): history.staff_name
                for history in special_histories
                if history.SpecialField.entity_id == work_id
            }
            work[0].update(work_special_histories)
        return work_data
