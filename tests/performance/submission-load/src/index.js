import http from 'k6/http';
import { check } from 'k6';
import { submission_data } from './data/submission_data.js';
import { application_data } from './data/application.js';
// init code
const KEYCLOAK_URL = __ENV.KEYCLOAK_URL;
const KEYCLOAK_REALM = __ENV.KEYCLOAK_REALM || 'forms-flow-ai';
const KEYCLOAK_CLIENT_ID = __ENV.KEYCLOAK_CLIENT_ID;
const USERNAME = __ENV.KEYCLOAK_USERNAME;
const PASSWORD = __ENV.KEYCLOAK_PASSWORD;
const FORMID = __ENV.FORMID;
const FORM_URL = __ENV.FORMIO_URL;
const APPLICATION_API = __ENV.APPLICATION_API;
const WEB_URL = __ENV.WEB_URL;
const SUBMISSION_URL = `${FORM_URL}/form/${FORMID}/submission`;
const APPLICATION_CREATE_URL = `${APPLICATION_API}/application/create`;
const ROLES_URL = `${APPLICATION_API}/formio/roles`;
/**
 * 
 * @returns 
 */
export function setup() {
    console.log('Calling token endpoint');
    var body = {
        username: USERNAME,
        password: PASSWORD,
        grant_type: 'password',
        client_id: KEYCLOAK_CLIENT_ID
    }

    var params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }
    var token_response = http.post(`${KEYCLOAK_URL}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`, body, params);
    check(token_response, {
        '(Access Token)reponse code was 200': (res) => res.status === 200,
        '(Access Token)response had access_token': (res) => JSON.parse(res.body).access_token !== undefined
    })
    var token = JSON.parse(token_response.body).access_token;
    var roles_response = http.get(ROLES_URL, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    console.log('ACCESS token', JSON.parse(token_response.body).access_token);
    check(roles_response, {
        '(Formio Token)should have formio token': (res) => res.headers['X-Jwt-Token'] !== undefined
    })
    var formio_token = roles_response.headers['X-Jwt-Token'];
    return {
        token,
        formio_token
    }
}
export default function (result) {
    var params = {
        headers: {
            'Authorization': `Bearer ${result.token}`,
            'Content-Type': 'application/json',
            'X-Jwt-Token': result.formio_token
        }
    }
    var data = JSON.stringify(submission_data);

    var submission_response = http.post(SUBMISSION_URL, data, params);
    check(submission_response, {
        '(Submission)response code was 201': (res) => res.status === 201,
        '(Submission)should have submission id': (res) => JSON.parse(res.body)._id !== undefined
    })
    var submission_id = JSON.parse(submission_response.body)._id;
    console.log('submission id ', submission_id);
    application_data.formId = FORMID;
    application_data.submissionId = submission_id;
    application_data.formUrl = `${SUBMISSION_URL}/${submission_id}`;
    application_data.webFormUrl= `${WEB_URL}/form/${FORMID}/submission/${submission_id}`;
    var application_create_response = http.post(APPLICATION_CREATE_URL, JSON.stringify(application_data), params);
    check(application_create_response, {
        '(Application Create)respone code was 201': (res) => res.status === 201,
        '(Application Create)application id should be created': (res) => JSON.parse(res.body).id !== undefined
    });

}