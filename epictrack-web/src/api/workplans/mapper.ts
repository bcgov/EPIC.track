import { PhaseInfo, WorkPlan, WorkPlanStaff } from "models/workplan";
import {
  TrackPhaseInfoDto,
  TrackStaffWorkRoleDto,
  TrackWorkplanDto,
} from "./dto";

export const toPhaseInfo = (dto: TrackPhaseInfoDto): PhaseInfo => ({
  work_phase: {
    id: dto.work_phase.id,
    name: dto.work_phase.name,
    start_date: dto.work_phase.start_date,
    end_date: dto.work_phase.end_date,
    is_completed: dto.work_phase.is_completed,
    phase: { color: dto.work_phase.phase.color },
  },
  total_number_of_days: dto.total_number_of_days,
  current_milestone: dto.current_milestone,
  next_milestone: dto.next_milestone,
  next_milestone_date: dto.next_milestone_date,
  decision_milestone: dto.decision_milestone,
  decision: dto.decision,
  decision_milestone_date: dto.decision_milestone_date,
  milestone_progress: dto.milestone_progress,
  days_left: dto.days_left,
});

export const toWorkPlanStaff = (dto: TrackStaffWorkRoleDto): WorkPlanStaff => ({
  id: dto.id,
  staff: {
    id: dto.staff.id,
    first_name: dto.staff.first_name,
    last_name: dto.staff.last_name,
    full_name: dto.staff.full_name,
    email: dto.staff.email,
    phone: dto.staff.phone,
    position: dto.staff.position && { name: dto.staff.position.name },
  },
  role: { name: dto.role.name },
});

export const toWorkPlan = (dto: TrackWorkplanDto): WorkPlan => ({
  id: dto.id,
  title: dto.title,
  simple_title: dto.simple_title,
  is_active: dto.is_active,
  work_state: dto.work_state,
  current_work_phase_id: dto.current_work_phase_id,
  work_type: { id: dto.work_type.id, name: dto.work_type.name },
  federal_involvement: { name: dto.federal_involvement.name },
  eao_team: { name: dto.eao_team.name },
  project: { name: dto.project.name },
  phase_info: (dto.phase_info ?? []).map(toPhaseInfo),
  status_info: {
    posted_date: dto.status_info?.posted_date,
    description: dto.status_info?.description,
  },
  staff_info: dto.staff_info.map(toWorkPlanStaff),
});
