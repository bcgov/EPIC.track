"""Store work type behaviour as data

Revision ID: b2bd2c763a74
Revises: 8ef7aa13abdd
Create Date: 2026-11-19 12:00:00.000000

"""
import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision = 'b2bd2c763a74'
down_revision = '8ef7aa13abdd'
branch_labels = None
depends_on = None

AMENDMENT_TYPES = (7, 16)  # Amendment, Joint Complex Amendment

# The resource forecast's existing order.
REPORT_SORT_ORDER = (6, 5, 7, 16, 11, 2, 3, 1, 9, 10, 12, 13, 15, 14)

# The report text a new work starts with.
REPORT_DESCRIPTIONS = {
    1: (
        'The proposed [Project Name] does not meet the threshold to automatically require an '
        'environmental assessment. However, it is [describe RPR threshold, e.g. within 15% of the'
        ' threshold/would employ more than 250 full-time workers/produce more than 125,000 tonnes'
        ' of greenhouse gasses per year/include a 230kv transmission line longer than '
        '40kms/require clearing more than 40kms of land for a transmission '
        'line/pipeline/railway/highway/require clearing more than 450 hectares of land], which '
        'requires [Proponent Name] to notify the EAO of the project, to determine if an '
        'environmental assessment is required.'
    ),
    2: (
        'The proposed [project name] does not meet the threshold to automatically require an '
        'environmental assessment. However, the EAO has received an application from [name of '
        'applicant] for an assessment to be required.'
    ),
    3: (
        'The proposed [project name] does not meet the threshold to automatically require an '
        'environmental assessment. However, the EAO has received an application from [name of '
        'applicant] for an assessment to be required.'
    ),
    5: (
        'On [date], [initiator] requested that the [project name] be exempted from requiring an '
        'environmental assessment certificate. The EAO will assess whether the project has '
        'significant adverse effects or serious effects to First Nations and their rights.'
    ),
    6: (
        'On [date], [initiator] entered the environmental assessment process.'
    ),
    7: (
        '[Certificate Holder/Ministry] is proposing to make changes to the [Project Name] '
        'project. The changes proposed include [describe changes to project being sought]. These '
        'changes would require an amendment to the environmental assessment certificate for the '
        'project.'
    ),
    9: (
        'On [date], the Environmental Assessment Office received an application from [Certificate'
        ' Holder] to extend the deadline of the EA Certificate for when the [Project Name] '
        'project must be substantially started.'
    ),
    10: (
        'On [date], the [proponent/EAO] [requested a determination/began its determination] of '
        "whether the proposed [project name] is substantially started. The [project name]'s "
        'environmental assessment certificate will expire on [date] unless [project name] has '
        'been substantially started.'
    ),
    11: (
        "[Former Holder] has proposed to transfer [the project]'s environmental assessment "
        'certificate to [Proposed New Holder], who would become the new Holder of the certificate'
        ' if the transfer is approved.\n\n[Proposed New Holder] [is in the process of '
        'transferring/purchasing/has purchased/etc. as appropriate] [the Project from the] '
        '[Former Holder], which holds the environmental assessment certificate for the [Project '
        'Name] project, a [project type] [in/near location]. The environmental assessment '
        'certificate provides authorization for the project. The request to transfer the '
        'certificate to [New Holder] is currently under consideration by the EAO.'
    ),
    15: (
        'On [date], [initiator] submitted a [work type] to [rationale/desired result/description '
        'of change].'
    ),
    16: (
        '[Certificate Holder/Ministry] is proposing to make changes to the [Project Name] '
        'project. The changes proposed include [describe changes to project being sought]. These '
        'changes would require an amendment to the environmental assessment certificate for the '
        'project.'
    ),
}

work_types = sa.table(
    "work_types",
    sa.column("id", sa.Integer),
    sa.column("all_phases_require_overage_responsibility", sa.Boolean),
    sa.column("default_report_description", sa.Text),
    sa.column("report_sort_order", sa.Integer),
)


def upgrade():
    for table in ("work_types", "work_types_history"):
        with op.batch_alter_table(table) as batch_op:
            batch_op.add_column(sa.Column(
                "all_phases_require_overage_responsibility", sa.Boolean(), nullable=False,
                server_default=sa.false()
            ))
            batch_op.add_column(sa.Column("default_report_description", sa.Text(), nullable=True))
            batch_op.add_column(sa.Column("report_sort_order", sa.Integer(), nullable=True))

    op.execute(
        work_types.update()
        .where(work_types.c.id.in_(AMENDMENT_TYPES))
        .values(all_phases_require_overage_responsibility=True)
    )
    for position, work_type_id in enumerate(REPORT_SORT_ORDER, start=1):
        op.execute(
            work_types.update().where(work_types.c.id == work_type_id).values(report_sort_order=position)
        )
    for work_type_id, text in REPORT_DESCRIPTIONS.items():
        op.execute(
            work_types.update().where(work_types.c.id == work_type_id).values(default_report_description=text)
        )


def downgrade():
    for table in ("work_types", "work_types_history"):
        with op.batch_alter_table(table) as batch_op:
            batch_op.drop_column("report_sort_order")
            batch_op.drop_column("default_report_description")
            batch_op.drop_column("all_phases_require_overage_responsibility")
