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
"""Provides the WSGI entry point for running the application
"""
import gc

from api import create_app


# Openshift s2i expects a lower case name of application
application = create_app()  # pylint: disable=invalid-name

# Workers fork after this under --preload; frozen objects stay shared with them.
gc.freeze()

if __name__ == "__main__":
    application.run(port=3200)
