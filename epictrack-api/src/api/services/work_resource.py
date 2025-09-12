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
"""Service to manage work resources."""
from api.models import WorkResource
from api.utils.roles import Role as KeycloakRole
from api.services import authorisation
from api.exceptions import ResourceNotFoundError


class WorkResourceService:
    """Service to manage work resources."""

    @classmethod
    def create_resource(cls, resource_dict):
        """Create new resource"""
        cls._check_create_auth()
        resource = WorkResource(**resource_dict)
        resource.save()
        return resource

    @classmethod
    def update_resource(cls, resource_id, resource_dict):
        """Update resource"""
        cls._check_edit_auth()
        resource = WorkResource.find_by_id(resource_id)
        if not resource:
            raise ResourceNotFoundError('Resource not found')
        resource.update(resource_dict)
        resource.save()
        return resource

    @classmethod
    def delete_resource(cls, resource_id):
        """Delete (soft delete) resource"""
        cls._check_delete_auth()
        resource = WorkResource.find_by_id(resource_id)
        if not resource:
            raise ResourceNotFoundError('Resource not found')
        resource.is_deleted = True
        resource.is_active = False
        resource.save()
        return resource

    @classmethod
    def get_resources_by_work_id(cls, work_id):
        """Fetch resources by work_id"""
        query_params = {'work_id': work_id}
        return WorkResource.find_by_params(query_params)

    @classmethod
    def _check_create_auth(cls):
        """Check if user can create"""
        one_of_roles = (
            KeycloakRole.CREATE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)

    @classmethod
    def _check_delete_auth(cls):
        """Check if user can delete"""
        one_of_roles = (
            KeycloakRole.DELETE.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)

    @classmethod
    def _check_edit_auth(cls):
        """Check if user can edit"""
        one_of_roles = (
            KeycloakRole.EDIT.value,
        )
        authorisation.check_auth(one_of_roles=one_of_roles)
