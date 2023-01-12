import FormDataBase from "./formdata-base";

export class OrganizationFormData extends FormDataBase {
    organizations: Organization;
    constructor(organization: Organization){
        super();
        this.organizations = organization;
    }
}
export class Organization {
    id: string = "";
    name: string = "";
    responsible_epd_id: string = "";
    is_active: boolean = true;
    /**
     *
     */
    constructor(name: string, responsible_epd_id: string) {
        this.name = name;
        this.responsible_epd_id = responsible_epd_id;
    }
}

module.exports = {
    OrganizationFormData
    ,Organization
}