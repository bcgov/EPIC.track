import MapperBase from "./mapper-base";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";
import { Project, ProjectFormData } from "../form-data/project-formdata";

export default class ProjectMapper extends MapperBase {
    private regions: any[] = [];
    private types: any[] = [];
    private subtypes: any[] = [];
    private proponents: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'Project Tracking Number': {
                prop: 'project_tracking_number'
            },
            'Name': {
                prop: 'name'
            },
            'Proponent': {
                prop: 'proponent',
            },
            'Type': {
                prop: 'type'
            },
            'Sub-Type': {
                prop: 'subtype'
            },
            'Description': {
                prop: 'description'
            },
            'Location': {
                prop: 'address'
            },
            'LAT': {
                prop: 'latitude'
            },
            'LONG': {
                prop: 'longitude'
            },
            'Region (ENV)': {
                prop: 'env_region'
            },
            'Region (FLNRO)': {
                prop: 'flnro_region'
            },
            'Capital Investment': {
                prop: 'capital_investment'
            },
            'EPIC GUID': {
                prop: 'epic_guid'
            },
            'Abbreviation': {
                prop: 'abbreviation'
            },
            'EAC Number': {
                prop: 'ea_certificate'
            },
            'Project Closed': {
                prop: 'project_closed'
            },
            'Completed': {
                prop: 'import_completed'
            }
        };
        
    }
    async map(): Promise<FormDataBase[]> {
        await this.lookupRepository.init();
        this.types = this.lookupRepository.getDataBySheet(Sheetnames.TYPES); 
        this.subtypes = this.lookupRepository.getDataBySheet(Sheetnames.SUBTYPES); 
        this.regions = this.lookupRepository.getDataBySheet(Sheetnames.REGIONS); 
        this.proponents = this.lookupRepository.getDataBySheet(Sheetnames.PROPONENTS);   
        let excelProjects = await this.mapFile(this.file, this.schema).catch(errors => {
            throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
        });
        let mapped_data:any[] = [];
        let index = 1;
        for(let project of excelProjects) {
            console.log(index);
            const type = this.types.filter(p=> p.name === project.type)[0];
            console.log(type);
            const subtype = this.subtypes.filter(p=> p.name === project.subtype)[0];
            console.log(subtype);
            const envRegion = this.regions.filter(p=> p.name === project.env_region && p.entity === 'ENV')[0];
            console.log(envRegion);
            const flnroRegion = this.regions.filter(p=> p.name === project.flnro_region && p.entity === 'FLNR')[0];
            console.log(flnroRegion);
            const proponent = this.proponents.filter(p=> p.name === project.proponent)[0];
            console.log(project.proponent)
            console.log(proponent);
            const projectData = new Project(
                project.project_tracking_number
                ,project.name
                ,proponent.id
                ,type.id
                ,subtype.id
                ,project.description
                ,project.address
                ,project.latitude
                ,project.longitude
                ,`${project.latitude},${project.longitude}`
                ,envRegion.id
                ,flnroRegion.id
                ,project.capital_investment
                ,project.epic_guid
                ,project.abbreviation
                ,project.ea_certificate
                ,project.project_closed
            );
            const projectFormData = new ProjectFormData(projectData);
            mapped_data.push({
                data: projectFormData
            });
            index++;
        }
        console.log('Project mapped data',JSON.stringify(mapped_data));
        return mapped_data;
    }

    getFormDetails():FormDetails {
        return {
            file: this.file,
            type: 'project',
            form: 'project'
        }
    }
}