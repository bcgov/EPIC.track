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
        this.types = [];
        this.subtypes = [];
        this.proponents = [];
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
    map() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.lookupRepository.init();
            this.types = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.TYPES);
            this.subtypes = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.SUBTYPES);
            this.regions = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.REGIONS);
            this.proponents = this.lookupRepository.getDataBySheet(sheetnames_const_1.default.PROPONENTS);
            let excelProjects = yield this.mapFile(this.file, this.schema).catch(errors => {
                throw Error(`Schema mismatch. Make sure the given template is followed correctly. Error: ${JSON.stringify(errors)}`);
            });
            let mapped_data = [];
            let index = 1;
            for (let project of excelProjects) {
                console.log(index);
                const type = this.types.filter(p => p.name === project.type)[0];
                console.log(type);
                const subtype = this.subtypes.filter(p => p.name === project.subtype)[0];
                console.log(subtype);
                const envRegion = this.regions.filter(p => p.name === project.env_region && p.entity === 'ENV')[0];
                console.log(envRegion);
                const flnroRegion = this.regions.filter(p => p.name === project.flnro_region && p.entity === 'FLNR')[0];
                console.log(flnroRegion);
                const proponent = this.proponents.filter(p => p.name === project.proponent)[0];
                console.log(project.proponent);
                console.log(proponent);
                const projectData = new project_formdata_1.Project(project.project_tracking_number, project.name, proponent.id, type.id, subtype.id, project.description, project.address, project.latitude, project.longitude, `${project.latitude},${project.longitude}`, envRegion.id, flnroRegion.id, project.capital_investment, project.epic_guid, project.abbreviation, project.ea_certificate, project.project_closed);
                const projectFormData = new project_formdata_1.ProjectFormData(projectData);
                mapped_data.push({
                    data: projectFormData
                });
                index++;
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
