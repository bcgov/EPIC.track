import MapperBase from "./mapper-base";
import axios from 'axios';
import Config from "../infrastructure/config";
import { Proponent, ProponentFormData } from "../form-data/proponent-formdata";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";

export default class ProponentMapper extends MapperBase {
    private staffs: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'Proponent Name': {
                prop: 'name'
            },
            'Relationship Holder': {
                prop: 'relationship_holder',
            },
            'Completed': {
                prop: 'import_completed'
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
            const relationship_holder = this.staffs.filter(p=> p.name === row['relationship_holder'])[0];
            const proponent = new Proponent(row.name, relationship_holder?.id);
            const propFormData = new ProponentFormData(proponent);
            mapped_data.push({
                data: propFormData
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
            type: 'proponent',
            form: 'proponents'
        }
    }
}