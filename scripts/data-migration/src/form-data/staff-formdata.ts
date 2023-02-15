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
    first_name: string = "";
    last_name: string = "";
    phone: string = "";
    email: string = "";
    position_id: string = "";
    is_active: boolean = true;
    /**
     *
     */
    constructor(
        first_name: string
        , last_name: string
        , phone: string
        , email: string
        , position_id: string
    ) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone = phone;
        this.email = email;
        this.position_id = position_id;
    }
}

module.exports = {
    StaffFormData
    , Staff
}