"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectFormData = void 0;
const formdata_base_1 = __importDefault(require("./formdata-base"));
class ProjectFormData extends formdata_base_1.default {
    constructor(project) {
        super();
        this.projects = project;
    }
}
exports.ProjectFormData = ProjectFormData;
class Project {
    /**
     *
     */
    constructor(project_tracking_number, name, proponent_id, type_id, sub_type_id, description, address, latitude, longitude, location, region_id_env, region_id_flnro, capital_investment, epic_guid, abbreviation, ea_certificate, is_project_closed) {
        this.id = "";
        this.name = "";
        this.proponent_id = "";
        this.type_id = "";
        this.sub_type_id = "";
        this.description = "";
        this.address = "";
        this.latitude = "";
        this.longitude = "";
        this.location = "";
        this.region_id_env = "";
        this.region_id_flnro = "";
        this.capital_investment = "";
        this.epic_guid = "";
        this.abbreviation = "";
        this.ea_certificate = "";
        this.is_project_closed = false;
        this.name = name;
        this.project_tracking_number = project_tracking_number;
        this.proponent_id = proponent_id;
        this.type_id = type_id;
        this.sub_type_id = sub_type_id;
        this.description = description;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.location = location;
        this.region_id_env = region_id_env;
        this.region_id_flnro = region_id_flnro;
        this.capital_investment = capital_investment;
        this.epic_guid = epic_guid;
        this.abbreviation = abbreviation;
        this.ea_certificate = ea_certificate;
        this.is_project_closed = is_project_closed;
    }
}
exports.Project = Project;
module.exports = {
    ProjectFormData,
    Project
};
