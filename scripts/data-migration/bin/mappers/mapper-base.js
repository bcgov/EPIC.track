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
const config_1 = __importDefault(require("../infrastructure/config"));
const readXlsxFromFile = require('read-excel-file/node');
class MapperBase {
    constructor() {
        this.file = '';
        this.schema = {};
    }
    mapFile(file, schema, sheet = undefined) {
        return new Promise((resolve, reject) => {
            const options = sheet ? { schema, sheet } : { schema };
            readXlsxFromFile(file, options).then(({ rows, errors }) => {
                if (errors && errors.length > 0) {
                    reject(JSON.stringify(errors));
                }
                resolve(rows);
            });
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
}
exports.default = MapperBase;
