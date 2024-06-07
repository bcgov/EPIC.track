[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](../LICENSE)
[![Report API CI](https://github.com/bcgov/eao-project-reports/actions/workflows/reports-api-ci.yml/badge.svg)](https://github.com/bcgov/eao-project-reports/actions/workflows/reports-api-ci.yml)


# REPORTS API

EAO Project report services.


# EpicTrack Local Setup

## GitHub Repository
[EPIC.track GitHub](https://github.com/bcgov/EPIC.track)
- Fork a new branch and point to the `develop` branch.

## Required Access
Zenhub, Openshift, Keycloak
- You will need access. For now, contact dinesh.pb@aot-technologies.com

## Development Environment Setup

### Windows

#### Database
- Set up a Postgres database locally: [Docker Postgres](https://hub.docker.com/_/postgres)
- If you don’t have Docker, install it from: [Docker Desktop Install](https://docs.docker.com/desktop/install/windows-install/)

### API Setup

1. Open a terminal and navigate to `epictrack-api`
2. Run `docker-compose up`
3. In a separate terminal, navigate to `reports-api`
4. Create a virtual environment: [Python venv Documentation](https://docs.python.org/3/library/venv.html)
5. Activate the virtual environment and install the Python packages:
   ```sh
   python -m pip install -r path/to/requirements/dev.txt
   python -m pip install -r path/to/requirements/prod.txt
   ```
6. Switch your interpreter correctly. Refer to the image below:
   ![Interpreter Switch](path/to/image)
7. Set up environment variables in your system:
   - `FLASK_APP`
   - `FLASK_ENV`

   Example:
   ```sh
   export FLASK_APP=manage.py
   export FLASK_ENV=development
   ```
8. Configure `PYTHONPATH` to your project's folder location up to `reports-api/src`.

9. Create a `.env` file in your `reports-api` folder. Example content:
   ```env
   # Environment-specific settings for python-dotenv

   # ===== reports-api =====

   # Connection to dev database.
   DATABASE_URL="postgresql://postgres@localhost:8432/postgres"
   DATABASE_USERNAME="reports"
   DATABASE_PASSWORD="qwHAW6p3GI8AvOsM"
   DATABASE_NAME="reports-db"
   DATABASE_HOST="localhost"
   DATABASE_PORT="8432"

   # Connection to unit test database.
   DATABASE_TEST_URL="postgresql://postgres:postgres@localhost:8432/postgres"
   DATABASE_TEST_USERNAME=postgres
   DATABASE_TEST_PASSWORD=postgres
   DATABASE_TEST_HOST=localhost
   DATABASE_TEST_PORT="8432"
   DATABASE_TEST_NAME=postgres

   # Flask settings
   PYTHONWARNINGS="once"
   FLASK_APP=manage.py
   FLASK_ENV="development"
   FLASK_DEBUG=True
   POD_TESTING=True
   SQLALCHEMY_ECHO=False
   DEBUG=True

   # Keycloak settings
   JWT_OIDC_ISSUER=https://dev.loginproxy.gov.bc.ca/auth/
   JWT_OIDC_WELL_KNOWN_CONFIG=https://dev.loginproxy.gov.bc.ca/auth/realms/eao-epic/.well-known/openid-configuration
   JWT_OIDC_ALGORITHMS=RS256
   JWT_OIDC_AUDIENCE=epictrack-web
   JWT_OIDC_CLIENT_SECRET=
   JWT_OIDC_JWKS_CACHE_TIMEOUT=300
   JWT_OIDC_CACHING_ENABLED=True

   KEYCLOAK_BASE_URL=https://dev.loginproxy.gov.bc.ca
   KEYCLOAK_REALM_NAME=eao-epic
   KEYCLOAK_ADMIN_CLIENT=realm-management
   KEYCLOAK_ADMIN_SECRET=GET_FROM_KEYCLOAK
   CONNECT_TIMEOUT=60
   ```

10. Debug locally in VS Code
    - Open the application at the root level
    - Click on the highlighted symbol to find a play button for the Reports API to open the API in debug mode.

### Web Setup

1. Download Node.js: [Node.js Download](https://nodejs.org/en)
2. Navigate to `epictrack-web`
3. Run `npm install`
4. Create a `.env` file in the `epictrack-web` folder. Example content:
   ```env
   REACT_APP_API_URL=http://localhost:3200
   REACT_APP_KEYCLOAK_URL=https://dev.loginproxy.gov.bc.ca
   REACT_APP_KEYCLOAK_CLIENT=epictrack-web
   REACT_APP_KEYCLOAK_REALM=eao-epic
   PORT=3002
   ```
5. Navigate to `epictrack-web`
6. Run `npm start`
7. Login with IDIR

The application will open up on the port specified in the `.env` file.


## Running Liniting

1. Run `make flake8` or `flake8 src/api tests`.
2. Run `make pylint` or `pylint --rcfile=setup.cfg --disable=C0301,W0511 src/api test`

## Running Unit Tests

1. Tests are run from the Status bar at the bottom of the workbench in VS Code or `pytest` command.
2. Next run `make coverage` to generate the coverage report, which appears in the *htmlcov* directory.
