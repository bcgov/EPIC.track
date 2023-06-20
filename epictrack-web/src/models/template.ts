import { WorkTombstone } from "./work";
import { ListType } from "./code";

export interface Template extends ListType{
    template_name: string;
    ea_act: ListType;
    work_type:ListType;
    phase:ListType;
    ea_act_id?: number;
    work_type_id?: number;
    phase_id?: number;
    template_file:BinaryData;
}