import Moment from "moment";
import { trackClient } from "apiManager/clients";
import { TrackWorkPhaseDto, TrackWorkPhaseInfoDto } from "api/workPhases/dto";
import { toWorkPhase, toWorkPhaseAdditionalInfo } from "api/workPhases/mapper";
import { ListType } from "models/code";
import { FederalInvolvement } from "models/federalInvolvement";
import { Ministry } from "models/ministry";
import { Staff } from "models/staff";
import { Work, WorkInput, WorkListItem, WorkOption } from "models/work";
import { WorksSource } from "./types";

interface TrackNamedDto {
  id: number;
  name: string;
}

/** WorkResponseSchema. */
export interface TrackWorkDto {
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
  work_type_id: number;
  current_work_phase_id: number;
  substitution_act_id: number;
  eac_decision_by_id: number;
  decision_by_id: number;
  decision_maker_position_id: number;
  start_date_locked: boolean;
  created_at: string;
  anticipated_referral_date: string;
  /** The full ProjectResponseSchema; only the ref is kept. */
  project: TrackNamedDto;
  ministry: Ministry;
  ea_act: ListType;
  eao_team: ListType;
  federal_involvement: FederalInvolvement;
  responsible_epd: Staff;
  work_lead: Staff;
  work_type: ListType;
  current_work_phase: TrackWorkPhaseDto | null;
  substitution_act: ListType;
  eac_decision_by: Staff;
  decision_by: Staff;
  indigenous_works?: TrackNamedDto[];
  rel_staff?: Staff[];
  work_phase_status?: TrackWorkPhaseInfoDto[];
}

// WorkBodyParameterSchema's fields; anything else is dropped.
const WRITABLE_FIELDS = [
  "simple_title",
  "report_description",
  "epic_description",
  "start_date",
  "ea_act_id",
  "work_type_id",
  "project_id",
  "ministry_id",
  "federal_involvement_id",
  "substitution_act_id",
  "eao_team_id",
  "responsible_epd_id",
  "work_lead_id",
  "decision_by_id",
  "is_active",
  "is_high_priority",
  "is_cac_recommended",
] as const satisfies readonly (keyof WorkInput)[];

export type TrackWorkWriteDto = Partial<
  Record<(typeof WRITABLE_FIELDS)[number], unknown>
>;

const named = (value: { name: string }) => ({ name: value.name });

const toRef = (dto: TrackNamedDto) => ({ id: dto.id, name: dto.name });

export const toWork = (dto: TrackWorkDto): Work => ({
  id: dto.id,
  title: dto.title,
  simple_title: dto.simple_title,
  report_description: dto.report_description,
  epic_description: dto.epic_description,
  is_cac_recommended: dto.is_cac_recommended,
  is_active: dto.is_active,
  is_completed: dto.is_completed,
  is_high_priority: dto.is_high_priority,
  start_date: dto.start_date,
  anticipated_decision_date: dto.anticipated_decision_date,
  decision_date: dto.decision_date,
  work_decision_date: dto.work_decision_date,
  first_nation_notes: dto.first_nation_notes,
  status_notes: dto.status_notes,
  issue_notes: dto.issue_notes,
  work_state: dto.work_state,
  project_id: dto.project_id,
  ministry_id: dto.ministry_id,
  ea_act_id: dto.ea_act_id,
  eao_team_id: dto.eao_team_id,
  federal_involvement_id: dto.federal_involvement_id,
  responsible_epd_id: dto.responsible_epd_id,
  work_lead_id: dto.work_lead_id,
  work_type_id: dto.work_type_id,
  current_work_phase_id: dto.current_work_phase_id,
  substitution_act_id: dto.substitution_act_id,
  eac_decision_by_id: dto.eac_decision_by_id,
  decision_by_id: dto.decision_by_id,
  decision_maker_position_id: dto.decision_maker_position_id,
  start_date_locked: dto.start_date_locked,
  created_at: dto.created_at,
  anticipated_referral_date: dto.anticipated_referral_date,
  project: toRef(dto.project),
  ministry: dto.ministry,
  ea_act: dto.ea_act,
  eao_team: dto.eao_team,
  federal_involvement: dto.federal_involvement,
  responsible_epd: dto.responsible_epd,
  work_lead: dto.work_lead,
  work_type: dto.work_type,
  current_work_phase:
    dto.current_work_phase && toWorkPhase(dto.current_work_phase),
  substitution_act: dto.substitution_act,
  eac_decision_by: dto.eac_decision_by,
  decision_by: dto.decision_by,
  indigenous_works: dto.indigenous_works,
  rel_staff: dto.rel_staff,
  work_phase_status: dto.work_phase_status?.map(toWorkPhaseAdditionalInfo),
});

export const toWorkListItem = (dto: TrackWorkDto): WorkListItem => ({
  id: dto.id,
  title: dto.title,
  is_active: dto.is_active,
  work_state: dto.work_state,
  project: toRef(dto.project),
  ea_act: named(dto.ea_act),
  work_type: named(dto.work_type),
  eao_team: named(dto.eao_team),
  current_work_phase: dto.current_work_phase
    ? named(dto.current_work_phase)
    : null,
});

export const toWorkWriteDto = (input: WorkInput): TrackWorkWriteDto => {
  const dto: TrackWorkWriteDto = {};
  WRITABLE_FIELDS.forEach((field) => {
    if (input[field] !== undefined) dto[field] = input[field];
  });
  if (input.start_date) dto.start_date = Moment(input.start_date).format();
  return dto;
};

export const trackWorksSource: WorksSource = {
  get: async (id) => toWork(await trackClient.get<TrackWorkDto>(`works/${id}`)),

  list: async () =>
    (await trackClient.get<TrackWorkDto[]>("works")).map(toWorkListItem),

  listOptions: async () =>
    (await trackClient.get<WorkOption[]>("works/options")).map((option) => ({
      id: option.id,
      title: option.title,
    })),

  create: async (input) =>
    toWork(
      await trackClient.post<TrackWorkDto>("works", toWorkWriteDto(input)),
    ),

  update: async (id, input) =>
    toWork(
      await trackClient.put<TrackWorkDto>(`works/${id}`, toWorkWriteDto(input)),
    ),

  checkExists: async (title, excludeId) => {
    const result = await trackClient.get<{ exists: boolean }>("works/exists", {
      params: { title, work_id: excludeId || undefined },
    });
    return result.exists;
  },
};
