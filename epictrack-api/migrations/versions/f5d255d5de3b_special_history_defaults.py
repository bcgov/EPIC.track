"""special history defaults

Revision ID: f5d255d5de3b
Revises: 09a79ca8e8fd
Create Date: 2024-01-16 07:25:46.706307

"""
from alembic import op
import sqlalchemy as sa

from api.models import Work as WorkModel, SpecialField, Proponent, Project

# revision identifiers, used by Alembic.
revision = 'f5d255d5de3b'
down_revision = '09a79ca8e8fd'
branch_labels = None
depends_on = None


def upgrade():
    entities = [
        {'model': WorkModel, 'field_names': ['responsible_epd_id', 'work_lead_id']},
        {'model': Proponent, 'field_names': ['name']},
        {'model': Project, 'field_names': ['name', 'proponent_id']}
    ]

    # the dict wil look like (WORK,54) = responsible_epd_id
    special_histories_map = _get_special_history_map()

    for entity_info in entities:
        entity_model = entity_info['model']
        field_names = entity_info['field_names']

        for entity in entity_model.find_all():
            for field_name in field_names:
                special_field_entity = entity.__tablename__.upper()
                history_exists = special_histories_map.get((special_field_entity, entity.id)) == field_name
                if not history_exists:
                    special_field_value = getattr(entity, field_name, None)
                    if not special_field_value:
                        special_history = SpecialField(
                            entity=special_field_entity,
                            entity_id=entity.id,
                            field_name=field_name,
                            field_value=special_field_value,
                            # TODO fix this
                            time_range=None
                        )
                        special_history.save()


def downgrade():
    pass


def _get_special_history_map():
    special_histories = SpecialField.find_all()
    special_histories_map = {}
    special_history: SpecialField
    for special_history in special_histories:
        special_histories_map[(special_history.entity, special_history.entity_id)] = special_history.field_name
    return special_histories_map
