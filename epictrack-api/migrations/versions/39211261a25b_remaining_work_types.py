"""remaining work types

Revision ID: 39211261a25b
Revises: 39088a8b3a63
Create Date: 2023-05-19 17:12:21.044594

"""
from collections import defaultdict
import json
from pathlib import Path

import sqlalchemy as sa
from alembic import op
from sqlalchemy.sql import column, table, text


# revision identifiers, used by Alembic.
revision = "39211261a25b"
down_revision = "39088a8b3a63"
branch_labels = None
depends_on = None


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

    conn = op.get_bind()

    file_path = Path(__file__, "../../data/003-work_types.json")

    with file_path.resolve().open("r") as f:
        data = json.load(f)
        phase_data = data["phases"]
        work_types = defaultdict(list)
        milestones_data = data["milestones"]

        for phase in phase_data:
            work_types[phase["work_type_id"]].append(phase)
        for _, work_type_data in work_types.items():
            for index, phase in enumerate(work_type_data):
                phase_sort_order = index + 1
                phase_ref = phase.pop("id")
                phase["sort_order"] = phase_sort_order
                phase["legislated"] = False

                conditions = (
                    f"WHERE {' AND '.join(map(lambda x: f'{x} = :{x}', phase.keys()))} "
                )
                query = text(f"SELECT id from phase_codes {conditions}")
                phase_obj = conn.execute(query, phase).fetchone()
                if phase_obj is None:
                    phase_obj = conn.execute(
                        phase_table.insert().values(**phase).returning(
                            (phase_table.c.id).label("id")
                        )
                    )
                    phase_id = phase_obj.mappings().first()["id"]
                milestones = filter(
                    lambda x: x["phase_id"] == phase_ref, milestones_data
                )
                milestone_sort_order = 0
                for milestone in milestones:
                    milestone_sort_order += 1
                    milestone.pop("id", None)
                    milestone.pop("sort_order", None)
                    auto = milestone.pop("auto", False)
                    milestone["phase_id"] = (
                        phase_obj.id if hasattr(phase_obj, "id") else phase_id
                    )

                    conditions = f"WHERE {' AND '.join(map(lambda x: f'{x} = :{x}', milestone.keys()))} "
                    query = text(
                        f"SELECT id, name, auto, kind from milestones {conditions}"
                    )
                    milestone_obj = conn.execute(query, milestone).fetchone()

                    # moving this here because with old data may differ.
                    milestone["auto"] = auto
                    milestone["sort_order"] = milestone_sort_order

                    if milestone_obj is None:
                        milestone_obj = conn.execute(
                            milestones_table.insert().values(**milestone).returning(
                                (milestones_table.c.id).label("milestone_id")
                            )
                        )
                    else:
                        conn.execute(
                            milestones_table.update()
                            .where(milestones_table.c.id == milestone_obj.id)
                            .values(**milestone)
                        )


def downgrade():
    pass
