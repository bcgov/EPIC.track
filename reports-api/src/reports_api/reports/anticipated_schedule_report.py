"""Classes for specific report types."""
from datetime import timedelta

from flask import jsonify
from sqlalchemy import and_, func
from sqlalchemy.orm import aliased

from reports_api.models import (
    EAAct, Engagement, Event, Milestone, Ministry, PhaseCode, Project, Proponent, Region, SubstitutionAct, Work,
    WorkEngagement, WorkStatus, db)

from .cdog_client import CDOGClient
from .report_factory import ReportFactory


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
        eac_decision_by = aliased(Work.eac_decision_by)
        decision_by = aliased(Work.decision_by)
        pecp_event = aliased(Event)

        pecps = Milestone.query.filter(Milestone.milestone_type_id == 11).all()
        pecps = [x.id for x in pecps]

        decision_miletones = Milestone.query.filter(
            Milestone.milestone_type_id.in_((1, 4))
        ).all()
        decision_miletones = [x.id for x in decision_miletones]

        next_decision_event_query = (
            db.session.query(
                Event.work_id,
                func.min(Event.anticipated_start_date).label(
                    "min_anticipated_start_date"
                ),
            )
            .filter(
                Event.anticipated_start_date >= start_date,
                Event.milestone_id.in_(decision_miletones),
            )
            .group_by(Event.work_id)
            .subquery()
        )

        next_pecp_query = (
            db.session.query(
                Engagement.work_id,
                func.min(Engagement.start_date).label("min_start_date"),
            )
            .join(WorkEngagement)
            .filter(
                Engagement.start_date >= start_date,
                WorkEngagement.milestone_id.in_(pecps),
            )
            .group_by(Engagement.work_id)
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
                WorkStatus.posted_date ==
                status_update_max_date_query.c.max_posted_date,
            ),
        )

        results_qry = (
            latest_status_updates.join(Work)
            .join(Event)
            .join(
                next_decision_event_query,
                and_(
                    Event.work_id == next_decision_event_query.c.work_id,
                    Event.anticipated_start_date ==
                    next_decision_event_query.c.min_anticipated_start_date,
                ),
            )
            .join(
                Milestone,
                and_(
                    Milestone.id == Event.milestone_id,
                    Milestone.id.in_(decision_miletones),
                ),
            )
            .join(PhaseCode, Milestone.phase_id == PhaseCode.id)
            .join(Project, Work.project_id == Project.id)
            .join(Proponent)
            .join(Region, Region.id == Project.region_id_env)
            .join(EAAct, EAAct.id == Work.ea_act_id)
            .join(Ministry)
            .join(eac_decision_by, Work.eac_decision_by)
            .join(decision_by, Work.decision_by)
            .outerjoin(SubstitutionAct)
            .outerjoin(
                WorkEngagement,
                and_(
                    WorkEngagement.project_id == Work.project_id,
                    WorkEngagement.milestone_id.in_(pecps),
                ),
            )
            .outerjoin(Engagement, WorkEngagement.engagement)
            .join(
                next_pecp_query,
                and_(
                    next_pecp_query.c.work_id == Work.id,
                    WorkEngagement.project_id == Work.project_id,
                    next_pecp_query.c.min_start_date == Engagement.start_date,
                ),
            )
            .outerjoin(
                pecp_event,
                and_(
                    next_pecp_query.c.work_id == pecp_event.work_id,
                    next_pecp_query.c.min_start_date == pecp_event.start_date,
                    pecp_event.milestone_id.in_(pecps),
                ),
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
                Event.anticipated_end_date.label("anticipated_decision_date"),
                WorkStatus.status_text.label("additional_info"),
                Ministry.name.label("ministry_name"),
                Event.anticipated_end_date.label("referral_date"),
                eac_decision_by.full_name.label("eac_decision_by"),
                decision_by.full_name.label("decision_by"),
                Milestone.milestone_type_id.label("milestone_type"),
                func.coalesce(pecp_event.title, Engagement.title).label(
                    "next_pecp_title"
                ),
                func.coalesce(
                    pecp_event.start_date,
                    pecp_event.anticipated_start_date,
                    Engagement.start_date,
                ).label("next_pecp_date"),
                pecp_event.short_description.label("next_pecp_short_description"),
            )
        )
        return results_qry.all()

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json" or not data:
            return data, None
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
