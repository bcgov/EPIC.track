# EPIC.Track Backend (API + Database)

Backend for Epic Track

## Local Setup

Steps to get a local instance of the EPIC.Track backend setup on a local machine

## Required Access

* Openshift or a db dump from test environment
* Keycloak for EAO Dev environment

## Required Software

* python v3.10
* GNU Make v4.3
* Docker v28.3.1
* PostgreSQL (psql, pg_restore, pg_dump) v14.18
* oc v3.11.0

## Linux

### Development Environment Setup

#### Setup

1. Inside the base project directory, navigate to `/epictrack-api/`
1. Create `.env` file. Sample content is in `sample.env`
1. Run `make install`. This will setup the api environment
1. Run `docker compose up --build` - See **troubleshooting** below for common issues.
1. Populate your local database with data from the online test environment. See **database setup** below.

#### Database setup

Database needs a copy of data to work properly. Assuming you have a local postgres database running on `localhost:8432` you can use the `local-db-data.sh` script in `/epictrack-api/scripts/` to populate your local database with a copy of the test DB. If you are running your local DB on a different port, update the script accordingly.

### Running + Development

#### Running Locally

Inside `/epictrack-api/` run `docker compose up --build`. This will launch the flask backend and the postgres container. If you get permission errors, run elevated with `sudo`. Changes to the API require stopping and restarting containers.

#### linting + Tests

Install [act](https://github.com/nektos/act) for running github actions locally. The following commands can be run in the root of the EPIC.Track project.

##### For Tests

`act -j api-testing`

##### For linting

`act -j api-linting`

These will run the same linting and testing checks that automatically run when submitting a PR.

### Troubleshooting

#### Common Issues with setting up backend

These are the common issues that pop up frequently when setting up the local environment. If you encounter something outside these issues, please add what the issue is, and how to resolve it.

##### Get a white screen after IDIR authentication on local environment

You can get this if you do not exist in the dev KeyCloak environment, or if you are not in the staffs table in your local db. If you do not exist in KeyCloak, speak with a team member at the EAO, if you do not exist in the database, add yourself. The important bit is that the email you use in the staffs table matches the email you have in KeyCloak.

##### Data is verified to be in the database, but no data is showing on the website

Ensure that the postgres port specified in docker compose matches the one used by the container `docker inspect eao-reports-api-db | grep \"IPAddress\"`

## Windows

 Depreciated steps for Windows in `/epictrack-api/depreciated-README.md`
