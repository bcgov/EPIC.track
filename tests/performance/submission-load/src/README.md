# Load Test - Submit project form
This code base can be used to conduct load testing by varying the number of users and iterations. K6 is the library used to perform the testing.

# Setting up the environment
In order to run the K6 suite, the system needs to be installed with K6
Instruction to install K6 in various platforms are well documented in the below link
[K6 Installation](https://k6.io/docs/get-started/installation/)

# How to run
Checkout the link mentioned below to see how to run K6 tests
[How to run K6](https://k6.io/docs/get-started/running-k6/)

Note: In order to authenticate using username/password with keycloak. Make sure "Direct Access Grant Enabled" is turned on and "Access Type" is "Public". This should not be the keycloak configuration in production.
## Running locally
```
k6 run  -e KEYCLOAK_URL=https://keycloak-****-dev.apps.silver.devops.gov.bc.ca -e PASSWORD=password -e FORMID=62a960eeb85a5dd8768c0541 -e KEYCLOAK_REALM='forms-flow-ai' -e KEYCLOAK_CLIENT_ID='forms-flow-web' -e KEYCLOAK_USERNAME='formsflow-designer' -e KEYCLOAK_PASSWORD='*****' -e FORMID='62a960eeb85a5dd8768c054' -e FORMIO_URL='https://forms-flow-forms-****-dev.apps.silver.devops.gov.bc.ca'  -e APPLICATION_API='https://forms-flow-api-****-dev.apps.silver.devops.gov.bc.ca' --http-debug --vus 1 --iterations 1 ./src/index.js
```
## Running in github actions
There is a github action created which you can run by configuring the environment variable with the input parameters. The result is uploaded to github itself which we can download from the summary.

When you run the test using github actions, make sure you set the github secret 'KEYCLOAK_TESTING_PASSWORD' with the correct
keycloak user password.

## Test steps
Below mentioned are the individual execution points through which the test passes
* Request Keycloak with proper credentials to get Access Token
* Request formio token by calling the formsflow api service /roles with valid Access Token
* POST the form data to the formio service and retrieve the submission id
* Create application based on the submission id

## Environment Variables
| Environment Variable  | Description |
| ------------- | ------------- |
| KEYCLOAK_URL  | Base URL of the keycloak to which the test would connect to get token  |
| KEYCLOAK_REALM  | Keycloak realm  |
| KEYCLOAK_CLIENT_ID  | Client id of keycloak client using which the test gain access to token  |
| USERNAME  | Username of the keycloak user  |
| PASSWORD  | Password of the keycloak user  |
| FORMID  | id of the form for which the submission are about to be made  |
| FORM_URL  | Base URL of the formio service  |
| APPLICATION_API  | Base URL of the formsflow api service  |

## K6s Built in variables
| Environment Variable  | Description |
| ------------- | ------------- |
| K6_ITERATIONS  | Number of times the test to be executed  |
| K6_VUS  | Number of virtual users to be participated in the test execution  |
