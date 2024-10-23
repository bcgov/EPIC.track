import { ListType } from "./code";
import { FederalInvolvement } from "./federalInvolvement";
import { Ministry } from "./ministry";
import { Staff } from "./staff";
import { MasterBase } from "./type";

export interface Work extends MasterBase {
  id: number;
  title: string;
  simple_title: string;
  report_description: string;
  epic_description: string;
  is_cac_recommended: boolean;
  is_active: boolean;
  is_complete: boolean;
  is_high_priority: boolean;
  is_deleted: boolean;
  start_date: string;
  anticipated_decision_date: string;
  decision_date: string;
  work_decision_date: string;
  first_nation_notes: string;
  status_notes: string;
  issue_notes: string;
  work_state: string;

  project_id: number;
  ministry_id: number;
  ea_act_id: number;
  eao_team_id: number;
  federal_involvement_id: number;
  responsible_epd_id: number;
  work_lead_id: number;
  work_type_id?: number;
  current_work_phase_id: number;
  substitution_act_id: number;
  eac_decision_by_id: number;
  decision_by_id: number;
  decision_maker_position_id: number;
  start_date_locked: boolean;
  created_at: string;
  project: ListType & {
    created_at: string;
    description: string;
    address: string;
    abbreviation: string;
    type: ListType & { name: string };
    sub_type: ListType & { name: string };
    proponent: ListType & { name: string };
    region_env: ListType & { name: string };
    region_flnro: ListType & { name: string };
  };
  ministry: Ministry;
  ea_act: ListType;
  eao_team: ListType;
  federal_involvement: FederalInvolvement;
  responsible_epd: Staff;
  work_lead: Staff;
  work_type: ListType;
  current_work_phase: ListType;
  substitution_act: ListType;
  eac_decision_by: Staff;
  decision_by: Staff;
  anticipated_referral_date: string;
  indigenous_works?: {
    id: number;
    name: string;
  }[];
}

export interface WorkPhase extends MasterBase {
  end_date: string;
  start_date: string;
  name: string;
  phase: ListType;
  milestone_progress: number;
  next_milestone: string;
  is_completed: boolean;
  is_suspended: boolean;
  legislated: boolean;
  suspended_date: string;
  id: number;
  number_of_days: string;
}

export interface WorkPhaseAdditionalInfo {
  work_phase: WorkPhase;
  total_number_of_days: number;
  next_milestone: string;
  current_milestone: string;
  milestone_progress: number;
  days_left: number;
  is_last_phase: boolean;
}

export interface TemplateStatus extends MasterBase {
  template_available: boolean;
  task_added: boolean;
}

export const defaultWork = {
  is_active: true,
  report_description:
    "On [date], [initiator] submitted a [work type] to [rationale/desired result/description of change].",
};

export enum WorkStateEnum {
  SUSPENDED,
  IN_PROGRESS,
  WITHDRAWN,
  TERMINATED,
  CLOSED,
  COMPLETED,
}
