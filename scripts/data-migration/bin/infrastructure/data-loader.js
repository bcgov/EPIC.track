"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("./config"));
class DataLoader {
    constructor(mapper) {
        this.mapper = mapper;
        this.formDetails = this.mapper.getFormDetails();
    }
    load() {
        return __awaiter(this, void 0, void 0, function* () {
            const mappedData = yield this.mapper.map();
            // const accessToken = await this.fetchToken();
            // const formIOToken = await this.fetchFormIOToken(accessToken);
            // console.log(formIOToken);
            // if (mappedData && mappedData.length > 0) {
            //     for (let i = 0; i < mappedData.length; i++) {
            //         const formData = mappedData[i];
            //         const submissionResponse = await this.submitFormData(accessToken, formIOToken, formData);
            //         await this.createApplication(submissionResponse.submissionId, submissionResponse.formId, accessToken)
            //     }
            // } else {
            //     throw Error('No data to be loaded. Either the input excel was empty or the mapping failed');
            // }
        });
    }
    fetchToken() {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            var data = {
                username: config_1.default.CurrentConfiguration.KEYCLOAK.USERNAME,
                password: config_1.default.CurrentConfiguration.KEYCLOAK.PASSWORD,
                grant_type: 'password',
                client_id: config_1.default.CurrentConfiguration.KEYCLOAK.CLIENT_ID
            };
            var headers = {
                'Content-Type': 'application/x-www-form-urlencoded'
            };
            return new Promise((resolve, reject) => {
                (0, axios_1.default)({
                    baseURL: config_1.default.CurrentConfiguration.KEYCLOAK.URL,
                    url: `/auth/realms/${config_1.default.CurrentConfiguration.KEYCLOAK.REALAM}/protocol/openid-connect/token`,
                    headers,
                    method: 'POST',
                    data
                }).then((response) => {
                    resolve(response.data.access_token);
                }).catch(error => {
                    throw Error(`Error getting auth token: ${error}`);
                });
            });
        });
    }
    fetchFormIOToken(accessToken) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, axios_1.default)({
                    baseURL: config_1.default.CurrentConfiguration.FORMSFLOW_API_URL,
                    url: `/formio/roles`,
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }).then((response) => {
                    resolve(response.headers['x-jwt-token']);
                }).catch(error => {
                    throw Error(`Error getting auth token: ${error}`);
                });
            });
        });
    }
    submitFormData(accessToken, formIOToken, formData) {
        var data = JSON.stringify(formData);
        return new Promise((resolve, reject) => {
            (0, axios_1.default)({
                baseURL: config_1.default.CurrentConfiguration.FORM_URL,
                url: `/${this.formDetails.form}/submission`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Jwt-Token': formIOToken
                },
                method: 'POST',
                data
            }).then(response => {
                console.log('SUBMISSION RESPONSE: ', response);
                resolve({
                    submissionId: response.data._id,
                    formId: response.data.form
                });
            }).catch(error => {
                console.log('ERROR: ', error);
            });
        });
    }
    createApplication(submissionId, formId, accessToken) {
        const applicationCreateData = {
            formId,
            submissionId,
            formUrl: `${config_1.default.CurrentConfiguration.FORM_URL}/form/${formId}/submission/${submissionId}`,
            webFormUrl: `${config_1.default.CurrentConfiguration.FORMSFLOW_WEB_URL}/form/${formId}/submission/${submissionId}`
        };
        return new Promise((resolve, reject) => {
            (0, axios_1.default)({
                baseURL: config_1.default.CurrentConfiguration.FORMSFLOW_API_URL,
                url: `/application/create`,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                method: 'POST',
                data: applicationCreateData
            }).then(response => {
                resolve({
                    submissionId: response.data._id,
                    formId: response.data.form
                });
            }).catch(error => {
                console.log('ERROR: ', error);
            });
        });
    }
}
exports.default = DataLoader;
