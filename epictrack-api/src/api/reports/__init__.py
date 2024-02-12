"""Contains all report generation related resources"""
from .anticipated_schedule_report import EAAnticipatedScheduleReport
from .resource_forecast_report import EAResourceForeCastReport
from .thirty_sixty_ninety_report import ThirtySixtyNinetyReport


def get_report_generator(report_type='ea_anticipated_schedule', filters=None, color_intensity=None):
    """Returns the report generator for the given report type"""
    report_classes = {
        'ea_anticipated_schedule': EAAnticipatedScheduleReport,
        'ea_resource_forecast': EAResourceForeCastReport,
        '30-60-90': ThirtySixtyNinetyReport
    }

    return report_classes[report_type](filters=filters, color_intensity=color_intensity)
