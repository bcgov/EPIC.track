import axios, { AxiosResponse } from "axios";
import MapperBase from "../mappers/mapper-base";
import Config from "./config";
import FormDetails from "./form-details";

export default class DataLoader {
    private mapper: MapperBase;
    private formDetails: FormDetails;
    constructor(mapper: MapperBase) {
        this.mapper = mapper;
        this.formDetails = this.mapper.getFormDetails();
    }

    async load() {
        const mappedData = await this.mapper.map();
        const accessToken = await this.fetchToken();
        const formIOToken = await this.fetchFormIOToken(accessToken);
        console.log(formIOToken);
        if (mappedData && mappedData.length > 0) {
            for (let i = 0; i < mappedData.length; i++) {
                const formData = mappedData[i];
                const submissionResponse = await this.submitFormData(accessToken, formIOToken, formData);
                await this.createApplication(submissionResponse.submissionId, submissionResponse.formId, accessToken)
            }

        } else {
            throw Error('No data to be loaded. Either the input excel was empty or the mapping failed');
        }
    }
    private async fetchToken(): Promise<string> {
        const self = this;
        var data = {
            username: Config.CurrentConfiguration.KEYCLOAK.USERNAME,
            password: Config.CurrentConfiguration.KEYCLOAK.PASSWORD,
            grant_type: 'password',
            client_id: Config.CurrentConfiguration.KEYCLOAK.CLIENT_ID
        }

        var headers =
        {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
        return new Promise((resolve, reject) => {
            axios({
                baseURL: Config.CurrentConfiguration.KEYCLOAK.URL,
                url: `/auth/realms/${Config.CurrentConfiguration.KEYCLOAK.REALAM}/protocol/openid-connect/token`,
                headers,
                method: 'POST',
                data
            }).then((response: any) => {
                resolve(response.data.access_token);
            }).catch(error => {
                throw Error(`Error getting auth token: ${error}`);
            });
        });
    }
    private async fetchFormIOToken(accessToken: string): Promise<string> {
        return new Promise((resolve, reject) => {
            axios({
                baseURL: Config.CurrentConfiguration.FORMSFLOW_API_URL,
                url: `/formio/roles`,
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then((response: any) => {
                resolve(response.headers['x-jwt-token']);
            }).catch(error => {
                throw Error(`Error getting auth token: ${error}`);
            });
        });
    }
    private submitFormData(accessToken: string, formIOToken: string, formData: any): Promise<any> {
        var data = JSON.stringify(formData);
        return new Promise((resolve, reject) => {
            axios({
                baseURL: Config.CurrentConfiguration.FORM_URL,
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
    private createApplication(submissionId: string, formId: string, accessToken: string) {
        const applicationCreateData = {
            formId,
            submissionId,
            formUrl: `${Config.CurrentConfiguration.FORM_URL}/form/${formId}/submission/${submissionId}`,
            webFormUrl: `${Config.CurrentConfiguration.FORMSFLOW_WEB_URL}/form/${formId}/submission/${submissionId}`
        }
        return new Promise((resolve, reject) => {
            axios({
                baseURL: Config.CurrentConfiguration.FORMSFLOW_API_URL,
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