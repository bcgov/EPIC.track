import MapperBase from "./mapper-base";
import axios from 'axios';
import Config from "../infrastructure/config";
import { Organization, OrganizationFormData } from "../form-data/organization-formdata";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";

export default class OrganizationMapper extends MapperBase {
    private staffs: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
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
    async map(): Promise<FormDataBase[]> {
        await this.lookupRepository.init();
        this.staffs = this.lookupRepository.getDataBySheet(Sheetnames.STAFFS);
        let excelRows = await this.mapFile(this.file, this.schema).catch(errors => {
            throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
        });
        let mapped_data:any[] = [];
        for(let i = 0;i<excelRows.length;i++) {
            const row = excelRows[i];
            const staff = this.staffs.filter(p=> p.name === row['responsible_epd'])[0];
            const organization = new Organization(row.name, staff.id.toString());
            const orgFormData = new OrganizationFormData(organization);
            mapped_data.push({
                data: orgFormData
            });
        }

        return mapped_data;
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
    getFormDetails():FormDetails {
        return {
            file: this.file,
            type: 'organization',
            form: 'organizations'
        }
    }
}