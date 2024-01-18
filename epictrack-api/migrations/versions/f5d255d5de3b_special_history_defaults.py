"""special history defaults

Revision ID: f5d255d5de3b
Revises: 09a79ca8e8fd
Create Date: 2024-01-16 07:25:46.706307

"""
from alembic import op
import sqlalchemy as sa
from flask import current_app, g

from api.models import Work, SpecialField, Proponent, Project
from sqlalchemy.dialects.postgresql.ranges import Range

# revision identifiers, used by Alembic.
revision = 'f5d255d5de3b'
down_revision = '09a79ca8e8fd'
branch_labels = None
depends_on = None


def upgrade():
    entities = [
        # the third key start_date_attr is used if they model has a field which can be used as a start date of the special history field
        {'model': Work, 'entity_name': 'WORK', 'field_names': ['responsible_epd_id', 'work_lead_id'],
         'start_date_attr': 'start_date'},
        {'model': Proponent, 'entity_name': 'PROPONENT', 'field_names': ['name']},
        {'model': Project, 'entity_name': 'PROJECT', 'field_names': ['name', 'proponent_id']}
    ]

    # the dict wil look like (WORK,54) = ['responsible_epd_id']
    special_histories_map = _get_special_history_map()
    upper_limit = None
    g.jwt_oidc_token_info = {"email": 'system'}

    for entity_info in entities:
        entity_model = entity_info['model']
        field_names = entity_info['field_names']
        start_date_attr = entity_info.get('start_date_attr', '')

        for entity in entity_model.find_all():
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
                        special_history = SpecialField(
                            entity=special_field_entity,
                            entity_id=entity.id,
                            field_name=field_name,
                            field_value=special_field_value,
                            time_range=time_range
                        )
                        special_history.save()


def downgrade():
    # Delete records from SpecialField where created_by is 'system'
    op.execute("DELETE FROM special_fields WHERE created_by = 'system'")
    pass


def _get_special_history_map():
    special_histories = SpecialField.find_all()
    special_histories_map = {}

    for special_history in special_histories:
        key = (special_history.entity.name, special_history.entity_id)
        if key not in special_histories_map:
            special_histories_map[key] = [special_history.field_name]
        else:
            special_histories_map[key].append(special_history.field_name)

    print('-special_histories_map-', special_histories_map)
    return special_histories_map
