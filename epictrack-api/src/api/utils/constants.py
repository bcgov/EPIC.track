"""File representing constants used in the application"""

from pytz import timezone

from api.models.project import Project
from api.models.proponent import Proponent
from api.models.special_field import EntityEnum
from api.models.work import Work


SCHEMA_MAPS = {
    "work": "api.schemas.work.WorksFormSchema",
    "_": "api.schemas.default.DefaultSchema"
}

CACHE_DEFAULT_TIMEOUT = 300
CACHE_DAY_TIMEOUT = 84600
CACHE_TYPE = 'SimpleCache'
NULL_CACHE_TYPE = 'NullCache'

PIP_LINK_URL_BASE = "https://apps.nrs.gov.bc.ca/int/fnp/FirstNationDetail.xhtml?name="

SPECIAL_FIELD_ENTITY_MODEL_MAPS = {
    EntityEnum.PROJECT: Project,
    EntityEnum.WORK: Work,
    EntityEnum.PROPONENT: Proponent,
}

CANADA_TIMEZONE = timezone("US/Pacific")
