import { TrackWorkTypeDto } from "api/workTypes/dto";

interface TrackNamedDto {
  id: number;
  name: string;
}

/** A WorkPhaseAdditionalInfoResponseSchema row, limited to the dashboard's fields. */
export interface TrackPhaseInfoDto {
  work_phase: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_completed: boolean;
    phase: { color: string };
  };
  total_number_of_days: number;
  current_milestone: string;
  next_milestone: string;
  next_milestone_date: string;
  decision_milestone: string;
  decision: string;
  decision_milestone_date: string;
  milestone_progress: number;
  days_left: number;
}

/** StaffWorkRoleResponseSchema. */
export interface TrackStaffWorkRoleDto {
  id: number;
  work_id: number;
  staff_id: number;
  role_id: number;
  is_active: boolean;
  staff: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone: string;
    is_active: boolean;
    position_id: number;
    position: TrackNamedDto | null;
  };
  role: TrackNamedDto;
}

/** A works/dashboard item: WorkResponseSchema plus phase, status and staff info. */
export interface TrackWorkplanDto {
  id: number;
  title: string;
  simple_title: string;
  is_active: boolean;
  work_state: string;
  current_work_phase_id: number | null;
  work_type: TrackWorkTypeDto;
  federal_involvement: TrackNamedDto;
  eao_team: TrackNamedDto;
  project: { name: string };
  /** Missing when the work has no phases. */
  phase_info?: TrackPhaseInfoDto[];
  /** WorkStatusResponseSchema; `{}` when there is no approved status. */
  status_info: { posted_date?: string; description?: string };
  staff_info: TrackStaffWorkRoleDto[];
}

export interface TrackWorkplanPageDto {
  items: TrackWorkplanDto[];
  total: number;
}
