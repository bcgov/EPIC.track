import { faker } from "@faker-js/faker";
import { ListType } from "models/code";
import { Ministry } from "models/ministry";
import { Staff } from "models/staff";
import { Work, WorkPhase, WorkPhaseAdditionalInfo } from "models/work";

export const generateMockStaff = (): Staff => ({
  id: faker.number.int(),
  phone: faker.phone.number(),
  email: faker.internet.email(),
  is_active: faker.datatype.boolean(),
  position_id: faker.number.int(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  full_name: faker.person.fullName(),
  position: {
    id: faker.number.int(),
    name: faker.lorem.word(),
    sort_order: faker.number.int(),
  },
});

export const generateMockProject = () => ({
  id: faker.number.int(),
  created_at: faker.date.recent().toISOString(),
  description: faker.lorem.sentence(),
  address: faker.location.streetAddress(),
  abbreviation: faker.lorem.word().toUpperCase(),
  type: {
    id: faker.number.int(),
    name: faker.lorem.word(),
    type: faker.lorem.word(),
  },
  sub_type: { id: faker.number.int(), name: faker.lorem.word() },
  proponent: { id: faker.number.int(), name: faker.lorem.word() },
  region_env: { id: faker.number.int(), name: faker.lorem.word() },
  region_flnro: { id: faker.number.int(), name: faker.lorem.word() },
  name: faker.lorem.word(),
});

export const generateMockMinistry = (): Ministry => ({
  id: faker.number.int(),
  name: faker.lorem.word(),
  minister: {
    id: faker.number.int(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    full_name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    is_active: faker.datatype.boolean(),
    position_id: faker.number.int(),
    position: {
      id: faker.number.int(),
      name: faker.lorem.word(),
      sort_order: faker.number.int(),
    },
  },
  abbreviation: faker.lorem.word(),
  combined: faker.lorem.word(),
});

export const generateMockListType = (): ListType => ({
  id: faker.number.int(),
  name: faker.lorem.word(),
});

export const generateMockWork = (): Work => ({
  decision_by: generateMockStaff(),
  responsible_epd: generateMockStaff(),
  work_lead: generateMockStaff(),
  eac_decision_by: generateMockStaff(),
  id: faker.number.int(),
  title: faker.lorem.word(),
  simple_title: faker.lorem.word(),
  report_description: faker.lorem.sentence(),
  epic_description: faker.lorem.sentence(),
  is_cac_recommended: faker.datatype.boolean(),
  is_active: faker.datatype.boolean(),
  is_complete: faker.datatype.boolean(),
  is_high_priority: faker.datatype.boolean(),
  is_deleted: faker.datatype.boolean(),
  start_date: faker.date.recent().toISOString(),
  anticipated_decision_date: faker.date.future().toISOString(),
  decision_date: faker.date.future().toISOString(),
  first_nation_notes: faker.lorem.sentence(),
  status_notes: faker.lorem.sentence(),
  work_state: faker.lorem.word(),
  project_id: faker.number.int(),
  ministry_id: faker.number.int(),
  ea_act_id: faker.number.int(),
  eao_team_id: faker.number.int(),
  federal_involvement_id: faker.number.int(),
  responsible_epd_id: faker.number.int(),
  work_lead_id: faker.number.int(),
  current_work_phase_id: faker.number.int(),
  substitution_act_id: faker.number.int(),
  eac_decision_by_id: faker.number.int(),
  decision_by_id: faker.number.int(),
  decision_maker_position_id: faker.number.int(),
  start_date_locked: faker.datatype.boolean(),
  created_at: faker.date.recent().toISOString(),
  project: generateMockProject(),
  ministry: generateMockMinistry(),
  ea_act: generateMockListType(),
  eao_team: generateMockListType(),
  federal_involvement: generateMockListType(),
  work_type: generateMockListType(),
  current_work_phase: generateMockListType(),
  substitution_act: generateMockListType(),
  indigenous_works: [generateMockListType(), generateMockListType()],
  work_decision_date: "",
  anticipated_referral_date: faker.date.future().toISOString(),
});

export const generateMockWorkPhase = (): WorkPhase => ({
  end_date: faker.date.future().toISOString(),
  start_date: faker.date.recent().toISOString(),
  name: faker.lorem.word(),
  phase: generateMockListType(),
  milestone_progress: faker.datatype.number(),
  next_milestone: faker.lorem.sentence(),
  is_completed: faker.datatype.boolean(),
  is_suspended: faker.datatype.boolean(),
  legislated: faker.datatype.boolean(),
  suspended_date: faker.date.future().toISOString(),
  id: faker.number.int(),
  number_of_days: String(faker.number.int()),
});

export const generateMockWorkPhaseAdditionalInfo =
  (): WorkPhaseAdditionalInfo => ({
    work_phase: generateMockWorkPhase(),
    total_number_of_days: faker.number.int(),
    next_milestone: faker.lorem.sentence(),
    current_milestone: faker.lorem.sentence(),
    milestone_progress: faker.datatype.number(),
    days_left: faker.number.int(),
    is_last_phase: faker.datatype.boolean(),
  });
