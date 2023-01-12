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
    name: string = "";
    proponent_id: string = "";
    sector_id: string = "";
    sub_sector_id: string = "";
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
    constructor(name: string
        ,proponent_id: string
        ,sector_id: string
        ,sub_sector_id: string
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
        this.proponent_id = proponent_id;
        this.sector_id = sector_id;
        this.sub_sector_id = sub_sector_id;
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