"""Classes for specific report types."""
from calendar import monthrange
from datetime import datetime
from functools import partial

from dateutil import rrule
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
        ]
        group_by = "project_name"
        template_name = "anticipated_schedule.docx"
        super().__init__(data_keys, group_by, template_name, filters)
        self.report_title = "Anticipated EA Referral Schedule"
        start_event_milestones = (
            db.session.query(
                func.min(Milestone.id).label("milestone_id"), Milestone.phase_id
            )
            .group_by(Milestone.phase_id)
            .all()
        )
        self.start_event_milestones = [x.milestone_id for x in start_event_milestones]
        self.month_labels = []

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

    def _fetch_data(self, report_date: datetime):  # pylint: disable=too-many-locals
        """Fetches the relevant data for EA Resource Forecast Report"""
        report_date = report_date.date()
        year = report_date.year
        year_offset, end_month = divmod(report_date.month + 5, 13)
        if year_offset > 0:
            end_month += 1
        start_date = report_date.replace(day=1)
        end_date = report_date.replace(
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
                Event.start_date <= report_date,
                Event.milestone_id.in_(self.start_event_milestones),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        first_month_query = self._get_latest_event_subquery(report_date)
        first_month_aliases = {
            "phase": aliased(PhaseCode),
            "event": aliased(Event),
            "milestone": aliased(Milestone),
            "label": f"{report_date:%B}",
        }
        year_offset, second_month = divmod(report_date.month + 1, 13)
        second_date = report_date.replace(
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
        year_offset, third_month = divmod(report_date.month + 2, 13)
        third_date = report_date.replace(
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
        year_offset, remaining_start = divmod(report_date.month + 3, 13)
        remaining_start_date = report_date.replace(
            year=year + year_offset,
            month=remaining_start,
            day=1,
        )
        remaining_month_query = self._get_latest_event_subquery(end_date)
        month_labels = []
        for date in rrule.rrule(
            rrule.MONTHLY, dtstart=remaining_start_date, until=end_date
        ):
            month_label = f"{date:%b}"
            if date.month == 12:
                month_label += f"{date:%Y}"
            month_labels.append(month_label)
        if end_date.year > report_date.year:
            month_labels[-1] += f"{end_date:%Y}"
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
            Project.query.filter(Project.is_project_closed.is_(False), Project.is_deleted.is_(False))
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
                    Event.milestone_id.in_(self.start_event_milestones)
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
                ).overlaps(daterange(start_date, end_date, "[)"))
            )
            .add_columns(
                Project.name.label("project_name"),
                Project.capital_investment.label("capital_investment"),
                WorkType.name.label("ea_type"),
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

    def _format_data(self, data):
        result = super()._format_data(data)
        response = []
        for _, values in result.items():
            staffs = []
            project_data = values[0]
            for value in values:
                role = value.pop("role_id")
                first_name = value.pop("staff_first_name")
                last_name = value.pop("staff_last_name")
                if role == 3:
                    project_data["analyst"] = f"{last_name}, {first_name}"
                elif role == 4:
                    project_data["fn_cairt_lead"] = f"{last_name}, {first_name}"
                elif role in [5]:
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
            referral_timing_query = (
                db.session.query(PhaseCode)
                .join(WorkType)
                .join(Milestone)
                .join(Event)
                .filter(
                    and_(
                        WorkType.id == PhaseCode.work_type_id,
                        WorkType.name == project_data["ea_type"],
                    )
                )
                .group_by(PhaseCode.id)
                .order_by(PhaseCode.id.desc())
            )
            print(referral_timing_query.statement.compile(compile_kwargs={"literal_binds": True}))
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
            ] = f"{referral_timing.anticipated_start_date:%B, %Y}"
            response.append(project_data)
        return response

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" or not data:
            return {"data": data}, None
        return {}, None
