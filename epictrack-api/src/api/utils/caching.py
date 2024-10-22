"""Cache configurations."""
import pydoc

from flask_caching import Cache
from api import config


class AppCache:  # pylint: disable=too-few-public-methods
    """Caching"""

    cache = None

    @staticmethod
    def configure_cache(runmode, app):
        """Configure Caching"""
        conf = pydoc.locate(config.CONFIGURATION[runmode])

        AppCache.cache = Cache(config={
            "CACHE_TYPE": conf.CACHE_TYPE,
            "CACHE_DEFAULT_TIMEOUT": conf.CACHE_DEFAULT_TIMEOUT
        })
        AppCache.cache.init_app(app)
