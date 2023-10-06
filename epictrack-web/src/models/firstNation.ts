import { ListType } from "./code";
import { Staff } from "./staff";
import { MasterBase } from "./type";

export interface FirstNation extends ListType, MasterBase {
  is_active: boolean;
  relationship_holder_id?: number;
  relationship_holder?: Staff;
}

export interface WorkFirstNation extends MasterBase {
  indigenous_nation: FirstNation;
  work_id: number;
  is_active: boolean;
}
