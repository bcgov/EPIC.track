import axios from "axios";
import Config from "../infrastructure/config";

const readXlsxFromFile = require('read-excel-file/node');
export default abstract class MapperBase {
    protected file: string = '';
    protected schema: any = {};
    constructor() {}
    protected mapFile(file: string, schema: any, sheet: any = undefined): Promise<any> {
        return new Promise((resolve, reject) => {
            const options = sheet? {schema, sheet}: {schema};
            readXlsxFromFile(file, options).then(({ rows, errors }: any) => {
                if (errors && errors.length > 0) {
                    reject(JSON.stringify(errors));
                }
                resolve(rows);
            });
        })
    }
    protected async fetchToken() {
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
        return new Promise((resolve, reject)=>{
            axios({
                baseURL: Config.CurrentConfiguration.KEYCLOAK.URL,
                url: `/auth/realms/${Config.CurrentConfiguration.KEYCLOAK.REALAM}/protocol/openid-connect/token`,
                headers,
                method: 'POST',
                data
            }).then((response:any)=>{
                resolve(response.data.access_token);
            }).catch(error=>{
                throw Error(`Error getting auth token: ${error}`);
            });
        });
    }

    abstract map(): any;
    abstract getFormDetails(): any;
}
