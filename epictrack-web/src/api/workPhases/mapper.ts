import { ListType } from "models/code";
import {
  OverageResponsibilityEnum,
  OverageResponsibilityInput,
  OverageResponsibilityLookup,
  PhaseOverageResponsibility,
} from "models/phaseOverageResponsibilities";
import {
  TemplateStatus,
  WorkPhase,
  WorkPhaseAdditionalInfo,
} from "models/work";
import {
  TrackOverageResponsibilityDto,
  TrackOverageResponsibilityWriteDto,
  TrackPhaseDto,
  TrackTemplateStatusDto,
  TrackWorkPhaseDto,
  TrackWorkPhaseInfoDto,
} from "./dto";

export const toPhaseCode = (dto: TrackPhaseDto): ListType => ({
  id: dto.id,
  name: dto.name,
});

export const toWorkPhase = (dto: TrackWorkPhaseDto): WorkPhase => ({
  id: dto.id,
  name: dto.name,
  start_date: dto.start_date,
  end_date: dto.end_date,
  phase: toPhaseCode(dto.phase),
  is_completed: dto.is_completed,
  is_suspended: dto.is_suspended,
  legislated: dto.legislated,
  suspended_date: dto.suspended_date,
  number_of_days: dto.number_of_days,
  responsibility_notes: dto.responsibility_notes,
});

export const toOverageResponsibility = (
  dto: TrackOverageResponsibilityDto,
): PhaseOverageResponsibility => ({
  id: dto.id,
  work_phase_id: dto.work_phase_id,
  responsibility: dto.responsibility as OverageResponsibilityEnum,
  is_active: dto.is_active,
});

export const toWorkPhaseAdditionalInfo = (
  dto: TrackWorkPhaseInfoDto,
): WorkPhaseAdditionalInfo => ({
  work_phase: toWorkPhase(dto.work_phase),
  total_number_of_days: dto.total_number_of_days,
  end_milestone: dto.end_milestone && {
    name: dto.end_milestone.name,
    actual_date: dto.end_milestone.actual_date,
    anticipated_date: dto.end_milestone.anticipated_date,
  },
  current_milestone: dto.current_milestone,
  next_milestone: dto.next_milestone,
  milestone_progress: dto.milestone_progress,
  is_last_phase: Boolean(dto.is_last_phase),
  days_left: dto.days_left,
  days_taken: dto.days_taken,
  overage_responsibility: dto.overage_responsibility?.map(
    toOverageResponsibility,
  ),
});

export const toTemplateStatus = (
  dto: TrackTemplateStatusDto,
): TemplateStatus => ({
  template_available: dto.template_available,
  task_added: dto.task_added,
});

// The API takes the enum name ("PROPONENT") and returns the value ("Proponent").
export const toOverageResponsibilityWriteDto = (
  input: OverageResponsibilityInput,
): TrackOverageResponsibilityWriteDto => ({
  work_phase_id: input.work_phase_id,
  responsibility: OverageResponsibilityLookup[input.responsibility],
  work_id: input.work_id,
});
