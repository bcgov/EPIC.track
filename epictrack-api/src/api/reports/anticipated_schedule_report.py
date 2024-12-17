"""Classes for specific report types."""
from datetime import datetime, timedelta

from flask import jsonify, current_app
from pytz import timezone
from sqlalchemy import and_, case, func, or_, select
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.orm import aliased

from api.models import db
from api.models.ea_act import EAAct
from api.models.event import Event
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.federal_involvement import FederalInvolvement, FederalInvolvementEnum
from api.models.work_issues import WorkIssues
from api.models.work_issue_updates import WorkIssueUpdates
from api.models.work_type import WorkType, WorkTypeEnum
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
from collections import namedtuple
from .cdog_client import CDOGClient
from .report_factory import ReportFactory
from api.utils.util import process_data
import json

# pylint:disable=not-callable


class EAAnticipatedScheduleReport(ReportFactory):
    """EA Anticipated Schedule Report Generator"""

    def __init__(self, filters, color_intensity):
        """Initialize the ReportFactory"""
        data_keys = [
            "work_id",
            "event_id",
            "work_issues",
            "date_updated",
            "project_name",
            "proponent",
            "region",
            "location",
            "ea_act",
            "ea_type",
            "substitution_act",
            "project_description",
            "report_description",
            "anticipated_decision_date",
            "additional_info",
            "responsible_minister",
            "ministry",
            "referral_date",
            "actual_date",
            "anticipated_date_label",
            "decision_by",
            "next_pecp_date",
            "next_pecp_title",
            "next_pecp_short_description",
            "milestone_type",
            "category_type",
            "event_name",
            "notes",
            "next_pecp_number_of_days",
            "amendment_title",
            "work_type_id",
            "work_type"
        ]
        group_by = "work_type"
        group_order = [
            "Assessment",
            "Typical Amendment",
            "Complex Amendment",
            "Simple Amendment",
            "32(5) Amendment",
            "Exemption Order",
            "Project Notification",
            "Minister's Designation",
            "CEAO's Designation",
            "EAC Extension",
            "EAC/Order Transfer",
            "Substantial Start Decision",
            "EAC/Order Cancellation",
        ]
        item_sort_key = "referral_date"
        template_name = "anticipated_schedule.docx"
        super().__init__(
            data_keys=data_keys,
            group_by=group_by,
            group_sort_order=group_order,
            item_sort_key=item_sort_key,
            template_name=template_name,
            filters=filters,
            color_intensity=color_intensity
                        )
        self.report_title = "Anticipated EA Referral Schedule"

    def _fetch_data(self, report_date):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        current_app.logger.info(f"Fetching data for {self.report_title} report")
        start_date = report_date + timedelta(days=-7)
        report_date = report_date.astimezone(timezone('US/Pacific'))
        staff_decision_by = aliased(Staff)
        staff_minister = aliased(Staff)

        next_pecp_query = self._get_next_pcp_query(start_date)
        next_referral_event_query = self._get_referral_event_query(start_date)
        next_decision_event_query = self._get_decision_event_query(start_date)
        latest_status_updates = self._get_latest_status_update_query()
        exclude_phase_names = []
        if self.filters and "exclude" in self.filters:
            exclude_phase_names = self.filters["exclude"]
        formatted_phase_name = self._get_formatted_phase_name()
        formatted_work_type = self._get_formatted_work_type_name()
        formatted_anticipated_date = self._get_formatted_date_label(formatted_work_type, formatted_phase_name)
        anticipated_date_column = self._get_anticipated_date_column(formatted_anticipated_date)
        ea_type_column = self._get_ea_type_column(formatted_phase_name)
        responsible_minister_column = self._get_responsible_minister_column(staff_minister)

        current_app.logger.debug(f"Executing query for {self.report_title} report")
        results_qry = (
            db.session.query(Work)
            .join(Event, Event.work_id == Work.id)
            .outerjoin(
                next_referral_event_query,
                and_(
                    Event.work_id == next_referral_event_query.c.work_id,
                    Event.anticipated_date == next_referral_event_query.c.min_anticipated_date,
                ),
            )
            .outerjoin(
                next_decision_event_query,
                and_(
                    Event.work_id == next_decision_event_query.c.work_id,
                    Event.anticipated_date == next_decision_event_query.c.min_anticipated_date,
                ),
            )
            .join(
                EventConfiguration,
                EventConfiguration.id == Event.event_configuration_id
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
            .outerjoin(staff_minister, Ministry.minister_id == staff_minister.id)
            .outerjoin(latest_status_updates, latest_status_updates.c.work_id == Work.id)
            .outerjoin(
                staff_decision_by,  # Join staff alias
                or_(
                    and_(
                        Event.decision_maker_id.isnot(None), staff_decision_by.id == Event.decision_maker_id
                    ),
                    and_(
                        EventConfiguration.event_type_id == EventTypeEnum.MINISTER_DECISION.value,
                        staff_decision_by.id == Work.eac_decision_by_id,
                    ),
                    staff_decision_by.id == Work.decision_by_id,  # Default case if event.decision_maker is not populated
                )
            )
            .outerjoin(SubstitutionAct)
            .outerjoin(FederalInvolvement, FederalInvolvement.id == Work.federal_involvement_id)
            .outerjoin(WorkType, WorkType.id == Work.work_type_id)
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
                # At least one referral or decision event
                or_(
                    next_referral_event_query.c.work_id.isnot(None),
                    next_decision_event_query.c.work_id.isnot(None),
                ),
                or_(
                    and_(
                        EventConfiguration.event_category_id == EventCategoryEnum.MILESTONE.value,
                        EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value
                    ),
                    and_(
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.event_type_id == EventTypeEnum.MINISTER_DECISION.value
                    ),
                    and_(
                        Work.work_type_id == 5, # Exemption Order
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
                        EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
                    ),
                    and_(
                        Work.work_type_id == 6, # Assessment
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
                        EventConfiguration.name != "Revised EAC Application Acceptance Decision (Day Zero)",
                        EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
                    ),
                    and_(
                        Work.work_type_id == 7, # Ammendment
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.name != "Delegation of Amendment Decision",
                        EventConfiguration.event_type_id.in_([EventTypeEnum.CEAO_DECISION.value, EventTypeEnum.ADM.value])
                    ),
                    and_(
                        Work.work_type_id == 9, # EAC Extension
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.event_type_id == EventTypeEnum.ADM.value
                    ),
                    and_(
                        Work.work_type_id == 10, # Substantial Start Decision
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.name != "Delegation of SubStart Decision to Minister",
                        EventConfiguration.event_type_id == EventTypeEnum.ADM.value
                    ),
                    and_(
                        Work.work_type_id == 11, # EAC/Order Transfer
                        EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                        EventConfiguration.name != "Delegation of Transfer Decision to Minister",
                        EventConfiguration.event_type_id.in_([EventTypeEnum.CEAO_DECISION.value, EventTypeEnum.ADM.value])
                    )
                ),
                Work.is_deleted.is_(False),
                Work.work_state.in_([WorkStateEnum.IN_PROGRESS.value, WorkStateEnum.SUSPENDED.value]),
                # Filter out specific WorkPhase names
                ~WorkPhase.name.in_(exclude_phase_names)
            )
            .add_columns(
                Event.id.label("event_id"),
                Work.id.label("work_id"),
                Work.work_type_id.label("work_type_id"),
                formatted_work_type.label("work_type"),
                case(
                        (
                            and_(
                                Work.simple_title != "",
                                Work.simple_title.is_not(None),
                            ),
                            func.concat(Project.name, " - ", Work.simple_title)
                        ),
                        else_=Project.name
                ).label("amendment_title"),
                ea_type_column,
                anticipated_date_column.label("anticipated_date_label"),
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
                case(
                    (
                        Ministry.name != "Not Applicable",
                        Ministry.name
                    ),
                    else_=""
                ).label("ministry"),
                responsible_minister_column,
                (
                    Event.anticipated_date + func.cast(func.concat(Event.number_of_days, " DAYS"), INTERVAL)
                ).label("referral_date"),
                Event.actual_date.label("actual_date"),
                case(
                        (
                            EventConfiguration.event_type_id != EventTypeEnum.MINISTER_DECISION.value,
                            func.concat(staff_decision_by.first_name, " ", staff_decision_by.last_name)
                        ),
                        else_="",
                ).label("decision_by"),
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
                func.coalesce(next_pecp_query.c.number_of_days, 0).label("next_pecp_number_of_days"),
            )
        )
        results = results_qry.all()
        current_app.logger.debug(f"Fetched data: {results}")
        results_dict = [result._asdict() for result in results]
        # Processes the 'next_pecp_short_description' field in the results:
        #   - Logs the short description if it exists.
        #   - Attempts to parse the short description as JSON.
        #   - If successful, extracts and concatenates text from JSON blocks.
        #   - Logs a warning if JSON parsing fails.
        for result in results_dict:
            if 'next_pecp_short_description' in result and result['next_pecp_short_description'] is not None:
                current_app.logger.debug(f"Next PECP Short Description: {result['next_pecp_short_description']}")
                try:
                    short_description_json = json.loads(result['next_pecp_short_description'])
                    result['next_pecp_short_description'] = ''
                    if 'blocks' in short_description_json:
                        for block in short_description_json['blocks']:
                            current_app.logger.debug(f"Block: {block}")
                            if 'text' in block:
                                result['next_pecp_short_description'] += block['text'] + '\n'
                except json.JSONDecodeError:
                    current_app.logger.warning("Failed to decode JSON from next_pecp_short_description")
        data_result = namedtuple('data_result', results_dict[0].keys())
        results = [data_result(**result) for result in results_dict]
        return results

    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""
        current_app.logger.info(f"Generating {self.report_title} report for {report_date}")
        data = self._fetch_data(report_date)
        works_map = self._resolve_duplicates(data)

        works_list = []
        for work_id, item in works_map.items():
            work_issues = db.session.query(WorkIssues).filter_by(work_id=work_id).all()
            current_app.logger.debug(f"Work Issues: {work_issues}")
            item_dict = item._asdict()
            item_dict['work_issues'] = work_issues
            item_dict['next_pecp_number_of_days'] = item.next_pecp_number_of_days
            item_dict['notes'] = ""

            # go through all the work issues, find the update and add the description to the issue
            for issue in work_issues:
                work_issue_updates = (
                    db.session.query(WorkIssueUpdates)
                    .filter_by(
                        work_issue_id=issue.id,
                        is_active=True,
                        is_approved=True
                    )
                    .order_by(WorkIssueUpdates.updated_at.desc())
                    .first()
                )
                if work_issue_updates:
                    for work_issue in item_dict['work_issues']:
                        if work_issue.id == issue.id:
                            work_issue.description = work_issue_updates.description
                            current_app.logger.debug(f"----Work title: {work_issue.title}")
                            current_app.logger.debug(f"----Work description: {work_issue.description}")
                            if work_issue.is_high_priority:
                                item_dict['notes'] += f"{work_issue.title}: {work_issue.description} "
            works_list.append(item_dict)

        data = self._format_data(works_list, self.report_title)
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

    def _resolve_duplicates(self, data):
        """Resolve duplicate referral/decision event items for a work"""
        works_map = {}
        for item in data:
            if item.work_id not in works_map:
                works_map[item.work_id] = item
            else: # Referral/Decision already exists
                existing_item = works_map[item.work_id]
                referral_item = item if item.milestone_type == EventTypeEnum.REFERRAL.value else existing_item
                decision_item = item if item.category_type == EventCategoryEnum.DECISION.value else existing_item
                if not referral_item.actual_date: # This is an upcoming Referral
                    works_map[existing_item.work_id] = referral_item
                else: # Referral has already been made, use decision
                    works_map[existing_item.work_id] = decision_item
        return works_map

    def _get_ea_type_column(self, formatted_phase_name):
        return case(
                (
                    WorkType.id == WorkTypeEnum.AMENDMENT.value,
                    case(
                        (
                            FederalInvolvement.id != FederalInvolvementEnum.NONE.value,
                            func.concat(
                                formatted_phase_name, "; ", FederalInvolvement.name, " - ", SubstitutionAct.name
                            ),
                        ),
                        else_=formatted_phase_name,
                    ),
                ),
                (
                    FederalInvolvement.id != FederalInvolvementEnum.NONE.value,
                    func.concat(
                        WorkType.name, "; ", FederalInvolvement.name, " - ", SubstitutionAct.name
                    ),
                ),
                else_=WorkType.name,
            ).label("ea_type")

    def _get_formatted_date_label(self, formatted_work_type, formatted_phase_name):
        """Returns an expression for the date label"""
        return case(
                (
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                    case(
                        (
                            PhaseCode.name == "Effects Assessment & Recommendation",
                            "EA Certificate Package",
                        ),
                        else_=formatted_phase_name,
                    )
                ),
                else_=case(
                            (
                                EventConfiguration.event_type_id == EventTypeEnum.MINISTER_DECISION.value,
                                "EA Certificate"
                            ),
                            else_=formatted_work_type,
                    )
        )

    def _get_anticipated_date_column(self, formatted_anticipated_date):
        """Returns an expression for the anticipated date"""
        referral_postfix = " Referral Date"
        decision_postfix = " Decision Date"
        date_prefix = "Anticipated "
        return case(
                (
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                    func.concat(date_prefix, formatted_anticipated_date, referral_postfix)
                ),
                else_=func.concat(date_prefix, formatted_anticipated_date, decision_postfix),
        ).label("anticipated_date_label")

    def _get_formatted_phase_name(self):
        """Returns an expression for the reformatted PhaseCode.name"""
        return case(
                (
                    WorkType.id == WorkTypeEnum.AMENDMENT.value,
                    case(
                        # Case for 32.5
                        (
                            func.substring(PhaseCode.name, r"\((.*?)\)") == "32.5",
                            "32(5) Amendment"
                        ),
                        else_=func.concat(func.substring(PhaseCode.name, r"\((.*?)\)"), " Amendment"),
                    )
                ),
                else_=PhaseCode.name
        ).label("formatted_phase_name")

    def _get_formatted_work_type_name(self):
        """Returns an expression for the reformatted workType.name"""
        return case(
                (
                    WorkType.id == WorkTypeEnum.AMENDMENT.value,
                    case(
                        # Case for 32.5
                        (
                            func.substring(PhaseCode.name, r"\((.*?)\)") == "32.5",
                            "32(5) Amendment"
                        ),
                        else_=func.concat(func.substring(PhaseCode.name, r"\((.*?)\)"), " Amendment"),
                    )
                ),
                else_=WorkType.name
        ).label("formatted_work_type")

    def _get_responsible_minister_column(self, staff_minister):
        """Returns an expression for the responsible minister"""
        return case(
                (
                    Ministry.name != "Not Applicable",
                    case(
                        (
                            func.concat(staff_minister.first_name, staff_minister.last_name) != "",
                            func.concat(staff_minister.first_name, " ", staff_minister.last_name)
                        ),
                        else_=""
                    )
                ),
                else_=None,
        ).label("responsible_minister")

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
                Event.number_of_days,
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
                )
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) >= start_date,
            )
            .group_by(Event.work_id)
            .subquery()
        )

    def _get_decision_event_query(self, start_date):
        """Create and return the subquery to find next decision/milestone event based on start date"""
        return (
            db.session.query(
                Event.work_id,
                func.min(Event.anticipated_date).label("min_anticipated_date"),
            )
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_category_id.in_([EventCategoryEnum.DECISION.value, EventCategoryEnum.MILESTONE.value])
                )
                   )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) >= start_date,
            )
            .group_by(Event.work_id)
            .subquery()
        )

    def _update_staleness(self, data: list, report_date: datetime) -> list:
        """Calculate the staleness based on report date"""
        date = report_date.astimezone(CANADA_TIMEZONE)
        for group in data:
            for work in group.get("items"):
                if work.get("date_updated"):
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
