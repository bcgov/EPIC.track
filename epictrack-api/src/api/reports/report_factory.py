"""Base class for report generator."""
from abc import ABC, abstractmethod
from base64 import b64encode
from collections import defaultdict
from io import BytesIO
from pathlib import Path
from sqlalchemy import and_, func
from flask import current_app
from api.models import WorkStatus, db


# pylint: disable=too-many-arguments
class ReportFactory(ABC):
    """Basic representation of report generator."""

    def __init__(self, data_keys, group_by=None, template_name=None, filters=None, color_intensity=None):
        """Constructor"""
        self.data_keys = data_keys
        self.group_by = group_by
        if template_name is not None:
            self.template_path = Path(__file__, f"../report_templates/{template_name}")
        self.filters = filters
        self.color_intensity = color_intensity

    @abstractmethod
    def _fetch_data(self, report_date):
        """Fetches the relevant data for the given report"""

    def _format_data(self, data, report_title=None):
        """Formats the given data for the given report"""
        formatted_data = []
        if self.group_by:
            formatted_data = defaultdict(list)
        excluded_items = []
        if self.filters and "exclude" in self.filters:
            excluded_items = self.filters["exclude"]
        if report_title == "Anticipated EA Referral Schedule":
            for item in data:
                obj = {
                  k: (item[k] if k != "work_issues" else self._deserialize_work_issues(item[k]))
                  for k in self.data_keys if k not in excluded_items
                }
                if self.group_by:
                    obj["sl_no"] = len(formatted_data[obj.get(self.group_by)]) + 1
                    formatted_data[obj.get(self.group_by)].append(obj)
                else:
                    formatted_data.append(obj)
        else:
            for item in data:
                obj = {
                    k: getattr(item, k) for k in self.data_keys if k not in excluded_items
                }
                if self.group_by:
                    obj["sl_no"] = len(formatted_data[obj.get(self.group_by)]) + 1
                    formatted_data[obj.get(self.group_by)].append(obj)
                else:
                    formatted_data.append(obj)

        return formatted_data

    def _deserialize_work_issues(self, work_issues):
        """Deserialize work issues from the database format to a report-friendly format."""
        current_app.logger.debug(f"Deserializing work issues: {work_issues}")
        deserialized_issues = []
        for issue in work_issues:
            deserialized_issues.append({
                "id": issue.id,
                "title": issue.title,
                "description": issue.description if hasattr(issue, 'description') else None,
                "is_high_priority": issue.is_high_priority,
                "created_at": issue.created_at.strftime("%Y-%m-%d %H:%M:%S") if issue.created_at else None,
                "updated_at": issue.updated_at.strftime("%Y-%m-%d %H:%M:%S") if issue.updated_at else None,
            })
        return deserialized_issues

    @abstractmethod
    def generate_report(self, report_date, return_type):
        """Generates a report and returns it"""

    def generate_template(self):
        """Generates template file to use with CDOGS API"""
        with self.template_path.resolve().open("rb") as template_file:
            output_stream = BytesIO(template_file.read())
            output_stream = b64encode(output_stream.getvalue())
            return output_stream.decode("ascii")

    def _get_latest_status_update_query(self):
        """Create and return the subquery to find latest status update."""
        status_update_max_date_query = (
            db.session.query(
                WorkStatus.work_id,
                func.max(WorkStatus.posted_date).label("max_posted_date"),  # pylint: disable=not-callable
            )
            .filter(WorkStatus.is_approved.is_(True))
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
