"""Classes for specific report types."""
from datetime import timedelta

from flask import jsonify
from sqlalchemy import and_, func, select
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
from api.models.staff import Staff
from api.models.substitution_acts import SubstitutionAct
from api.models.work import Work, WorkStateEnum
from api.models.work_phase import WorkPhase
from api.models.work_status import WorkStatus

from .cdog_client import CDOGClient
from .report_factory import ReportFactory


# pylint:disable=not-callable


class EAAnticipatedScheduleReport(ReportFactory):
    """EA Anticipated Schedule Report Generator"""

    def __init__(self, filters, color_intensity):
        """Initialize the ReportFactory"""
        data_keys = [
            "phase_name",
            "date_updated",
            "project_name",
            "proponent",
            "region",
            "location",
            "ea_act",
            "substitution_act",
            "project_description",
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
        ]
        group_by = "phase_name"
        template_name = "anticipated_schedule.docx"
        super().__init__(data_keys, group_by, template_name, filters, color_intensity)
        self.report_title = "Anticipated EA Referral Schedule"

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        start_date = report_date + timedelta(days=-7)
        eac_decision_by = aliased(Staff)
        decision_by = aliased(Staff)

        next_pecp_query = self._get_next_pcp_query(start_date)
        referral_event_query = self._get_referral_event_query(start_date)
        latest_status_updates = self._get_latest_status_update_query(start_date)

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
            .join(Proponent)
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
                Work.is_deleted.is_(False),
                Work.work_state.in_(
                    [WorkStateEnum.IN_PROGRESS.value, WorkStateEnum.SUSPENDED.value]
                ),
            )
            .add_columns(
                PhaseCode.name.label("phase_name"),
                latest_status_updates.c.posted_date.label("date_updated"),
                Project.name.label("project_name"),
                Proponent.name.label("proponent"),
                Region.name.label("region"),
                Project.address.label("location"),
                EAAct.name.label("ea_act"),
                SubstitutionAct.name.label("substitution_act"),
                Project.description.label("project_description"),
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
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" and data:
            return {"data": data}, None
        if not data:
            return {}, None
        api_payload = {
            "report_data": data,
            "report_title": self.report_title,
            "report_date": report_date,
        }
        template = self.generate_template()
        report_client = CDOGClient()
        report = report_client.generate_document(
            self.report_title, jsonify(api_payload).json, template
        )
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

    def _get_latest_status_update_query(self, start_date):
        """Create and return the subquery to find latest status update based on start date"""
        status_update_max_date_query = (
            db.session.query(
                WorkStatus.work_id,
                func.max(WorkStatus.posted_date).label("max_posted_date"),
            )
            .filter(WorkStatus.is_approved.is_(True),
                    WorkStatus.posted_date >= start_date)
            .group_by(WorkStatus.work_id)
            .subquery()
        )
        return (
            WorkStatus.query.filter(
                WorkStatus.is_approved.is_(True),
                WorkStatus.is_active.is_(True),
                WorkStatus.is_deleted.is_(False),
            )
            .join(
                status_update_max_date_query,
                and_(
                    WorkStatus.work_id == status_update_max_date_query.c.work_id,
                    WorkStatus.posted_date == status_update_max_date_query.c.max_posted_date,
                ),
            )
            .subquery()
        )
