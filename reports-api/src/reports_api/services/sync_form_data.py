# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Service to manage work form sync with database."""

from typing import Union
from flask import current_app
from inflector import English, Inflector

from reports_api.utils.helpers import find_model_from_table_name


class SyncFormDataService:  # pylint:disable=too-few-public-methods
    """Service to sync form data with models."""

    inflector = Inflector(English)

    @classmethod
    def _update_or_create(cls, model_class, data: dict):
        """Create or update model instance from data and model class"""
        current_app.logger.debug(f"_update_or_create with model {model_class}")
        # Get the list of column names for the model
        mapper = model_class.__mapper__
        columns = dict(mapper.columns).keys()
        # set data only if key is in column names and has a valid value
        # To avoid passing empty strings to integer / float fields
        data = {k: v for k, v in data.items() if v and k in columns}
        if 'id' in data and data['id']:
            obj = model_class.find_by_id(data['id'])
            obj = obj.update(data)
        else:
            obj = model_class(**data)
            obj = obj.save()
        return obj

    @classmethod
    def _get_model_name_and_relations(cls, model_key: str, data: dict, result: dict):
        """Get the model's name and foreign key relations from data dict"""
        model_name = model_key
        relations_list = []
        current_app.logger.info(f'Get model name and relations for {model_key}')
        if '-' in model_key:
            *relations_list, model_name = model_key.split('-')
            for relation in relations_list:
                if relation not in result:
                    payload_relation_key = next((x for x in data.keys() if x == relation),
                                                next((x for x in data.keys() if x.endswith(f'-{relation}')), None))
                    current_app.logger.info(f'payload_relation_key is {payload_relation_key}')
                    result[relation] = cls._process_model_data(relation, data[payload_relation_key], result)
        return model_name, relations_list, result

    @classmethod
    def _process_model_instance_data(cls, model_class, data: dict, result: dict):  # pylint:disable=too-many-locals
        """Process data for a single instance of a model"""
        dependants = [{k: v} for k, v in data.items() if isinstance(v, (dict, list))]
        instance = cls._update_or_create(model_class, data)
        current_app.logger.info(f'Model class ---> {model_class}')
        instance = instance.as_dict()
        if instance:
            for dependant in dependants:
                current_app.logger.info('Processing dependants')
                foreign_keys = {}
                key, value = next(iter(dependant.items()))
                if not hasattr(model_class, key):
                    model_key = key.replace(f'{model_class.__tablename__}-', '')
                    model_name, relations, result = cls._get_model_name_and_relations(model_key, data, result)
                    if find_model_from_table_name(model_name) is not None:
                        for relation in relations:
                            relation_key = cls.inflector.singularize(relation)
                            foreign_keys[f'{relation_key}_id'] = result[relation]['id']
                        instance_name = cls.inflector.singularize(model_class.__tablename__)
                        foreign_keys[f'{instance_name}_id'] = instance['id']
                        current_app.logger.info(f'foreign_keys {foreign_keys}')
                        if isinstance(value, dict):
                            dependant.update(foreign_keys)
                        elif isinstance(value, list):
                            dependant = [{**v, **foreign_keys} for v in value]
                    instance[key] = cls._process_model_data(model_name, dependant, result)
        return instance

    @classmethod
    def _process_model_data(cls, model_name: str, dataset: Union[dict, list], result: dict):
        """Process dataset for a model"""
        instance = None
        model_class = find_model_from_table_name(model_name)

        if model_class:
            if isinstance(dataset, dict):
                instance = cls._process_model_instance_data(model_class, dataset, result)
            elif isinstance(dataset, list):
                instance = []
                for data in dataset:
                    obj = cls._process_model_instance_data(model_class, data, result)
                    instance.append(obj)
        return instance

    @classmethod
    def sync_data(cls, payload: dict):
        """Synchronize data from payload with database."""
        result = {}

        for model_key, dataset in payload.items():  # pylint:disable=too-many-nested-blocks
            if model_key not in result:
                foreign_keys = {}
                model_name, relations, result = cls._get_model_name_and_relations(model_key, payload, result)
                for relation in relations:
                    relation_key = cls.inflector.singularize(relation)
                    foreign_keys[f'{relation_key}_id'] = result[relation]['id']
            if isinstance(dataset, dict):
                dataset.update(foreign_keys)
            elif isinstance(dataset, list):
                dataset = [{**x, **foreign_keys} for x in dataset]
            current_app.logger.info(f'Processing model data for {model_name}')
            obj = cls._process_model_data(model_name, dataset, result)
            if obj:
                result[model_key] = obj
        return result
