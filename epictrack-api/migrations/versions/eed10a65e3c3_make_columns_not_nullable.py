"""make columns not nullable

Revision ID: eed10a65e3c3
Revises: 2257493941e7
Create Date: 2023-10-23 16:17:27.132349

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'eed10a65e3c3'
down_revision = '2257493941e7'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.execute("TRUNCATE works CASCADE")
    op.execute("TRUNCATE works_history CASCADE")
    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('eao_team_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('responsible_epd_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('work_lead_id',
               existing_type=sa.INTEGER(),
               nullable=False)
        batch_op.alter_column('decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=False)

    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.alter_column('eao_team_id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=False)
        batch_op.alter_column('responsible_epd_id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=False)
        batch_op.alter_column('work_lead_id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=False)
        batch_op.alter_column('decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=False,
               autoincrement=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('works_history', schema=None) as batch_op:
        batch_op.alter_column('decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=False)
        batch_op.alter_column('work_lead_id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=False)
        batch_op.alter_column('responsible_epd_id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=False)
        batch_op.alter_column('eao_team_id',
               existing_type=sa.INTEGER(),
               nullable=True,
               autoincrement=False)

    with op.batch_alter_table('works', schema=None) as batch_op:
        batch_op.alter_column('decision_by_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('work_lead_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('responsible_epd_id',
               existing_type=sa.INTEGER(),
               nullable=True)
        batch_op.alter_column('eao_team_id',
               existing_type=sa.INTEGER(),
               nullable=True)

    # ### end Alembic commands ###
