import { ListType } from "./code";
import { Staff } from "./staff";
import { MasterBase } from "./type";
import { PIPOrgType } from "./pipOrgType";

export interface FirstNation extends ListType, MasterBase {
  is_active: boolean;
  relationship_holder_id?: number;
  relationship_holder?: Staff;
  pip_link?: string;
  notes?: string;
  pip_org_type_id?: number;
  pip_org_type?: PIPOrgType;
}

export interface WorkFirstNation extends ListType, MasterBase {
  indigenous_nation: FirstNation;
  indigenous_nation_id: number;
  pin: string;
  work_id: number;
  is_active: boolean;
  status: string;
}
