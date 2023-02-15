import FormDataBase from "./formdata-base";

export class ProjectFormData extends FormDataBase {
    projects: Project;
    constructor(project: Project){
        super();
        this.projects = project;
    }
}
export class Project {
    id: string = "";
    project_tracking_number: string;
    name: string = "";
    proponent_id: string = "";
    type_id: string = "";
    sub_type_id: string = "";
    description: string = "";
    address: string = "";
    latitude: string = "";
    longitude: string = "";
    location: string = "";
    region_id_env: string = "";
    region_id_flnro: string = "";
    capital_investment: string = "";
    epic_guid: string = "";
    abbreviation: string = "";
    ea_certificate: string = "";
    is_project_closed: boolean = false;
    /**
     *
     */
    constructor(
        project_tracking_number: string
        ,name: string
        ,proponent_id: string
        ,type_id: string
        ,sub_type_id: string
        ,description: string
        ,address: string
        ,latitude: string
        ,longitude: string
        ,location: string
        ,region_id_env: string
        ,region_id_flnro: string
        ,capital_investment: string
        ,epic_guid: string
        ,abbreviation: string
        ,ea_certificate: string
        ,is_project_closed: boolean) {
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
        this.region_id_flnro  = region_id_flnro;
        this.capital_investment = capital_investment;
        this.epic_guid = epic_guid;
        this.abbreviation = abbreviation;
        this.ea_certificate = ea_certificate;
        this.is_project_closed = is_project_closed;
    }
}

module.exports = {
    ProjectFormData
    ,Project
}