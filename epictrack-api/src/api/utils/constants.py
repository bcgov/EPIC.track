"""File representing constants used in the application"""

SCHEMA_MAPS = {
    "work": "api.schemas.work.WorksFormSchema",
    "_": "api.schemas.default.DefaultSchema"
}

CACHE_DEFAULT_TIMEOUT = 300
CACHE_DAY_TIMEOUT = 84600
CACHE_TYPE = 'SimpleCache'
NULL_CACHE_TYPE = 'NullCache'
