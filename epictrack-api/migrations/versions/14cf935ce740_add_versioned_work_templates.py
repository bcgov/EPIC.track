"""Add versioned work templates

Revision ID: 14cf935ce740
Revises: d600856ef5d0
Create Date: 2026-11-25 16:00:00.000000

"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '14cf935ce740'
down_revision = 'd600856ef5d0'
branch_labels = None
depends_on = None

version_status = postgresql.ENUM(
    'DRAFT', 'PUBLISHED', 'RETIRED', name='work_template_version_status_enum', create_type=False
)
time_limit_kind = postgresql.ENUM('FREE', 'SET', 'LEGISLATED', name='time_limit_kind_enum', create_type=False)
day_basis = postgresql.ENUM('ZERO', 'ONE', name='day_basis_enum', create_type=False)
boundary_side = postgresql.ENUM('PREVIOUS_END', 'OWN_START', name='boundary_side_enum', create_type=False)
anchor_point = postgresql.ENUM('START', 'END', name='anchor_point_enum', create_type=False)
NEW_ENUMS = (version_status, time_limit_kind, day_basis, boundary_side, anchor_point)

# Existing types, shared with the legacy template and per-work tables.
event_position = postgresql.ENUM(name='eventpositionenum', create_type=False)
event_visibility = postgresql.ENUM(name='eventtemplatevisibilityenum', create_type=False)
phase_visibility = postgresql.ENUM(name='phasevisibilityenum', create_type=False)


def _base_columns():
    return [
        sa.Column('created_by', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True),
        sa.Column('updated_by', sa.String(length=255), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('is_deleted', sa.Boolean(), server_default=sa.false(), nullable=False),
    ]


def upgrade():
    bind = op.get_bind()
    for enum_type in NEW_ENUMS:
        enum_type.create(bind)

    op.create_table(
        'work_templates',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('work_type_id', sa.Integer(), sa.ForeignKey('work_types.id'), nullable=False),
        sa.Column('ea_act_id', sa.Integer(), sa.ForeignKey('ea_acts.id'), nullable=False),
        sa.Column('name', sa.String(length=250), nullable=False),
        *_base_columns(),
        sa.UniqueConstraint('work_type_id', 'ea_act_id', name='uq_work_templates_work_type_ea_act'),
    )
    op.create_table(
        'work_template_versions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('work_template_id', sa.Integer(), sa.ForeignKey('work_templates.id'), nullable=False),
        sa.Column('version', sa.Integer(), nullable=False),
        sa.Column('status', version_status, server_default='DRAFT', nullable=False),
        sa.Column('change_note', sa.Text(), nullable=True),
        sa.Column(
            'based_on_version_id', sa.Integer(), sa.ForeignKey('work_template_versions.id'), nullable=True
        ),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('published_by', sa.String(length=255), nullable=True),
        *_base_columns(),
        sa.UniqueConstraint('work_template_id', 'version', name='uq_work_template_versions_version'),
    )
    op.create_index(
        'uq_work_template_versions_one_draft', 'work_template_versions', ['work_template_id'],
        unique=True, postgresql_where=sa.text("status = 'DRAFT'"),
    )
    op.create_table(
        'template_phases',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            'template_version_id', sa.Integer(), sa.ForeignKey('work_template_versions.id'), nullable=False
        ),
        sa.Column('phase_code_id', sa.Integer(), sa.ForeignKey('phase_codes.id'), nullable=False),
        sa.Column('name', sa.String(length=250), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('time_limit_kind', time_limit_kind, server_default='FREE', nullable=False),
        sa.Column('number_of_days', sa.Integer(), server_default='0', nullable=False),
        sa.Column('day_basis', day_basis, server_default='ONE', nullable=False),
        sa.Column('start_usually_set_by', boundary_side, server_default='PREVIOUS_END', nullable=False),
        sa.Column('visibility', phase_visibility, server_default='REGULAR', nullable=False),
        sa.Column('in_default_sequence', sa.Boolean(), server_default=sa.true(), nullable=False),
        sa.Column('is_intake', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('requires_overage_responsibility', sa.Boolean(), server_default=sa.false(), nullable=False),
        *_base_columns(),
        sa.UniqueConstraint('template_version_id', 'phase_code_id', name='uq_template_phases_phase_code'),
    )
    op.create_table(
        'template_events',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            'template_version_id', sa.Integer(), sa.ForeignKey('work_template_versions.id'), nullable=False
        ),
        sa.Column('template_phase_id', sa.Integer(), sa.ForeignKey('template_phases.id'), nullable=False),
        sa.Column('key', sa.Uuid(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('event_type_id', sa.Integer(), sa.ForeignKey('event_types.id'), nullable=False),
        sa.Column('event_category_id', sa.Integer(), sa.ForeignKey('event_categories.id'), nullable=False),
        sa.Column('event_position', event_position, server_default='INTERMEDIATE', nullable=False),
        sa.Column('role', sa.String(length=50), nullable=True),
        sa.Column('visibility', event_visibility, nullable=False),
        sa.Column(
            'anchor_template_event_id', sa.Integer(), sa.ForeignKey('template_events.id'), nullable=True
        ),
        sa.Column('anchor_point', anchor_point, server_default='START', nullable=False),
        sa.Column('offset_days', sa.Integer(), server_default='0', nullable=False),
        sa.Column('number_of_days', sa.Integer(), server_default='0', nullable=False),
        sa.Column('multiple_days', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('repeatable', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('sets_work_start', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('sets_official_start', sa.Boolean(), server_default=sa.false(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column(
            'legacy_event_template_id', sa.Integer(), sa.ForeignKey('event_templates.id'), nullable=True
        ),
        *_base_columns(),
        sa.UniqueConstraint('template_version_id', 'key', name='uq_template_events_key'),
    )
    op.create_index('ix_template_events_template_phase_id', 'template_events', ['template_phase_id'])
    op.create_table(
        'template_outcomes',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('template_event_id', sa.Integer(), sa.ForeignKey('template_events.id'), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        *_base_columns(),
    )
    op.create_index('ix_template_outcomes_template_event_id', 'template_outcomes', ['template_event_id'])
    op.create_table(
        'template_outcome_effects',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('template_outcome_id', sa.Integer(), sa.ForeignKey('template_outcomes.id'), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=False),
        sa.Column('kind', sa.String(length=50), nullable=False),
        sa.Column(
            'target_template_phase_id', sa.Integer(), sa.ForeignKey('template_phases.id'), nullable=True
        ),
        sa.Column(
            'target_template_event_id', sa.Integer(), sa.ForeignKey('template_events.id'), nullable=True
        ),
        sa.Column('params', postgresql.JSONB(), server_default=sa.text("'{}'::jsonb"), nullable=False),
        *_base_columns(),
    )
    op.create_index(
        'ix_template_outcome_effects_template_outcome_id', 'template_outcome_effects', ['template_outcome_id']
    )

    for table in ('work_types', 'work_types_history'):
        with op.batch_alter_table(table) as batch_op:
            batch_op.add_column(sa.Column('rule_set', sa.String(length=50), server_default='EAO', nullable=False))
            batch_op.add_column(sa.Column('total_allotted_days_target', sa.Integer(), nullable=True))


def downgrade():
    for table in ('work_types', 'work_types_history'):
        with op.batch_alter_table(table) as batch_op:
            batch_op.drop_column('total_allotted_days_target')
            batch_op.drop_column('rule_set')

    op.drop_table('template_outcome_effects')
    op.drop_table('template_outcomes')
    op.drop_table('template_events')
    op.drop_table('template_phases')
    op.drop_table('work_template_versions')
    op.drop_table('work_templates')

    bind = op.get_bind()
    for enum_type in reversed(NEW_ENUMS):
        enum_type.drop(bind)
