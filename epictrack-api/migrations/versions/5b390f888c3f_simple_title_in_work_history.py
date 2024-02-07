"""simple_title_in_work_history

Revision ID: 5b390f888c3f
Revises: 73868272c32c
Create Date: 2024-02-06 22:38:55.052178

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "5b390f888c3f"
down_revision = "73868272c32c"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###

    op.execute(
        "UPDATE indigenous_works SET indigenous_consultation_level_id = (SELECT id FROM indigenous_consultation_levels WHERE name = 'PIN') WHERE pin = 'Yes'"
    )
    op.execute(
        "UPDATE indigenous_works SET indigenous_consultation_level_id = (SELECT id FROM indigenous_consultation_levels WHERE name = 'Other') WHERE pin != 'Yes' or pin is Null"
    )
    with op.batch_alter_table("indigenous_works_history", schema=None) as batch_op:
        batch_op.alter_column(
            "indigenous_consultation_level_id",
            existing_type=sa.INTEGER(),
            nullable=False,
            autoincrement=False,
        )

    with op.batch_alter_table("works_history", schema=None) as batch_op:
        batch_op.alter_column(
            "simple_title",
            existing_type=sa.TEXT(),
            type_=sa.String(),
            existing_nullable=True,
            autoincrement=False,
        )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table("works_history", schema=None) as batch_op:
        batch_op.alter_column(
            "simple_title",
            existing_type=sa.String(),
            type_=sa.TEXT(),
            existing_nullable=True,
            autoincrement=False,
        )

    with op.batch_alter_table("indigenous_works_history", schema=None) as batch_op:
        batch_op.alter_column(
            "indigenous_consultation_level_id",
            existing_type=sa.INTEGER(),
            nullable=True,
            autoincrement=False,
        )

    # ### end Alembic commands ###
