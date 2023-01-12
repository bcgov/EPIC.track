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
const sheetnames_const_1 = __importDefault(require("../infrastructure/sheetnames-const"));
const project_formdata_1 = require("../form-data/project-formdata");
class ProjectMapper extends mapper_base_1.default {
    constructor(file, lookupRepository) {
        super();
        this.regions = [];
        this.sectors = [];
        this.subsectors = [];
        this.proponents = [];
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
    map() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lookupRepository.init();
            this.sectors = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.SECTORS);
            this.subsectors = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.SUBSECTORS);
            this.regions = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.REGIONS);
            this.proponents = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.PROPONETS);
            let excelProjects = yield this.mapFile(this.file, this.schema).catch(errors => {
                throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
            });
            let mapped_data = [];
            for (let project of excelProjects) {
                const sector = this.sectors.filter(p => p.name === project.sector)[0];
                const subsector = this.subsectors.filter(p => p.name === project.subsector)[0];
                const envRegion = this.regions.filter(p => p.name === project.env_region && p.entity === 'ENV')[0];
                const flnroRegion = this.regions.filter(p => p.name === project.flnro_region && p.entity === 'FLNR')[0];
                const proponent = this.proponents.filter(p => p.name === project.proponent)[0];
                const projectData = new project_formdata_1.Project(project.name, proponent.id, sector.id, subsector.id, project.description, project.address, project.latitude, project.longitude, `${project.latitude},${project.longitude}`, envRegion.id, flnroRegion.id, project.capital_investment, project.epic_guid, project.abbreviation, project.ea_certificate, project.project_closed);
                const projectFormData = new project_formdata_1.ProjectFormData(projectData);
                mapped_data.push({
                    data: projectFormData
                });
            }
            console.log('Project mapped data', JSON.stringify(mapped_data));
            return mapped_data;
        });
    }
    getFormDetails() {
        return {
            file: this.file,
            type: 'project',
            form: 'project'
        };
    }
}
exports.default = ProjectMapper;
