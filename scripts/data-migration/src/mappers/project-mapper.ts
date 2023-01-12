import MapperBase from "./mapper-base";
import FormDataBase from "../form-data/formdata-base";
import FormDetails from "../infrastructure/form-details";
import LookupRepository from "../infrastructure/lookup-repository";
import Sheetnames from "../infrastructure/sheetnames-const";
import { Project, ProjectFormData } from "../form-data/project-formdata";

export default class ProjectMapper extends MapperBase {
    private regions: any[] = [];
    private sectors: any[] = [];
    private subsectors: any[] = [];
    private proponents: any[] = [];
    private lookupRepository: LookupRepository;
    constructor(file: string, lookupRepository: LookupRepository) {
        super();
        this.file = file;
        this.lookupRepository = lookupRepository;
        this.schema = {
            'Name': {
                prop: 'name'
            },
            'Proponent': {
                prop: 'proponent',
            },
            'Sector': {
                prop: 'sector'
            },
            'Subsector': {
                prop: 'subsector'
            },
            'Description': {
                prop: 'description'
            },
            'Address': {
                prop: 'address'
            },
            'Latitude': {
                prop: 'latitude'
            },
            'Longitude': {
                prop: 'longitude'
            },
            'ENVRegion': {
                prop: 'env_region'
            },
            'FLNRORegion': {
                prop: 'flnro_region'
            },
            'Capital Investment': {
                prop: 'capital_investment'
            },
            'EPIC Guid': {
                prop: 'epic_guid'
            },
            'Abbreviation': {
                prop: 'abbreviation'
            },
            'EACertificate': {
                prop: 'abbreviation'
            },
            'Project Closed': {
                prop: 'project_closed'
            }
        };
        
    }
    async map(): Promise<FormDataBase[]> {
        await this.lookupRepository.init();
        this.sectors = this.lookupRepository.getDataBySheet(Sheetnames.SECTORS); 
        this.subsectors = this.lookupRepository.getDataBySheet(Sheetnames.SUBSECTORS); 
        this.regions = this.lookupRepository.getDataBySheet(Sheetnames.REGIONS); 
        this.proponents = this.lookupRepository.getDataBySheet(Sheetnames.PROPONETS);       
        let excelProjects = await this.mapFile(this.file, this.schema).catch(errors => {
            throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
        });
        let mapped_data:any[] = [];
        for(let project of excelProjects) {
            const sector = this.sectors.filter(p=> p.name === project.sector)[0];
            const subsector = this.subsectors.filter(p=> p.name === project.subsector)[0];
            const envRegion = this.regions.filter(p=> p.name === project.env_region && p.entity === 'ENV')[0];
            const flnroRegion = this.regions.filter(p=> p.name === project.flnro_region && p.entity === 'FLNR')[0];
            const proponent = this.proponents.filter(p=> p.name === project.proponent)[0];
            const projectData = new Project(
                project.name
                ,proponent.id
                ,sector.id
                ,subsector.id
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