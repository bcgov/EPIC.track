"""Flask command to import phase, milestones and outcomes for work types other than 'Assessment'"""
import json
import os
from collections import defaultdict

import click
from flask import Blueprint, current_app

from reports_api.models import Milestone, Outcome, PhaseCode, db


COMMANDS_BLUE_PRINT = Blueprint('commands', __name__)


def _filter_dataset(data, filter_key, filter_value):
    """Function to filter dataset by key and value"""
    return filter(lambda x: x[filter_key] == filter_value, data)


@COMMANDS_BLUE_PRINT.cli.command('load-work-type-data')
@click.option('-f', '--file-path', default='src/reports_api/data/other_work_types_data.json',
              show_default=True, help="Path to the JSON file relative to project root.")
def load_work_type_data(file_path):  # pylint: disable=too-many-locals
    """The command function to load the work type data

    Usage: flask commands load-work-type-data -f "src/reports_api/data/amendments_data.json
    """
    print(os.getenv('DATABASE_URL'))
    # engine = sa.create_engine()
    phase_codes = PhaseCode.find_all()
    print(phase_codes)
    with open(file_path, 'r', encoding='utf8') as data_file:
        data = json.load(data_file)
        phase_data = data['phases']
        milestones_data = data['milestones']
        outcomes_data = data['outcomes']
        work_types = defaultdict(list)
        for phase in phase_data:
            work_types[phase['work_type_id']].append(phase)
        for _, work_type_data in work_types.items():  # pylint: disable=too-many-nested-blocks
            for index, phase in enumerate(work_type_data):
                try:
                    phase_sort_order = index + 1
                    phase_ref = phase.pop('id')
                    phase['sort_order'] = phase_sort_order
                    phase['legislated'] = False
                    phase_obj = PhaseCode(**phase)
                    db.session.add(phase_obj)
                    db.session.flush()
                    print("*" * 100)
                    print(phase_obj)
                    print("*" * 100)
                    milestones = _filter_dataset(milestones_data, 'phase_id', phase_ref)
                    milestone_sort_order = 0
                    for milestone in milestones:
                        milestone_sort_order += 1
                        milestone_ref = milestone.pop('id', None)
                        milestone['phase_id'] = phase_obj.id
                        milestone['sort_order'] = milestone_sort_order
                        milestone_obj = Milestone(**milestone)
                        db.session.add(milestone_obj)
                        db.session.flush()
                        if milestone_ref:
                            outcomes = _filter_dataset(outcomes_data, 'milestone_id', milestone_ref)
                            outcome_sort_order = 0
                            for outcome in outcomes:
                                outcome_sort_order += 1
                                outcome['sort_order'] = outcome_sort_order
                                outcome['milestone_id'] = milestone_obj.id
                                outcome_obj = Outcome(**outcome)
                                db.session.add(outcome_obj)
                    db.session.commit()

                except Exception as exc:  # pylint: disable=broad-except # noqa:B902
                    db.session.rollback()
                    current_app.logger.info(f'Phase {phase["name"]} data saving failed')
                    current_app.logger.info(str(exc))
