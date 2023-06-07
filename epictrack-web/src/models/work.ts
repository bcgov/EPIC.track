import { ListType } from "./code";
import { Ministry } from "./ministry";
import { Staff } from "./staff";

export interface WorkTombstone {
  id: number;
  title: string;
  short_description: string;
  long_description: string;
  is_pecp_required: boolean;
  is_cac_recommended: boolean;
  is_active: boolean;
  is_complete: boolean;
  is_watched: boolean;
  is_deleted: boolean;
  start_date: Date;
  anticipated_decision_date: string;
  decision_date: string;

  project_id: number;
  ministry_id: number;
  ea_act_id: number;
  eao_team_id: number;
  federal_involvement_id: number;
  responsible_epd_id: number;
  work_lead_id: number;
  work_type_id?: number;
  current_phase_id: number;
  substitution_act_id: number;
  eac_decision_by_id: number;
  decision_by_id: number;

  project: ListType;
  ministry: Ministry;
  ea_act: ListType;
  eao_team: ListType;
  federal_involvement: ListType;
  responsible_epd: Staff;
  work_lead: Staff;
  work_type: ListType;
  current_phase: ListType;
  substitution_act: ListType;
  eac_decision_by: Staff;
  decision_by: Staff;
}
