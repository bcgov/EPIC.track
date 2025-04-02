"""default special field

Revision ID: 2edbfb8b9c0e
Revises: 17dea08aa1b3
Create Date: 2024-01-17 16:33:49.371022

"""
from alembic import op
from flask import current_app, g
from sqlalchemy import text, inspect, MetaData, Table, Column
from sqlalchemy.dialects.postgresql.ranges import Range


# revision identifiers, used by Alembic.
revision = '2edbfb8b9c0e'
down_revision = '17dea08aa1b3'
branch_labels = None
depends_on = None


def upgrade():

    entities = [
        # the third key start_date_attr is used if they model has a field which can be used as a start date of the special history field
        {'model_query': "SELECT * FROM works WHERE is_active=True AND is_deleted=False", 'entity_name': 'WORK', 'field_names': ['responsible_epd_id', 'work_lead_id'],
         'start_date_attr': 'start_date'},
        {'model_query': "SELECT * FROM proponents WHERE is_active=True AND is_deleted=False", 'entity_name': 'PROPONENT', 'field_names': ['name']},
        {'model_query': "SELECT * FROM projects WHERE is_active=True AND is_deleted=False", 'entity_name': 'PROJECT', 'field_names': ['name', 'proponent_id']}
    ]

    # the dict wil look like (WORK,54) = ['responsible_epd_id']
    special_histories_map = _get_special_history_map()
    upper_limit = None
    g.jwt_oidc_token_info = {"email": 'system'}
    conn = op.get_bind()
    inspector = inspect(conn)
    metadata = MetaData()
    columns = [
        Column(col["name"], col["type"]) for col in inspector.get_columns("special_fields")
    ]
    special_field_table = Table("special_fields", metadata, *columns)
    for entity_info in entities:
        model_query = entity_info['model_query']
        field_names = entity_info['field_names']
        start_date_attr = entity_info.get('start_date_attr', '')
        res = conn.execute(text(model_query))
        for entity in res.fetchall():
            for field_name in field_names:
                special_field_entity = entity_info.get('entity_name')
                key = (special_field_entity, entity.id)
                history_exists = key in special_histories_map and field_name in special_histories_map[key]

                if not history_exists:
                    special_field_value = getattr(entity, field_name, None)
                    start_date = getattr(entity, start_date_attr, current_app.config.get('MIN_WORK_START_DATE'))
                    time_range = Range(
                        start_date, upper_limit, bounds="[)"
                    )
                    if special_field_value:
                        special_field_data = {
                            "entity":special_field_entity,
                            "entity_id":entity.id,
                            "field_name":field_name,
                            "field_value":special_field_value,
                            "time_range":time_range
                        }
                        conn.execute(
                            special_field_table.insert().values(special_field_data).returning(
                                (special_field_table.c.id).label("id")
                            )
                        )

def downgrade():
    # Delete records from SpecialField where created_by is 'system'
    op.execute("DELETE FROM special_fields WHERE created_by = 'system'")
    pass


def _get_special_history_map():

    # special_histories = SpecialField.find_all()
    conn = op.get_bind()
    special_field_query = "SELECT * FROM special_fields WHERE is_active = true AND is_deleted = false"
    res = conn.execute(text(special_field_query))
    special_histories = res.fetchall()
    special_histories_map = {}

    for special_history in special_histories:
        key = (special_history.entity, special_history.entity_id)
        if key not in special_histories_map:
            special_histories_map[key] = [special_history.field_name]
        else:
            special_histories_map[key].append(special_history.field_name)

    return special_histories_map