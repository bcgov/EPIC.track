"""Loads a migration's module, so tests can call its functions."""
import importlib.util
import os

VERSIONS = os.path.join(os.path.dirname(__file__), "../../migrations/versions")


def load_migration(file_name: str):
    """Return the module of the migration in the given file."""
    spec = importlib.util.spec_from_file_location(file_name.removesuffix(".py"), os.path.join(VERSIONS, file_name))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
