"""File representing constants used in the application"""

import os

from pytz import timezone

from api.models.ministry import Ministry
from api.models.project import Project
from api.models.proponent import Proponent
from api.models.special_field import EntityEnum
from api.models.staff import Staff
from api.models.work import Work


SCHEMA_MAPS = {
    "work": "api.schemas.work.WorksFormSchema",
    "_": "api.schemas.default.DefaultSchema"
}

CACHE_DEFAULT_TIMEOUT = 300

CACHE_DAY_TIMEOUT = int(os.getenv('CACHE_DAY_TIMEOUT', str(CACHE_DEFAULT_TIMEOUT)))
CACHE_TYPE = 'SimpleCache'
NULL_CACHE_TYPE = 'NullCache'

PIP_LINK_URL_BASE = "https://apps.nrs.gov.bc.ca/int/fnp/FirstNationDetail.xhtml?name="

# This intentionally does not include the 'WORK_ISSUE' model
SPECIAL_FIELD_ENTITY_MODEL_MAPS = {
    EntityEnum.PROJECT: Project,
    EntityEnum.WORK: Work,
    EntityEnum.PROPONENT: Proponent,
    EntityEnum.MINISTRY: Ministry,
    EntityEnum.STAFF: Staff,
}

CANADA_TIMEZONE = timezone("US/Pacific")

FIRST_WORK_PHASES = [
    "CEAO's Designation Intake",
    "Extension Pre-Submission",
    "Minister's Designation Intake",
    "Notification Intake",
    "Pre-Application (Exemption Request)",
    "Pre-Application",
    "Pre-Assessment",
    "Pre-EA (EAC Assessment)",
    "SubStart Pre-Assessment",
    "Transfer Pre-Application",
    ]
