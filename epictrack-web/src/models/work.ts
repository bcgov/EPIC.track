import { ListType } from "./code";
import { FederalInvolvement } from "./federalInvolvement";
import { Ministry } from "./ministry";
import { PhaseOverageResponsibility } from "./phaseOverageResponsibilities";
import { Staff } from "./staff";
import { MasterBase } from "./type";
import { ProjectRef } from "./project";

export interface Work extends MasterBase {
  id: number;
  title: string;
  simple_title: string;
  report_description: string;
  epic_description: string;
  is_cac_recommended: boolean;
  is_active: boolean;
  is_completed: boolean;
  is_high_priority: boolean;
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
  /** Details come from useProjectSummary(project_id). */
  project: ProjectRef;
  ministry: Ministry;
  ea_act: ListType;
  eao_team: ListType;
  federal_involvement: FederalInvolvement;
  responsible_epd: Staff;
  work_lead: Staff;
  work_type: ListType;
  current_work_phase: WorkPhase | null;
  substitution_act: ListType;
  eac_decision_by: Staff;
  decision_by: Staff;
  anticipated_referral_date: string;
  indigenous_works?: {
    id: number;
    name: string;
  }[];
  rel_staff?: Staff[];
  work_phase_status?: WorkPhaseAdditionalInfo[];
}

export interface WorkListItem {
  id: number;
  title: string;
  is_active: boolean;
  work_state: string;
  project: ProjectRef;
  ea_act: { name: string };
  work_type: { name: string };
  eao_team: { name: string };
  current_work_phase: { name: string } | null;
}

export interface WorkOption {
  id: number;
  title: string;
}

export interface WorkInput {
  simple_title?: string;
  report_description?: string;
  epic_description?: string | null;
  start_date?: string | Date;
  ea_act_id?: number;
  work_type_id?: number;
  project_id?: number;
  ministry_id?: number;
  federal_involvement_id?: number;
  substitution_act_id?: number | null;
  eao_team_id?: number | null;
  responsible_epd_id?: number | null;
  work_lead_id?: number | null;
  decision_by_id?: number | null;
  is_active?: boolean;
  is_high_priority?: boolean;
  is_cac_recommended?: boolean;
}

export interface WorkPhase {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  phase: ListType;
  is_completed: boolean;
  is_suspended: boolean;
  legislated: boolean;
  suspended_date: string | null;
  number_of_days: number;
  responsibility_notes?: string | null;
  /** An overage in this phase needs a responsibility before the phase can complete. */
  requires_overage_responsibility: boolean;
}

export interface EndEvent {
  actual_date: string;
  anticipated_date: string;
  name: string;
}

export interface WorkPhaseAdditionalInfo {
  current_milestone: string;
  days_left: number;
  days_taken: number;
  end_milestone: EndEvent | null;
  is_last_phase: boolean;
  milestone_progress: number;
  next_milestone: string;
  total_number_of_days: number;
  work_phase: WorkPhase;
  overage_responsibility?: PhaseOverageResponsibility[];
}

export interface TemplateStatus {
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

export interface WorkPhaseInsight {
  work_id: number;
  work_type_id: number;
  work_phase_id: number;
  work_title: string;
  work_type_name: string;
  phase_name: string;
  phase_id: number;
  work_phase_start_date: string;
  work_phase_end_date: string;
  ea_act_name: string;
  phase_overage_responsibilities: string[];
  total_days: number;
  days_taken: number;
  days_left: number;
  legislated_length: number;
  days_over: number;
  work_is_active: boolean;
}
