"""Classes for specific report types."""
from datetime import timedelta

from flask import jsonify
from sqlalchemy import and_, func, or_, select
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.orm import aliased

from api.models import db
from api.models.ea_act import EAAct
from api.models.event import Event
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.ministry import Ministry
from api.models.phase_code import PhaseCode
from api.models.project import Project
from api.models.proponent import Proponent
from api.models.region import Region
from api.models.staff import Staff
from api.models.substitution_acts import SubstitutionAct
from api.models.work import Work
from api.models.work_phase import WorkPhase
from api.models.work_status import WorkStatus

from .cdog_client import CDOGClient
from .report_factory import ReportFactory


# pylint:disable=not-callable


class EAAnticipatedScheduleReport(ReportFactory):
    """EA Anticipated Schedule Report Generator"""

    def __init__(self, filters):
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
        super().__init__(data_keys, group_by, template_name, filters)
        self.report_title = "Anticipated EA Referral Schedule"

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        start_date = report_date + timedelta(days=-7)
        eac_decision_by = aliased(Staff)
        decision_by = aliased(Staff)
        pecp_event = aliased(Event)

        pecp_configuration_ids = db.session.execute(
            select(EventConfiguration.id)
            .where(
                EventConfiguration.event_category_id == EventCategoryEnum.PCP.value,
            )
        ).scalars().all()

        decision_configuration_ids = db.session.execute(
            select(EventConfiguration.id)
            .where(
                EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
            )
        ).scalars().all()

        next_decision_event_query = (
            db.session.query(
                Event.work_id,
                func.min(Event.anticipated_date).label("min_anticipated_date"),
            )
            .filter(
                Event.anticipated_date >= start_date,
                Event.event_configuration_id.in_(decision_configuration_ids),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        next_pecp_query = (
            db.session.query(
                Event.work_id,
                func.min(Event.actual_date).label("min_start_date"),
            )
            .filter(
                Event.actual_date >= start_date,
                Event.event_configuration_id.in_(pecp_configuration_ids),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        status_update_max_date_query = (
            db.session.query(
                WorkStatus.work_id,
                func.max(WorkStatus.posted_date).label("max_posted_date"),
            )
            .group_by(WorkStatus.work_id)
            .subquery()
        )

        latest_status_updates = WorkStatus.query.filter(
            WorkStatus.posted_date >= start_date
        ).join(
            status_update_max_date_query,
            and_(
                WorkStatus.work_id == status_update_max_date_query.c.work_id,
                WorkStatus.posted_date == status_update_max_date_query.c.max_posted_date,
            ),
        )

        results_qry = (
            latest_status_updates.join(Work)
            .join(Event)
            .join(
                next_decision_event_query,
                and_(
                    Event.work_id == next_decision_event_query.c.work_id,
                    Event.anticipated_date == next_decision_event_query.c.min_anticipated_date,
                ),
            )
            .join(
                EventConfiguration,
                and_(
                    EventConfiguration.id == Event.event_configuration_id,
                    EventConfiguration.id.in_(decision_configuration_ids),
                ),
            )
            .join(WorkPhase, EventConfiguration.work_phase_id == WorkPhase.id)
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .join(Project, Work.project_id == Project.id)
            .join(Proponent)
            .join(Region, Region.id == Project.region_id_env)
            .join(EAAct, EAAct.id == Work.ea_act_id)
            .join(Ministry)
            .outerjoin(eac_decision_by, Work.eac_decision_by)
            .outerjoin(decision_by, Work.decision_by)
            .outerjoin(SubstitutionAct)
            .outerjoin(
                pecp_event,
                and_(
                    pecp_event.work_id == Work.id,
                    pecp_event.event_configuration_id.in_(pecp_configuration_ids),
                ),
            )
            .outerjoin(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == pecp_event.work_id,
                    next_pecp_query.c.min_start_date == pecp_event.actual_date,
                    Work.project_id == Work.project_id,
                ),
            )
            # FILTER ENTRIES MATCHING MIN DATE FOR NEXT PECP OR NO WORK ENGAGEMENTS (FOR AMENDMENTS)
            .filter(
                or_(
                    next_pecp_query.c.min_start_date == pecp_event.actual_date,
                    pecp_event.id.is_(None),
                )
            )
            .add_columns(
                PhaseCode.name.label("phase_name"),
                WorkStatus.posted_date.label("date_updated"),
                Project.name.label("project_name"),
                Proponent.name.label("proponent"),
                Region.name.label("region"),
                Project.address.label("location"),
                EAAct.name.label("ea_act"),
                SubstitutionAct.name.label("substitution_act"),
                Project.description.label("project_description"),
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"),
                                                       INTERVAL)
                ).label("anticipated_decision_date"),
                WorkStatus.description.label("additional_info"),
                Ministry.name.label("ministry_name"),
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"),
                                                       INTERVAL)
                ).label("referral_date"),
                eac_decision_by.full_name.label("eac_decision_by"),
                decision_by.full_name.label("decision_by"),
                EventConfiguration.event_type_id.label("milestone_type"),
                func.coalesce(pecp_event.name, Event.name).label("next_pecp_title"),
                func.coalesce(
                    pecp_event.actual_date,
                    pecp_event.anticipated_date,
                    Event.actual_date,
                ).label("next_pecp_date"),
                pecp_event.notes.label("next_pecp_short_description"),
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
