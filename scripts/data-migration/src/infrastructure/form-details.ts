export default class FormDetails {
    file: string;
    type: string;
    form: string;
    /**
     *
     */
    constructor(file: string, type: string, form: string) {
        this.file = file;
        this.type = type;
        this.form = form;
    }
}