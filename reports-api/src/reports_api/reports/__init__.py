"""Contains all report generation related resources"""
from .report_factory import EAAnticipatedScheduleReport


def get_report_generator(report_type='ea_anticipated_schedule'):
    """Returns the report generator for the given report type"""
    report_classes = {
        'ea_anticipated_schedule': EAAnticipatedScheduleReport()
    }

    return report_classes[report_type]
