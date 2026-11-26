"""Add template lineage and settings to each work's rows

Revision ID: 5f07df4f6621
Revises: 8013265c32c4
Create Date: 2026-11-26 16:00:00.000000

"""
import logging
from collections import Counter

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

from api.workplan.work_backfill import backfill_settings


# revision identifiers, used by Alembic.
revision = '5f07df4f6621'
down_revision = '8013265c32c4'
branch_labels = None
depends_on = None

logger = logging.getLogger('alembic.runtime.migration')

# S1a's types.
time_limit_kind = postgresql.ENUM(name='time_limit_kind_enum', create_type=False)
day_basis = postgresql.ENUM(name='day_basis_enum', create_type=False)
anchor_point = postgresql.ENUM(name='anchor_point_enum', create_type=False)

EAO_KINDS = [
    ('EAO_EXTENSION', 'EAO-side extension', 'TIME_LIMIT_EXTENSION', 1),
    ('PROPONENT_EXTENSION', 'Proponent extension', 'TIME_LIMIT_EXTENSION', 2),
    ('PROPONENT_SUSPENSION', 'Proponent suspension', 'TIME_LIMIT_SUSPENSION', 3),
    ('FORCE_MAJEURE_SUSPENSION', 'Force majeure suspension', 'TIME_LIMIT_SUSPENSION', 4),
]


def _columns():
    """New columns by table. A foreign key goes on the table only, so history rows never block a delete."""
    return {
        'works': [
            (sa.Column('template_version_id', sa.Integer(), nullable=True), 'work_template_versions.id'),
            (sa.Column('official_start_date', sa.DateTime(timezone=True), nullable=True), None),
        ],
        'work_phases': [
            (sa.Column('template_phase_id', sa.Integer(), nullable=True), 'template_phases.id'),
            (sa.Column('time_limit_kind', time_limit_kind, nullable=False, server_default='FREE'), None),
            (sa.Column('day_basis', day_basis, nullable=False, server_default='ONE'), None),
            (sa.Column('is_intake', sa.Boolean(), nullable=False, server_default=sa.false()), None),
            (sa.Column('requires_overage_responsibility', sa.Boolean(), nullable=False, server_default=sa.false()),
             None),
        ],
        'event_configurations': [
            (sa.Column('template_event_id', sa.Integer(), nullable=True), 'template_events.id'),
            (sa.Column('role', sa.String(length=50), nullable=True), None),
            (sa.Column('anchor_configuration_id', sa.Integer(), nullable=True), 'event_configurations.id'),
            (sa.Column('anchor_point', anchor_point, nullable=False, server_default='START'), None),
            (sa.Column('offset_days', sa.Integer(), nullable=False, server_default='0'), None),
            (sa.Column('repeatable', sa.Boolean(), nullable=False, server_default=sa.false()), None),
            (sa.Column('sets_work_start', sa.Boolean(), nullable=False, server_default=sa.false()), None),
            (sa.Column('sets_official_start', sa.Boolean(), nullable=False, server_default=sa.false()), None),
        ],
        'events': [
            (sa.Column('interruption_kind_id', sa.Integer(), nullable=True), 'interruption_kinds.id'),
            (sa.Column('effects_applied_at', sa.DateTime(timezone=True), nullable=True), None),
        ],
        'outcome_configurations': [
            (sa.Column('template_outcome_id', sa.Integer(), nullable=True), 'template_outcomes.id'),
        ],
    }


def upgrade():
    interruption_kinds = op.create_table(
        'interruption_kinds',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('rule_set', sa.String(length=50), nullable=False),
        sa.Column('code', sa.String(length=50), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.UniqueConstraint('rule_set', 'code', name='uq_interruption_kinds_rule_set_code'),
    )
    op.bulk_insert(interruption_kinds, [
        {'rule_set': 'EAO', 'code': code, 'name': name, 'role': role, 'sort_order': sort_order,
         'created_by': 'system'}
        for code, name, role, sort_order in EAO_KINDS
    ])
    op.create_table(
        'migration_issues',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('work_id', sa.Integer(), sa.ForeignKey('works.id', ondelete='CASCADE'), nullable=False),
        sa.Column('table_name', sa.String(length=50), nullable=False),
        sa.Column('row_id', sa.Integer(), nullable=False),
        sa.Column('issue', sa.String(length=50), nullable=False),
        sa.Column('detail', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
    )
    op.create_index('ix_migration_issues_work_id', 'migration_issues', ['work_id'])

    for table, columns in _columns().items():
        for column, foreign_key in columns:
            op.add_column(table, column)
            op.add_column(f'{table}_history', column.copy())
            if foreign_key:
                op.create_foreign_key(
                    f'{table}_{column.name}_fkey', table, foreign_key.split('.')[0], [column.name], ['id'])

    issues = backfill_settings(op.get_bind())
    logger.info('Work settings backfilled; issues by kind: %s', dict(Counter(issue.issue for issue in issues)))


def downgrade():
    for table, columns in reversed(list(_columns().items())):
        for column, foreign_key in reversed(columns):
            if foreign_key:
                op.drop_constraint(f'{table}_{column.name}_fkey', table, type_='foreignkey')
            op.drop_column(f'{table}_history', column.name)
            op.drop_column(table, column.name)
    op.drop_index('ix_migration_issues_work_id', table_name='migration_issues')
    op.drop_table('migration_issues')
    op.drop_table('interruption_kinds')
