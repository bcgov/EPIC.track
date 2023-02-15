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
const mapper_base_1 = __importDefault(require("./mapper-base"));
const organization_formdata_1 = require("../form-data/organization-formdata");
const sheetnames_const_1 = __importDefault(require("../infrastructure/sheetnames-const"));
class OrganizationMapper extends mapper_base_1.default {
    constructor(file, lookupRepository) {
        super();
        this.staffs = [];
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'Organization Name': {
                prop: 'name'
            },
            'Responsible EPD': {
                prop: 'responsible_epd',
            }
        };
    }
    map() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lookupRepository.init();
            this.staffs = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.STAFFS);
            let excelRows = yield this.mapFile(this.file, this.schema).catch(errors => {
                throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
            });
            let mapped_data = [];
            for (let i = 0; i < excelRows.length; i++) {
                const row = excelRows[i];
                const staff = this.staffs.filter(p => p.name === row['responsible_epd'])[0];
                const organization = new organization_formdata_1.Organization(row.name, staff.id.toString());
                const orgFormData = new organization_formdata_1.OrganizationFormData(organization);
                mapped_data.push({
                    data: orgFormData
                });
            }
            return mapped_data;
        });
    }
    // private async init_metadata() {
    //     const self = this;
    //     const token = await this.fetchToken();
    //     const result = await axios({
    //         method: 'GET',
    //         baseURL: Config.CurrentConfiguration.REPORTS_API_URL,
    //         url: 'api/v1/staffs',
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     });
    //     self.staffs = result.data.staffs;    
    // }
    getFormDetails() {
        return {
            file: this.file,
            type: 'organization',
            form: 'organizations'
        };
    }
}
exports.default = OrganizationMapper;
