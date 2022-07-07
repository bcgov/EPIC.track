"""Schema representing validation rules for work form"""
from datetime import datetime, timedelta

from flask import current_app


class WorkSchema:  # pylint: disable=too-few-public-methods
    """Schema representing validation rules for work form"""

    @staticmethod
    def validate(data):  # pylint: disable=too-many-locals, too-many-branches
        """Method to validate the given data"""
        works = data.get('works')
        work_phases = data.get('works-work_phases')
        events = data.get('works-events')

        anticipated_end_date = datetime.strptime(works.get('anticipated_decision_date', ''), '%Y-%m-%dT%H:%M:%S.%fZ')
        work_phase_end_date = datetime.strptime(work_phases[-1].get('anticipated_end_date'), '%Y-%m-%dT%H:%M:%S.%fZ')
        event_end_date = events[-1].get('end_date', '')
        event_error_key = 'end date'
        if not event_end_date:
            event_end_date = events[-1].get('anticipated_end_date', '')
            event_error_key = 'anticipated end date'

        current_app.logger.info(f"Event end date {event_end_date}")
        event_end_date = datetime.strptime(event_end_date, '%Y-%m-%dT%H:%M:%S.%fZ')

        errors = {}

        if anticipated_end_date != work_phase_end_date:
            errors['works.anticipated_decision_date'] = "Anticipated end date and last phase's" +\
                " end date must be the same"
            errors[f"works-work_phases[{len(work_phases) - 1}]"] = "Anticipated end date and last phase's" +\
                " end date must be the same"
        if anticipated_end_date != event_end_date:
            errors['works.anticipated_decision_date'] = "Anticipated end date and last event's" +\
                f" {event_error_key} must be the same"
            errors[f"works-events[{len(events) - 1}]"] = "Anticipated end date and last event's" +\
                f" {event_error_key} must be the same"
        for index, event in enumerate(events):  # pylint: disable=too-many-nested-blocks
            event_anticipated_start_date = event.get('anticipated_start_date', '')
            event_anticipated_end_date = event.get('anticipated_end_date', '')

            if event_anticipated_start_date and event_anticipated_end_date:

                event_anticipated_start_date = datetime.strptime(event_anticipated_start_date, '%Y-%m-%dT%H:%M:%S.%fZ')
                event_anticipated_end_date = datetime.strptime(event_anticipated_end_date, '%Y-%m-%dT%H:%M:%S.%fZ')

                if event['milestone_type_name'] == 'PECP':
                    number_of_days = int(event['number_of_days'])
                    if event_anticipated_end_date != event_anticipated_start_date + timedelta(days=number_of_days):
                        errors[f'works-events[{index}]'] = "Anticipated end date must be equal to anticipated " +\
                            " start date + number of days"
                    if event.get('start_date', None):
                        event_start_date = datetime.strptime(event['start_date'], '%Y-%m-%dT%H:%M:%S.%fZ')
                        if event.get('end_date', None):
                            event_end_date = datetime.strptime(event['end_date'], '%Y-%m-%dT%H:%M:%S.%fZ')

                            if event_end_date != event_start_date + timedelta(days=number_of_days):
                                errors[f'works-events[{index}]'] = "End date must be equal to start date " +\
                                    "+ number of days"
                else:
                    if event_anticipated_start_date != event_anticipated_end_date:
                        errors[f'works-events[{index}]'] = "Anticipated end date must be same as anticipated start date"
            if event['is_complete'] is True or event.get('end_date', None):
                prev_event = events[index - 1]
                if not prev_event['is_complete'] or prev_event.get('end_date', None) is None:
                    errors[f'works-events[{index}]'] = "Previous events must be completed before " +\
                        "you can complete this event"
        if errors:
            return errors
        return True
