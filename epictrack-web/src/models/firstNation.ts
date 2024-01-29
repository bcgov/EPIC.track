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

export type ConsultationLevel = {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
};

export interface WorkFirstNation extends ListType, MasterBase {
  indigenous_nation: FirstNation;
  indigenous_nation_id: number;
  indigenous_consultation_level: ConsultationLevel;
  consultation_level_id: number;
  work_id: number;
  is_active: boolean;
  status: string;
}

export const defaultFirstNation = {
  is_active: true,
};
