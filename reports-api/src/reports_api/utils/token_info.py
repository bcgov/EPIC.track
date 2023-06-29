# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Helper for token decoding"""
from flask import g


class TokenInfo:
    """Token info."""

    @staticmethod
    def get_id():
        """Get the user identifier."""
        try:
            token_info = g.token_info
            return token_info.get('sub', None)
        except AttributeError:
            return None

    @staticmethod
    def get_user_data():
        """Get the user data."""
        token_info = g.token_info
        user_data = {
            'id': token_info.get('sub', None),
            'first_name': token_info.get('given_name', None),
            'last_name': token_info.get('family_name', None),
            'email_id': token_info.get('email', None),
            'username': token_info.get('preferred_username', None),
            'identity_provider': token_info.get('identity_provider', ''),
            'groups': [group[1:len(group)] for group in token_info.get('groups')]
        }
        return user_data
