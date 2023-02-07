"""Classes for specific report types."""
from abc import ABC, abstractmethod
from base64 import b64encode
from collections import defaultdict
from datetime import timedelta
from io import BytesIO
from pathlib import Path

from flask import jsonify
from sqlalchemy import and_
from sqlalchemy.orm import aliased

from reports_api.models import (
    EAAct, Engagement, Event, Milestone, Ministry, PhaseCode, Project, Proponent, Region, SubstitutionAct, Work,
    WorkEngagement, WorkStatus)

from .cdog_client import CDOGClient


class ReportFactory(ABC):
    """Basic representation of report generator."""

    def __init__(self, data_keys, group_by, template_name):
        """Constructor"""
        self.data_keys = data_keys
        self.group_by = group_by
        self.template_path = Path(__file__, f"../report_templates/{template_name}")

    @abstractmethod
    def _fetch_data(self, report_date):
        """Fetches the relevant data for the given report"""

    def _format_data(self, data):
        """Formats the given data for the given report"""
        formatted_data = defaultdict(list)
        for item in data:
            obj = {k: getattr(item, k) for k in self.data_keys}
            formatted_data[obj.get(self.group_by)].append(obj)
        return formatted_data

    @abstractmethod
    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""

    def generate_template(self):
        """Generates template file to use with CDOGS API"""
        print(self.template_path)
        print(self.template_path.resolve())
        with self.template_path.resolve().open("rb") as template_file:
            output_stream = BytesIO(template_file.read())
            output_stream = b64encode(output_stream.getvalue())
            return output_stream.decode("ascii")


class EAAnticipatedScheduleReport(ReportFactory):
    """EA Anticipated Schedule Report Generator"""

    def __init__(self):
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
            "next_pecp",
            "milestone_type",
        ]
        group_by = "phase_name"
        template_name = "anticipated_schedule.docx"
        super().__init__(data_keys, group_by, template_name)
        self.report_title = "Anticipated EA Referral Schedule"

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        start_date = report_date + timedelta(days=-7)
        eac_decision_by = aliased(Work.eac_decision_by)
        decision_by = aliased(Work.decision_by)

        pecps = Milestone.query.filter(Milestone.milestone_type_id == 11).all()
        pecps = [x.id for x in pecps]

        latest_status_updates = WorkStatus.query.filter(
            WorkStatus.posted_date >= start_date
        )

        results_qry = (
            latest_status_updates.join(Work)
            .join(Event)
            .join(
                Milestone,
                and_(
                    Milestone.id == Event.milestone_id,
                    Milestone.milestone_type_id.in_((1, 4)),
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
                    WorkEngagement.phase_id == PhaseCode.id,
                    WorkEngagement.milestone_id.in_(pecps),
                ),
            )
            # .outerjoin(pecp, and_(WorkEngagement.milestone, pecp.milestone_type_id == 11))
            .outerjoin(Engagement, WorkEngagement.engagement)
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
                Engagement.start_date.label("next_pecp"),
                Milestone.milestone_type_id.label("milestone_type"),
            )
        )

        return results_qry.all()

    # def generate_template(self):
    #     """Generates template file to use with CDOGS API"""

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        data = self._fetch_data(report_date)
        data = self._format_data(data)
        if return_type == "json":
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
