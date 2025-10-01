# EPIC.Track Frontend

Frontend for Epic Track

## Local Setup

Steps to setup a local instance of the EPIC.Track frontend on a local machine

## Required Access

* IDIR account to for authentication

## Required Software

* ``NodeJS v22.14.0``
* `npm`


## Linux

### Development Environment Setup

#### Setup

1. Create a `.env` file with the same contents as `sample.env`.

1. Inside `.../EPIC.track/epictrack-web/` use `npm run install` to install the dependancies.

### Running + Development

Inside `/epictrack-web/` use `npm run start` to launch the front end. Changes to React files will automatically update.

#### linting + Tests

Install [act](https://github.com/nektos/act) for running github actions locally. The following commands can be run in the root of the EPIC.Track project.

##### For Tests

`act -j web-testing`

##### For linting

`act -j web-linting`

These will run the same linting and testing checks that automatically run when submitting a PR.

##### Linting with npm

You can also use `npm lintfix` and `npm lint` to fix more common liting errors.
