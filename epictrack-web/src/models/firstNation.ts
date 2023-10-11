import { ListType } from "./code";
import { Staff } from "./staff";
import { MasterBase } from "./type";

export interface FirstNation extends ListType, MasterBase {
  is_active: boolean;
  relationship_holder_id?: number;
  relationship_holder?: Staff;
  pip_link: string;
}

export interface WorkFirstNation extends ListType, MasterBase {
  indigenous_nation: FirstNation;
  indigenous_nation_id: number;
  pin: string;
  work_id: number;
  is_active: boolean;
  status: string;
}
