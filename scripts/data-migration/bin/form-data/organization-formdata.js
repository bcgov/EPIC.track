"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = exports.OrganizationFormData = void 0;
const formdata_base_1 = __importDefault(require("./formdata-base"));
class OrganizationFormData extends formdata_base_1.default {
    constructor(organization) {
        super();
        this.organizations = organization;
    }
}
exports.OrganizationFormData = OrganizationFormData;
class Organization {
    /**
     *
     */
    constructor(name, responsible_epd_id) {
        this.id = "";
        this.name = "";
        this.responsible_epd_id = "";
        this.is_active = true;
        this.name = name;
        this.responsible_epd_id = responsible_epd_id;
    }
}
exports.Organization = Organization;
module.exports = {
    OrganizationFormData,
    Organization
};
