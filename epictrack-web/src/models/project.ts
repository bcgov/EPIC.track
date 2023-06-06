import { Proponent } from "./proponent";
import { ListType } from "./code";
import { type } from "./type";
import { subtype } from "./subtype";

export interface Project {
    id: number;
    name: string;
    sub_type:subtype;
    sub_type_id:number;
    type: type;
    is_active: boolean;
    description:string;
    region_id_env:number;
    region_id_flnro:number;
    proponent_id:Proponent;
    ea_certificate:string;
    abbreviation:string;
    epic_guid:string;
    location:string;
    capital_investment: Float;
    address:Text;
    is_project_closed:boolean;
    region_env:ListType;
    region_flnro:ListType;
}
