import MapperBase from "./mapper-base";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";
import { Staff, StaffFormData } from "../form-data/staff-formdata";
import { IndigenousNation, IndigenousNationFormData } from "../form-data/indigenous-nation-formdata";

export default class IndigenousNationMapper extends MapperBase {
    private staffs: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'Name': {
                prop: 'name'
            },
            'EPD': {
                prop: 'epd',
            }
        };
        
    }
    async map(): Promise<FormDataBase[]> {
        await this.lookupRepository.init();
        this.staffs = this.lookupRepository.getDataBySheet(Sheetnames.STAFFS);       
        let excelIndigenousNations = await this.mapFile(this.file, this.schema).catch(errors => {
            throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
        });
        let mapped_data:any[] = [];
        for(let indigenousNation of excelIndigenousNations) {
            const epd = this.staffs.filter(p=> p.name === indigenousNation.epd)[0];
            const indigenousNationData = new IndigenousNation(
               indigenousNation.name
               ,epd.id
            );
            const indigenousNationFormData = new IndigenousNationFormData(indigenousNationData);
            mapped_data.push({
                data: indigenousNationFormData
            });
        }
        return mapped_data;
    }

    getFormDetails():FormDetails {
        return {
            file: this.file,
            type: 'indigenousnation',
            form: 'indigenousnation'
        }
    }
}