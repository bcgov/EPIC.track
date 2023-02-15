import FormDataBase from "./formdata-base";

export class IndigenousNationFormData extends FormDataBase {
    indigenous_nations: IndigenousNation;
    constructor(indigenousNation: IndigenousNation) {
        super();
        this.indigenous_nations = indigenousNation;
    }
}
export class IndigenousNation {
    id: string = "";
    name: string = "";
    responsible_epd_id: string = "";
    is_active: boolean = true;
    /**
     *
     */
    constructor(
        name: string
        , responsible_epd_id: string
    ) {
        this.name = name;
        this.responsible_epd_id = responsible_epd_id;
    }
}

module.exports = {
    IndigenousNationFormData
    , IndigenousNation
}