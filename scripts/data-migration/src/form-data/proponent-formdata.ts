import FormDataBase from "./formdata-base";

export class ProponentFormData extends FormDataBase {
    proponents: Proponent;
    constructor(proponent: Proponent){
        super();
        this.proponents = proponent;
    }
}
export class Proponent {
    id: string = "";
    name: string = "";
    relationship_holder_id: string = "";
    is_active: boolean = true;
    /**
     *
     */
    constructor(name: string, relationship_holder_id: string) {
        this.name = name;
        this.relationship_holder_id = relationship_holder_id;
    }
}

module.exports = {
    ProponentFormData
    ,Proponent
}