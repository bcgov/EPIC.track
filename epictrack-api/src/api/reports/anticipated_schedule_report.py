"""Classes for specific report types."""
from datetime import datetime, timedelta

from flask import jsonify, current_app
from pytz import timezone
from sqlalchemy import and_, func, select, or_
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.orm import aliased

from api.models import db
from api.models.ea_act import EAAct
from api.models.event import Event
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.ministry import Ministry
from api.models.phase_code import PhaseCode
from api.models.project import Project
from api.models.proponent import Proponent
from api.models.region import Region
from api.models.special_field import EntityEnum, SpecialField
from api.models.staff import Staff
from api.models.substitution_acts import SubstitutionAct
from api.models.work import Work, WorkStateEnum
from api.models.work_phase import WorkPhase
from api.utils.constants import CANADA_TIMEZONE
from api.utils.enums import StalenessEnum

from .cdog_client import CDOGClient
from .report_factory import ReportFactory
from api.utils.util import process_data

# pylint:disable=not-callable


class EAAnticipatedScheduleReport(ReportFactory):
    """EA Anticipated Schedule Report Generator"""

    def __init__(self, filters, color_intensity):
        """Initialize the ReportFactory"""
        data_keys = [
            "work_id",
            "phase_name",
            "date_updated",
            "project_name",
            "proponent",
            "region",
            "location",
            "ea_act",
            "substitution_act",
            "project_description",
            "report_description",
            "anticipated_decision_date",
            "additional_info",
            "ministry_name",
            "referral_date",
            "eac_decision_by",
            "decision_by",
            "next_pecp_date",
            "next_pecp_title",
            "next_pecp_short_description",
            "milestone_type",
            "category_type",
            "event_name"
        ]
        group_by = "phase_name"
        template_name = "anticipated_schedule.docx"
        super().__init__(data_keys, group_by, template_name, filters, color_intensity)
        self.report_title = "Anticipated EA Referral Schedule"

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        current_app.logger.info(f"Fetching data for {self.report_title} report")
        start_date = report_date + timedelta(days=-7)
        report_date = report_date.astimezone(timezone('US/Pacific'))
        eac_decision_by = aliased(Staff)
        decision_by = aliased(Staff)

        next_pecp_query = self._get_next_pcp_query(start_date)
        referral_event_query = self._get_referral_event_query(start_date)
        latest_status_updates = self._get_latest_status_update_query()
        exclude_phase_names = []
        if self.filters and "exclude" in self.filters:
            exclude_phase_names = self.filters["exclude"]

        current_app.logger.debug(f"Executing query for {self.report_title} report")
        results_qry = (
            db.session.query(Work)
            .join(Event, Event.work_id == Work.id)
            .join(
                referral_event_query,
                and_(
                    Event.work_id == referral_event_query.c.work_id,
                    Event.anticipated_date == referral_event_query.c.min_anticipated_date,
                ),
            )
            .join(
                EventConfiguration,
                and_(
                    EventConfiguration.id == Event.event_configuration_id,
                ),
            )
            .join(WorkPhase, EventConfiguration.work_phase_id == WorkPhase.id)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .join(Project, Work.project_id == Project.id)
            # TODO: Switch to `JOIN` once proponents are imported again with special field entries created
            .outerjoin(SpecialField, and_(
                SpecialField.entity_id == Project.proponent_id,
                SpecialField.entity == EntityEnum.PROPONENT.value,
                SpecialField.time_range.contains(report_date),
                SpecialField.field_name == "name"
            ))
            # TODO: Remove this JOIN once proponents are imported again with special field entries created
            .join(Proponent, Proponent.id == Project.proponent_id)
            .join(Region, Region.id == Project.region_id_env)
            .join(EAAct, EAAct.id == Work.ea_act_id)
            .join(Ministry)
            .outerjoin(latest_status_updates, latest_status_updates.c.work_id == Work.id)
            .outerjoin(eac_decision_by, Work.eac_decision_by)
            .outerjoin(decision_by, Work.decision_by)
            .outerjoin(SubstitutionAct)
            .outerjoin(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == Work.id,
                ),
            )
            # FILTER ENTRIES MATCHING MIN DATE FOR NEXT PECP OR NO WORK ENGAGEMENTS (FOR AMENDMENTS)
            .filter(
              Work.is_active.is_(True),
              Event.anticipated_date.between(report_date - timedelta(days=7), report_date + timedelta(days=366)),
              or_(
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_type_id == 5, # EA Referral
                        EventConfiguration.event_category_id == 1 # Milestone,
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.event_type_id == 14 # Minister
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
                        EventConfiguration.event_type_id == 15 # CEAO
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
                        EventConfiguration.name != "Revised EAC Application Acceptance Decision (Day Zero)",
                        EventConfiguration.event_type_id == 15 # CEAO
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.name != "Delegation of Amendment Decision",
                        or_(
                          EventConfiguration.event_type_id == 15, # CEAO
                          EventConfiguration.event_type_id == 16 # ADM
                        )
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.name != "Delegation of SubStart Decision to Minister",
                        EventConfiguration.event_type_id == 15 # CEAO
                    )
                  ),
                  Event.event_configuration_id.in_(
                    db.session.query(EventConfiguration.id).filter(
                        EventConfiguration.event_category_id == 4, # Decision
                        EventConfiguration.name != "Delegation of Transfer Decision to Minister",
                        or_(
                          EventConfiguration.event_type_id == 15, # CEAO
                          EventConfiguration.event_type_id == 16 # ADM
                        )
                    )
                  )
              ),
              Work.is_deleted.is_(False),
              Work.work_state.in_([WorkStateEnum.IN_PROGRESS.value, WorkStateEnum.SUSPENDED.value]),
              # Filter out specific WorkPhase names
              ~WorkPhase.name.in_(exclude_phase_names)
            )
            .add_columns(
                Work.id.label("work_id"),
                PhaseCode.name.label("phase_name"),
                latest_status_updates.c.posted_date.label("date_updated"),
                Project.name.label("project_name"),
                func.coalesce(
                    SpecialField.field_value, Proponent.name
                ).label("proponent"),
                Region.name.label("region"),
                Project.address.label("location"),
                EAAct.name.label("ea_act"),
                SubstitutionAct.name.label("substitution_act"),
                Project.description.label("project_description"),
                Work.report_description.label("report_description"),
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"), INTERVAL)
                ).label("anticipated_decision_date"),
                latest_status_updates.c.description.label("additional_info"),
                Ministry.name.label("ministry_name"),
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"), INTERVAL)
                ).label("referral_date"),
                eac_decision_by.full_name.label("eac_decision_by"),
                decision_by.full_name.label("decision_by"),
                EventConfiguration.event_type_id.label("milestone_type"),
                EventConfiguration.event_category_id.label("category_type"),
                EventConfiguration.name.label("event_name"),
                func.coalesce(next_pecp_query.c.name, Event.name).label(
                    "next_pecp_title"
                ),
                func.coalesce(
                    next_pecp_query.c.actual_date,
                    next_pecp_query.c.anticipated_date,
                    Event.actual_date,
                ).label("next_pecp_date"),
                next_pecp_query.c.notes.label("next_pecp_short_description"),
            )
        )
        return results_qry.all()

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        current_app.logger.info(f"Generating {self.report_title} report for {report_date}")
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        data = self._update_staleness(data, report_date)

        if return_type == "json" or not data:
            return process_data(data, return_type)

        api_payload = {
            "report_data": data,
            "report_title": self.report_title,
            "report_date": report_date,
        }
        template = self.generate_template()
        # Calls out to the common services document generation service. Make sure your envs are set properly.
        try:
            report_client = CDOGClient()
            report = report_client.generate_document(self.report_title, jsonify(api_payload).json, template)
        except EnvironmentError as e:
            # Fall through to return empty response if CDOGClient fails, but log the error
            current_app.logger.error(f"Error initializing CDOGClient: {e}.")
            return {}, None

        current_app.logger.info(f"Generated {self.report_title} report for {report_date}")
        return report, f"{self.report_title}_{report_date:%Y_%m_%d}.pdf"

    def _get_next_pcp_query(self, start_date):
        """Create and return the subquery for next PCP event based on start date"""
        pecp_configuration_ids = (
            db.session.execute(
                select(EventConfiguration.id).where(
                    EventConfiguration.event_category_id == EventCategoryEnum.PCP.value,
                )
            )
            .scalars()
            .all()
        )
        next_pcp_min_date_query = (
            db.session.query(
                Event.work_id,
                func.min(
                    func.coalesce(Event.actual_date, Event.anticipated_date)
                ).label("min_pcp_date"),
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) >= start_date,
                Event.event_configuration_id.in_(pecp_configuration_ids),
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
                    func.coalesce(Event.actual_date, Event.anticipated_date) == next_pcp_min_date_query.c.min_pcp_date,
                ),
            )
            .filter(
                Event.event_configuration_id.in_(pecp_configuration_ids),
            )
            .subquery()
        )
        return next_pecp_query

    def _get_referral_event_query(self, start_date):
        """Create and return the subquery to find next referral event based on start date"""
        return (
            db.session.query(
                Event.work_id,
                func.min(Event.anticipated_date).label("min_anticipated_date"),
            )
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                ),
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) >= start_date,
            )
            .group_by(Event.work_id)
            .subquery()
        )

    def _update_staleness(self, data: dict, report_date: datetime) -> dict:
        """Calculate the staleness based on report date"""
        date = report_date.astimezone(CANADA_TIMEZONE)
        for _, work_type_data in data.items():
            for work in work_type_data:
                if work["date_updated"]:
                    diff = (date - work["date_updated"]).days
                    if diff > 10:
                        work["staleness"] = StalenessEnum.CRITICAL.value
                    elif diff > 5:
                        work["staleness"] = StalenessEnum.WARN.value
                    else:
                        work["staleness"] = StalenessEnum.GOOD.value
                else:
                    work["staleness"] = StalenessEnum.CRITICAL.value
        return data
