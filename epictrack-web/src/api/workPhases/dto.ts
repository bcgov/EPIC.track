/** PhaseResponseSchema: a phase as configured for an EA act and work type. */
export interface TrackPhaseDto {
  id: number;
  name: string;
  work_type_id: number;
  ea_act_id: number;
  number_of_days: number;
  legislated: boolean;
  sort_order: number;
  color: string;
  visibility: string;
  is_active: boolean;
  ea_act?: { id: number; name: string };
  work_type?: { id: number; name: string };
}

/** WorkPhaseResponseSchema. */
export interface TrackWorkPhaseDto {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  work_id: number;
  phase_id: number;
  legislated: boolean;
  task_added: boolean;
  number_of_days: number;
  is_completed: boolean;
  is_suspended: boolean;
  suspended_date: string | null;
  sort_order: number;
  visibility: string;
  responsibility_notes: string | null;
  is_active: boolean;
  phase: TrackPhaseDto;
}

/** WorkPhaseEndEventResponseSchema. */
export interface TrackEndEventDto {
  name: string;
  actual_date: string;
  anticipated_date: string;
}

/** PhaseOverageResponsibilityResponseSchema; `responsibility` is the enum value. */
export interface TrackOverageResponsibilityDto {
  id: number;
  work_phase_id: number;
  responsibility: string;
  is_active: boolean;
}

/** PhaseOverageResponsibilityBodyRequestSchema; `responsibility` is the enum name. */
export interface TrackOverageResponsibilityWriteDto {
  work_phase_id: number;
  responsibility: string;
  work_id?: number;
}

/** WorkPhaseAdditionalInfoResponseSchema. */
export interface TrackWorkPhaseInfoDto {
  work_phase: TrackWorkPhaseDto;
  total_number_of_days: number;
  end_milestone: TrackEndEventDto | null;
  current_milestone: string;
  next_milestone: string;
  next_milestone_date: string;
  milestone_progress: number;
  decision_milestone: string;
  decision: string;
  decision_milestone_date: string;
  /** Sent as a number. */
  is_last_phase: number | boolean;
  days_left: number;
  days_taken: number;
  overage_responsibility?: TrackOverageResponsibilityDto[];
}

/** WorkPhaseTemplateAvailableResponse. */
export interface TrackTemplateStatusDto {
  template_available: boolean;
  task_added: boolean;
}
