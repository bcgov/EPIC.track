import { Proponent } from "./proponent";

export interface Project {
    id: number;
    project_name: string;
    type:string;
    subtype:string;
    is_active: boolean;
    description:string;
    region_env:string;
    region_flnro:string;
    proponent:Proponent;
    ea_certificate:string;
    abbreviation:string;
    epic_guid:string;
    location:string;
    capital_investment: Float32Array;
    address:Text;
    
}
