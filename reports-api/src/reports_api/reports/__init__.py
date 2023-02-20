"""Contains all report generation related resources"""
from .report_factory import EAAnticipatedScheduleReport


def get_report_generator(report_type='ea_anticipated_schedule', filters=None):
    """Returns the report generator for the given report type"""
    report_classes = {
        'ea_anticipated_schedule': EAAnticipatedScheduleReport(filters=filters)
    }

    return report_classes[report_type]
