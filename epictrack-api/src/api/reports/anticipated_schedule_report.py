"""Classes for specific report types."""
from datetime import datetime, timedelta

from flask import jsonify, current_app
from pytz import timezone
from sqlalchemy import and_, case, cast, func, Integer, or_, select
from sqlalchemy.dialects.postgresql import INTERVAL
from sqlalchemy.orm import aliased

from api.models import db
from api.models.ea_act import EAAct
from api.models.event import Event
from api.models.event_category import EventCategoryEnum
from api.models.event_configuration import EventConfiguration
from api.models.event_type import EventTypeEnum
from api.models.federal_involvement import FederalInvolvement, FederalInvolvementEnum
from api.models.staleness_settings import StalenessSettings, StalenessTypeEnum
from api.models.work_issues import WorkIssues
from api.models.work_issue_updates import WorkIssueUpdates
from api.models.work_type import WorkType, WorkTypeEnum
from api.models.ministry import Ministry
from api.models.phase_code import PhaseCode, PhaseVisibilityEnum
from api.models.position import Position, PositionEnum
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
            "actual_date",
            "additional_info",
            "amendment_title",
            "anticipated_date_label",
            "anticipated_decision_date",
            "category_type",
            "date_updated",
            "decision_by",
            "ea_act",
            "ea_type",
            "event_id",
            "event_name",
            "group",
            "location",
            "milestone_type",
            "minister",
            "next_event_name",
            "next_pecp_date",
            "next_pecp_number_of_days",
            "next_pecp_phase_name",
            "next_pecp_short_description",
            "next_pecp_title",
            "notes",
            "project_description",
            "project_name",
            "proponent",
            "referral_date",
            "region",
            "report_description",
            "substitution_act",
            "work_id",
            "work_issues",
            "work_type_id",
            "work_type",
        ]
        group_by = "group"
        group_order = [
            "EA Certificate Referrals",
            "Amendment Decisions",
            "Exemption Order Decisions",
            "EA Readiness Decisions",
            "Minister's Designation Decisions",
            "Project Notification Decisions",
            "Transition Order Decisions",
            "EAC Extension Request Decisions",
            "EAC/Order Transfer Request Decisions",
            "Substantial Start Decisions",
            "EAC/Order Cancellation Decisions",
            "Material Alteration Decisions"
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

    def _fetch_data(self, report_date: datetime):
        """Fetches the relevant data for EA Anticipated Schedule Report"""
        current_app.logger.info(f"Fetching data for {self.report_title} report")
        start_date, report_date = self._get_date_range(report_date)

        aliases = self._get_aliased_tables()
        subqueries = self._get_subqueries(start_date, report_date)

        query = self._base_query()
        query = self._build_joins(query, aliases, subqueries, report_date)
        current_app.logger.info("Done building joins")

        formatted_columns = self._get_formatted_columns()
        columns = self._get_selected_columns(aliases, subqueries, formatted_columns)
        query = query.with_entities(*columns)
        query = query.filter(*self._build_filters(report_date, subqueries["next_referral_event_query"], subqueries["next_decision_event_query"]))
        results = query.all()

        return self._process_results(results)

    def _get_date_range(self, report_date: datetime) -> tuple[datetime, datetime]:
        """Calculates the start and end dates for the data period based on the report date."""
        start_date = report_date + timedelta(days=-7)
        report_date = report_date.astimezone(timezone("US/Pacific"))
        return start_date, report_date

    def _get_aliased_tables(self) -> dict:
        """Defines and returns a dictionary of aliased Staff and SpecialField tables for use in joins."""
        return {
            "staff_decision_by": aliased(Staff),
            "staff_minister": aliased(Staff),
            "staff_sh_minister": aliased(Staff),
            "sh_project_name": aliased(SpecialField),
            "sh_project_proponent": aliased(SpecialField),
            "sh_proponent_name": aliased(SpecialField),
            "sh_work_decision_by": aliased(SpecialField),
            "sh_work_ministry": aliased(SpecialField),
            "sh_work_ministry_minister": aliased(SpecialField),
            "sh_work_ministry_name": aliased(SpecialField)
        }

    def _get_subqueries(self, start_date, report_date) -> dict:
        """Defines and returns a dictionary of subqueries used for filtering and selecting data."""
        return {
            "latest_status_updates": self._get_latest_status_update_query(),
            "next_decision_event_query": self._get_decision_event_query(start_date),
            "next_event_query": self._get_next_event_query(report_date),
            "next_pecp_query": self._get_next_pcp_query(start_date),
            "next_referral_event_query": self._get_referral_event_query(start_date),
        }

    def _base_query(self):
        """Constructs and returns the base Work query with initial basic joins."""
        return (
            db.session.query(Work)
            .join(Event, Event.work_id == Work.id)
            .join(
                EventConfiguration,
                EventConfiguration.id == Event.event_configuration_id,
            )
            .join(
                WorkPhase,
                and_(
                    EventConfiguration.work_phase_id == WorkPhase.id,
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                )
            )
            .join(PhaseCode, WorkPhase.phase_id == PhaseCode.id)
            .join(Project, Work.project_id == Project.id)
            .join(Proponent, Proponent.id == Project.proponent_id)
            .join(Region, Region.id == Project.region_id_env)
            .join(EAAct, EAAct.id == Work.ea_act_id)
            .join(WorkType, WorkType.id == Work.work_type_id)
            .join(FederalInvolvement, FederalInvolvement.id == Work.federal_involvement_id)
            .join(Ministry, Ministry.id == Work.ministry_id)
            .join(SubstitutionAct, SubstitutionAct.id == Work.substitution_act_id)
        )

    def _build_joins(self, query, aliases, subqueries, report_date):
        """Adds a series of outer join clauses to the base query using provided aliases and subqueries."""
        return (
            query
            .outerjoin(subqueries["next_pecp_query"], subqueries["next_pecp_query"].c.work_id == Work.id)
            .outerjoin(subqueries["next_event_query"],
                and_(
                    subqueries["next_event_query"].c.work_id == Work.id,
                    subqueries["next_event_query"].c.rn == 1
                )
            )
            .outerjoin(subqueries["next_decision_event_query"],
                and_(
                    subqueries["next_decision_event_query"].c.work_id == Work.id,
                    Event.anticipated_date == subqueries["next_decision_event_query"].c.min_anticipated_date,
                )
            )
            .outerjoin(subqueries["next_referral_event_query"], Event.id == subqueries["next_referral_event_query"].c.next_referral_event_id)

            # SpecialField outerjoins using aliases
            # Special history work ministry
            .outerjoin(aliases["sh_work_ministry"], and_(
                aliases["sh_work_ministry"].entity_id == Work.id,
                aliases["sh_work_ministry"].entity == EntityEnum.WORK.value,
                aliases["sh_work_ministry"].time_range.contains(report_date),
                aliases["sh_work_ministry"].field_name == "ministry_id"
            ))
            # Special history ministry name
            .outerjoin(aliases["sh_work_ministry_name"], and_(
                aliases["sh_work_ministry_name"].entity_id == cast(aliases["sh_work_ministry"].field_value, Integer),
                aliases["sh_work_ministry_name"].entity == EntityEnum.MINISTRY.value,
                aliases["sh_work_ministry_name"].time_range.contains(report_date),
                aliases["sh_work_ministry_name"].field_name == "name"
            ))
             # special history ministry minister
            .outerjoin(aliases["sh_work_ministry_minister"], and_(
                aliases["sh_work_ministry_minister"].entity_id == cast(aliases["sh_work_ministry"].field_value, Integer),
                aliases["sh_work_ministry_minister"].entity == EntityEnum.MINISTRY.value,
                aliases["sh_work_ministry_minister"].time_range.contains(report_date),
                aliases["sh_work_ministry_minister"].field_name == "minister_id"
            ))
            .outerjoin(
                aliases["staff_sh_minister"],
                cast(aliases["sh_work_ministry_minister"].field_value, Integer) == aliases["staff_sh_minister"].id
            )
            .outerjoin(
                aliases["staff_minister"],
                Ministry.minister_id == aliases["staff_minister"].id,
            )
            # Special history work decision by
            .outerjoin(aliases["sh_work_decision_by"], and_(
                aliases["sh_work_decision_by"].entity_id == Work.id,
                aliases["sh_work_decision_by"].entity == EntityEnum.WORK.value,
                aliases["sh_work_decision_by"].time_range.contains(report_date),
                aliases["sh_work_decision_by"].field_name == "decision_by_id"
            ))
           .outerjoin(
                aliases["staff_decision_by"],  # Join staff alias
                or_(
                    and_(
                        Event.decision_maker_id.isnot(None), aliases["staff_decision_by"].id == Event.decision_maker_id
                    ),
                    and_(
                        EventConfiguration.event_type_id == EventTypeEnum.MINISTER_DECISION.value,
                        aliases["staff_decision_by"].id == Work.eac_decision_by_id,
                    ),
                    aliases["staff_decision_by"].id == func.coalesce(cast(aliases["sh_work_decision_by"].field_value, Integer), Work.decision_by_id),  # Default case if event.decision_maker is not populated
                )
            )
            .outerjoin(
                Position,
                Position.id == aliases["staff_decision_by"].position_id
            )

            # special history project name
            .outerjoin(aliases["sh_project_name"], and_(
                aliases["sh_project_name"].entity_id == Work.project_id,
                aliases["sh_project_name"].entity == EntityEnum.PROJECT.value,
                aliases["sh_project_name"].time_range.contains(report_date),
                aliases["sh_project_name"].field_name == "name"
            ))
            # special history project proponent id
            .outerjoin(aliases["sh_project_proponent"], and_(
                aliases["sh_project_proponent"].entity_id == Work.project_id,
                aliases["sh_project_proponent"].entity == EntityEnum.PROJECT.value,
                aliases["sh_project_proponent"].time_range.contains(report_date),
                aliases["sh_project_proponent"].field_name == "proponent_id"
            ))
            # special history proponent name
            .outerjoin(aliases["sh_proponent_name"], and_(
                aliases["sh_proponent_name"].entity_id == cast(aliases["sh_project_proponent"].field_value, Integer),
                aliases["sh_proponent_name"].entity == EntityEnum.PROPONENT.value,
                aliases["sh_proponent_name"].time_range.contains(report_date),
                aliases["sh_proponent_name"].field_name == "name"
            ))
        )

    def _build_filters(self, report_date: datetime, next_referral_event_query, next_decision_event_query) -> list:
        """Constructs and returns a list of filter conditions for the main query."""
        start = report_date - timedelta(days=7)
        end = report_date + timedelta(days=366)

        # Get phase names to exclude
        exclude_phase_names = []
        if self.filters and "exclude" in self.filters:
            exclude_phase_names = self.filters["exclude"]

        return [
            Work.is_active.is_(True),
            Event.anticipated_date.between(start, end),

            # Must have at least one referral or decision event
            or_(
                next_referral_event_query.c.work_id.isnot(None),
                next_decision_event_query.c.work_id.isnot(None),
            ),

            # Include relevant event configurations based on work type
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
                    Work.work_type_id == WorkTypeEnum.EXEMPTION_ORDER.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.name != "IPD/EP Approval Decision (Day Zero)",
                    EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
                ),
                and_(
                    Work.work_type_id == WorkTypeEnum.ASSESSMENT.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.name.notin_([
                        "IPD/EP Approval Decision (Day Zero)",
                        "Revised EAC Application Acceptance Decision (Day Zero)"
                    ]),
                    EventConfiguration.event_type_id == EventTypeEnum.CEAO_DECISION.value
                ),
                and_(
                    Work.work_type_id == WorkTypeEnum.AMENDMENT.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.name != "Delegation of Amendment Decision",
                    EventConfiguration.event_type_id.in_([
                        EventTypeEnum.CEAO_DECISION.value,
                        EventTypeEnum.ADM.value
                    ])
                ),
                and_(
                    Work.work_type_id == WorkTypeEnum.EAC_EXTENSION.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.event_type_id == EventTypeEnum.ADM.value
                ),
                and_(
                    Work.work_type_id == WorkTypeEnum.SUBSTANTIAL_START_DECISION.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.name != "Delegation of SubStart Decision to Minister",
                    EventConfiguration.event_type_id == EventTypeEnum.ADM.value
                ),
                and_(
                    Work.work_type_id == WorkTypeEnum.EAC_ORDER_TRANSFER.value,
                    EventConfiguration.event_category_id == EventCategoryEnum.DECISION.value,
                    EventConfiguration.name != "Delegation of Transfer Decision to Minister",
                    EventConfiguration.event_type_id.in_([
                        EventTypeEnum.CEAO_DECISION.value,
                        EventTypeEnum.ADM.value
                    ])
                )
            ),

            Work.is_deleted.is_(False),
            Event.is_active.is_(True),
            Event.is_deleted.is_(False),
            Work.work_state.in_([
                WorkStateEnum.IN_PROGRESS.value,
                WorkStateEnum.SUSPENDED.value
            ]),

            ~WorkPhase.name.in_(exclude_phase_names)
        ]

    def _get_formatted_columns(self) -> dict:
        """Retrieves a dictionary of formatted column expressions."""
        formatted_phase_name = self._get_formatted_phase_name()
        formatted_work_type = self._get_formatted_work_type_name()
        formatted_anticipated_date = self._get_formatted_date_label(formatted_work_type, formatted_phase_name)
        group_column = self._get_grouped_column(formatted_work_type)
        anticipated_date_column = self._get_anticipated_date_column(formatted_anticipated_date)
        ea_type_column = self._get_ea_type_column(formatted_phase_name)

        return {
            "formatted_work_type": formatted_work_type,
            "group_column": group_column,
            "anticipated_date_column": anticipated_date_column,
            "ea_type_column": ea_type_column,
        }

    def _get_selected_columns(self, aliases, subqueries, formatted_columns) -> list:
        """Defines and returns a list of column expressions to be selected in the final query."""
        return [
            Event.id.label("event_id"),
            Work.id.label("work_id"),
            Work.work_type_id.label("work_type_id"),
            formatted_columns["formatted_work_type"].label("work_type"),
            formatted_columns["group_column"].label("group"),
            case(
                (
                    and_(
                        Work.simple_title != "",
                        Work.simple_title.is_not(None),
                    ),
                    func.concat(
                        func.coalesce(aliases["sh_project_name"].field_value, Project.name),
                        " - ",
                        Work.simple_title
                    )
                ),
                else_=func.coalesce(aliases["sh_project_name"].field_value, Project.name)
            ).label("amendment_title"),
            formatted_columns["ea_type_column"],
            formatted_columns["anticipated_date_column"].label("anticipated_date_label"),
            subqueries["latest_status_updates"].c.posted_date.label("date_updated"),
            func.coalesce(
                aliases["sh_project_name"].field_value, Project.name
            ).label("project_name"),
            func.coalesce(
                aliases["sh_proponent_name"].field_value, Proponent.name
            ).label("proponent"),
            Region.name.label("region"),
            Project.address.label("location"),
            EAAct.name.label("ea_act"),
            SubstitutionAct.name.label("substitution_act"),
            Project.description.label("project_description"),
            Work.report_description.label("report_description"),
            (
                Event.anticipated_date + func.cast(
                    func.concat(Event.number_of_days, " DAYS"), INTERVAL
                )
            ).label("anticipated_decision_date"),
            subqueries["latest_status_updates"].c.description.label("additional_info"),
            (
                Event.anticipated_date + func.cast(
                    func.concat(Event.number_of_days, " DAYS"), INTERVAL
                )
            ).label("referral_date"),
            Event.actual_date.label("actual_date"),
            case(
                (
                    EventConfiguration.event_type_id != EventTypeEnum.MINISTER_DECISION.value,
                    case(
                        (
                            Position.id != PositionEnum.MINISTER.value,
                            func.concat(aliases["staff_decision_by"].first_name, " ", aliases["staff_decision_by"].last_name, " - ", Position.name)
                        ),
                        else_=func.concat(aliases["staff_decision_by"].first_name, " ", aliases["staff_decision_by"].last_name)
                    )
                ),
                else_="",
            ).label("decision_by"),
            func.coalesce(
                func.concat(
                    aliases["staff_sh_minister"].first_name, " ", aliases["staff_sh_minister"].last_name),
                func.concat(
                    aliases["staff_minister"].first_name, " ", aliases["staff_minister"].last_name)
            ).label("minister"),
            EventConfiguration.event_type_id.label("milestone_type"),
            EventConfiguration.event_category_id.label("category_type"),
            EventConfiguration.name.label("event_name"),
            func.coalesce(
                subqueries["next_pecp_query"].c.name, Event.name
            ).label("next_pecp_title"),
            func.coalesce(
                subqueries["next_pecp_query"].c.actual_date,
                subqueries["next_pecp_query"].c.anticipated_date,
                Event.actual_date,
            ).label("next_pecp_date"),
            subqueries["next_pecp_query"].c.notes.label("next_pecp_short_description"),
            subqueries["next_pecp_query"].c.phase_name.label("next_pecp_phase_name"),
            func.coalesce(
                subqueries["next_pecp_query"].c.number_of_days, 0
            ).label("next_pecp_number_of_days"),
            func.coalesce(
                subqueries["next_event_query"].c.name, "None"
            ).label("next_event_name")
        ]

    def _process_results(self, results):
        """Processes the next_pecp_short_description field in the results."""
        results_dict = [result._asdict() for result in results]
        current_app.logger.debug(f"Fetched data: {results_dict}")

        # Iterate over the results and process the 'next_pecp_short_description'
        for result in results_dict:
            result['next_pecp_phase_name'] = result.get('next_pecp_phase_name', None)
            if 'next_pecp_short_description' in result and result['next_pecp_short_description'] is not None:
                current_app.logger.debug(f"Next PECP Short Description: {result['next_pecp_short_description']}")
                try:
                    # Attempt to parse the short description as JSON
                    short_description_json = json.loads(result['next_pecp_short_description'])
                    result['next_pecp_short_description'] = ''

                    # If parsing is successful, process each block
                    if 'blocks' in short_description_json:
                        for block in short_description_json['blocks']:
                            current_app.logger.debug(f"Block: {block}")
                            if 'text' in block:
                                result['next_pecp_short_description'] += block['text'] + '\n'
                except json.JSONDecodeError:
                    current_app.logger.warning("Failed to decode JSON from next_pecp_short_description")

        # Convert the processed dictionary back to a namedtuple
        data_result = namedtuple('data_result', results_dict[0].keys()) if len(results_dict) > 0 else ()
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
            item_dict['next_pecp_phase_name'] = item.next_pecp_phase_name
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

    def _get_grouped_column(self, formatted_work_type):
        """Returns expression to create a custom column to group by"""
        return case(
            (
                WorkType.id == WorkTypeEnum.ASSESSMENT.value,
                case(
                    (
                        EventConfiguration.name == "Project Transitioning FROM the EA Act (2002)",
                        "Transition Order Decisions"
                    ),
                    (
                        or_(
                            PhaseCode.name == "Readiness Decision",
                            PhaseCode.name == "Further Readiness Decision",
                            PhaseCode.name == "Termination Decision"
                        ),
                        "EA Readiness Decisions"
                    ),
                    else_="EA Certificate Referrals"
                ),
            ),
            (
                WorkType.id == WorkTypeEnum.AMENDMENT.value,
                "Amendment Decisions"
            ),
            else_=func.concat(formatted_work_type, "s")
        )

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
                            "s.32(5) Amendment"
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
                            "s.32(5) Amendment Decision"
                        ),
                        else_=func.concat(func.substring(PhaseCode.name, r"\((.*?)\)"), " Amendment Decision"),
                    )
                ),
                (
                    WorkType.id == WorkTypeEnum.SUBSTANTIAL_START_DECISION.value,
                    "Substantial Start Decision"
                ),
                (
                    or_(
                        WorkType.id == WorkTypeEnum.EAC_EXTENSION.value,
                        WorkType.id == WorkTypeEnum.EAC_ORDER_TRANSFER.value
                    ),
                    func.concat(WorkType.name, " Request Decision")
                ),
                else_=func.concat(WorkType.name, " Decision")
        ).label("formatted_work_type")

    def _get_next_event_query(self, start_date):
        """
        Create and return the subquery for the next event for a Work.

        The next event is chosen based on the earliest anticipated_date or actual_date after the start_date
        If there are two events for the same work with the same date, then event_id determines the first
        """
        next_event_query = (
            db.session.query(
                Event.work_id,
                Event.name.label("name"),
                func.coalesce(Event.actual_date, Event.anticipated_date).label("next_event_date"),
                func.row_number().over(
                    partition_by=Event.work_id,
                    order_by=(
                        func.coalesce(Event.actual_date, Event.anticipated_date),
                        Event.id,
                    ),
                ).label("rn") # row number label
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) > start_date,
                Event.is_active.is_(True),
                Event.is_deleted.is_(False),
            )
            .subquery()
        )
        return next_event_query

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
                WorkPhase.name.label("phase_name"),
            )
            .join(
                next_pcp_min_date_query,
                and_(
                    next_pcp_min_date_query.c.work_id == Event.work_id,
                    func.coalesce(Event.actual_date, Event.anticipated_date) == next_pcp_min_date_query.c.min_pcp_date,
                ),
            )
            .join(
                EventConfiguration,
                EventConfiguration.id == Event.event_configuration_id
            )
            .join(
                WorkPhase,
                EventConfiguration.work_phase_id == WorkPhase.id
            )
            .filter(
                Event.is_active.is_(True),
                Event.is_deleted.is_(False),
                Event.event_configuration_id.in_(pecp_configuration_ids),
            )
            .subquery()
        )
        return next_pecp_query

    def _get_referral_event_query(self, start_date):
        """Create and return the subquery for the next referral event for a Work"""
        referral_event_subquery = (
            db.session.query(
                Event.work_id,
                Event.id.label("next_referral_event_id"),
                func.coalesce(Event.actual_date, Event.anticipated_date).label("next_referral_date"),
                func.row_number().over(
                    partition_by=Event.work_id,
                    order_by=(
                        func.coalesce(Event.actual_date, Event.anticipated_date),
                        Event.id,
                    ),
                ).label("row_num") # Assign 1 to the earliest event per work_id
            )
            .join(
                EventConfiguration,
                and_(
                    Event.event_configuration_id == EventConfiguration.id,
                    EventConfiguration.event_type_id == EventTypeEnum.REFERRAL.value,
                )
            )
            .join(
                WorkPhase,
                and_(
                    EventConfiguration.work_phase_id == WorkPhase.id,
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                )
            )
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) > start_date,
                Event.is_active.is_(True),
                Event.is_deleted.is_(False),
            )
            .subquery()
        )
        # Filter to get only the first referral event
        return (
            db.session.query(
                referral_event_subquery.c.work_id,
                referral_event_subquery.c.next_referral_event_id
            )
            .filter(referral_event_subquery.c.row_num == 1)
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
            .join(
                WorkPhase,
                and_(
                    EventConfiguration.work_phase_id == WorkPhase.id,
                    WorkPhase.visibility == PhaseVisibilityEnum.REGULAR.value,
                ))
            .filter(
                func.coalesce(Event.actual_date, Event.anticipated_date) >= start_date,
                Event.is_active.is_(True),
                Event.is_deleted.is_(False),
            )
            .group_by(Event.work_id)
            .subquery()
        )

    def _update_staleness(self, data: list, report_date: datetime) -> list:
        """Calculate the staleness based on report date"""
        staleness_settings = db.session.query(StalenessSettings).filter_by(is_active=True, staleness_type=StalenessTypeEnum.STATUS).one_or_none()
        warning_length = getattr(staleness_settings, "warning_length", 5) or 5
        staleness_length = getattr(staleness_settings, "staleness_length", 10) or 10
        date = report_date.astimezone(CANADA_TIMEZONE)
        for group in data:
            for work in group.get("items"):
                if work.get("date_updated"):
                    diff = (date - work["date_updated"]).days
                    if diff > staleness_length:
                        work["staleness"] = StalenessEnum.CRITICAL.value
                    elif diff > warning_length:
                        work["staleness"] = StalenessEnum.WARN.value
                    else:
                        work["staleness"] = StalenessEnum.GOOD.value
                else:
                    work["staleness"] = StalenessEnum.CRITICAL.value
        return data
