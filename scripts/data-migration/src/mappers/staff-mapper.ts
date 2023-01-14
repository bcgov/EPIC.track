import MapperBase from "./mapper-base";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";
import { Project, ProjectFormData } from "../form-data/project-formdata";
import { Staff, StaffFormData } from "../form-data/staff-formdata";

export default class StaffMapper extends MapperBase {
    private positions: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'First Name': {
                prop: 'firstname'
            },
            'Last Name': {
                prop: 'lastname',
            },
            'Phone': {
                prop: 'phone'
            },
            'Email': {
                prop: 'email'
            },
            'Position': {
                prop: 'position'
            }
        };
        
    }
    async map(): Promise<FormDataBase[]> {
        await this.lookupRepository.init();
        this.positions = this.lookupRepository.getDataBySheet(Sheetnames.POSITIONS);       
        let excelStaffs = await this.mapFile(this.file, this.schema).catch(errors => {
            throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
        });
        let mapped_data:any[] = [];
        for(let staff of excelStaffs) {
            const position = this.positions.filter(p=> p.name === staff.position)[0];
            const staffData = new Staff(
                staff.firstname
                ,staff.lastname
                ,staff.phone
                ,staff.email
                ,position.id
            );
            const staffFormData = new StaffFormData(staffData);
            mapped_data.push({
                data: staffFormData
            });
        }
        return mapped_data;
    }

    getFormDetails():FormDetails {
        return {
            file: this.file,
            type: 'staff',
            form: 'staff'
        }
    }
}