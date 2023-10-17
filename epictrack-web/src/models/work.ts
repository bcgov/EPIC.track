import { ListType } from "./code";
import { Ministry } from "./ministry";
import { Staff } from "./staff";
import { MasterBase } from "./type";

export interface Work extends MasterBase {
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
  start_date: string;
  anticipated_decision_date: string;
  decision_date: string;
  first_nation_notes: string;

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
  decision_maker_position_id: number;

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

export interface WorkPhase extends MasterBase {
  end_date: string;
  start_date: string;
  phase: ListType;
  milestone_progress: number;
  next_milestone: string;
  is_completed: boolean;
  id: number;
  number_of_days: string;
}

export interface TemplateStatus extends MasterBase {
  template_available: boolean;
  task_added: boolean;
}
