"""Contains all report generation related resources"""
from .resource_forecast_report import EAResourceForeCastReport
from .anticipated_schedule_report import EAAnticipatedScheduleReport
from .thirty_sixty_ninety_report import ThirtySixtyNinetyReport


def get_report_generator(report_type='ea_anticipated_schedule', filters=None):
    """Returns the report generator for the given report type"""
    report_classes = {
        'ea_anticipated_schedule': EAAnticipatedScheduleReport(filters=filters),
        'ea_resource_forecast': EAResourceForeCastReport(filters=filters),
        '30-60-90': ThirtySixtyNinetyReport(filters=filters)
    }

    return report_classes[report_type]
