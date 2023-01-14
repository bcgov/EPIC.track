import FormDataBase from "./formdata-base";

export class StaffFormData extends FormDataBase {
    staffs: Staff;
    constructor(staff: Staff) {
        super();
        this.staffs = staff;
    }
}
export class Staff {
    id: string = "";
    firstname: string = "";
    lastname: string = "";
    phone: string = "";
    email: string = "";
    position_id: string = "";
    is_active: boolean = true;
    /**
     *
     */
    constructor(
        firstname: string
        , lastname: string
        , phone: string
        , email: string
        , position_id: string
    ) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.email = email;
        this.position_id = position_id;
    }
}

module.exports = {
    StaffFormData
    , Staff
}