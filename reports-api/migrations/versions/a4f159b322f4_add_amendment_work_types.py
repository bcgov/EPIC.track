"""add amendment work types

Revision ID: a4f159b322f4
Revises: fd56885fb76a
Create Date: 2022-12-07 11:25:45.748250

"""
from collections import defaultdict
import json
from alembic import op
import sqlalchemy as sa
from sqlalchemy.sql import column, table

from pathlib import Path


# revision identifiers, used by Alembic.
revision = "a4f159b322f4"
down_revision = "fd56885fb76a"
branch_labels = None
depends_on = None


def _filter_dataset(data, filter_key, filter_value):
    """Function to filter dataset by key and value"""
    return filter(lambda x: x[filter_key] == filter_value, data)


def upgrade():
    milestones_table = table(
        "milestones",
        column("id", sa.Integer),
        column("name", sa.String),
        column("kind", sa.String),
        column("phase_id", sa.Integer),
        column("milestone_type_id", sa.Integer),
        column("sort_order", sa.Integer),
        column("start_at", sa.Integer),
        column("duration", sa.Integer),
        column("auto", sa.Boolean),
    )

    phase_table = table(
        "phase_codes",
        column("id", sa.Integer),
        column("name", sa.String),
        column("work_type_id", sa.Integer),
        column("ea_act_id", sa.Integer),
        column("sort_order", sa.Integer),
        column("duration", sa.Integer),
        column("color", sa.String),
        column("legislated", sa.Boolean),
    )

    outcomes_table = table(
        "outcomes",
        column("id", sa.Integer),
        column("name", sa.String),
        column("milestone_id", sa.Integer),
        column("sort_order", sa.Integer),
        column("terminates_work", sa.Boolean),
    )
    # Get the connection object for executing queries

    conn = op.get_bind()

    file_path = Path(__file__, "../../data/amendments_data.json")

    with file_path.resolve().open("r") as f:
        data = json.load(f)
        phase_data = data["phases"]
        work_types = defaultdict(list)
        milestones_data = data["milestones"]
        outcomes_data = data["outcomes"]

        for phase in phase_data:
            work_types[phase["work_type_id"]].append(phase)

        for _, work_type_data in work_types.items():
            for index, phase in enumerate(work_type_data):
                phase_sort_order = index + 1
                phase_ref = phase.pop("id")
                phase["sort_order"] = phase_sort_order
                phase["legislated"] = False
                result = conn.execute(
                    phase_table.insert(phase).returning(
                        (phase_table.c.id).label("phase_id")
                    )
                )
                phase_id = result.first()["phase_id"]
                milestones = _filter_dataset(milestones_data, "phase_id", phase_ref)
                milestone_sort_order = 0
                for milestone in milestones:
                    milestone_sort_order += 1
                    milestone_ref = milestone.pop("id", None)
                    milestone["phase_id"] = phase_id
                    milestone["sort_order"] = milestone_sort_order
                    milestone["auto"] = milestone.get('auto', False)
                    result = conn.execute(
                        milestones_table.insert(milestone).returning(
                            (milestones_table.c.id).label("milestone_id")
                        )
                    )
                    milestone_id = result.first()["milestone_id"]

                    if milestone_ref:
                        outcomes = _filter_dataset(
                            outcomes_data, "milestone_id", milestone_ref
                        )
                        outcome_sort_order = 0
                        for outcome in outcomes:
                            outcome_sort_order += 1
                            outcome["sort_order"] = outcome_sort_order
                            outcome["milestone_id"] = milestone_id
                            conn.execute(
                                outcomes_table.insert(outcome)
                            )


def downgrade():
    pass
