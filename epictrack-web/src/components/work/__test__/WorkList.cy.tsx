import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import WorkList from "../WorkList";
import { faker } from "@faker-js/faker";
import { Work } from "models/work";
import { Staff } from "models/staff";
import {
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";

let workCounter = 0;

export const generateFakePosition = () => {
  return {
    email: faker.internet.email(),
    first_name: faker.person.firstName(),
    full_name: faker.person.fullName(),
    id: faker.number.int(),
    is_active: true,
    last_name: faker.person.lastName(),
    phone: faker.phone.number(),
    position: {
      id: faker.number.int(),
      is_active: true,
      name: faker.person.jobTitle(),
      sort_order: faker.number.int(),
    },
    position_id: faker.number.int(),
  };
};

export const mockWorkType = {
  id: faker.number.int(),
  name: faker.lorem.word(),
  report_title: faker.lorem.lines(1),
  sort_order: faker.number.int(),
};

export const mockProject = {
  id: faker.number.int(),
  name: faker.lorem.word(),
};
const generateMockWork = (): Work => {
  workCounter += 1;
  return {
    id: faker.datatype.number() + workCounter,
    title: `${faker.commerce.productName()} ${workCounter}`,
    simple_title: faker.commerce.productName(),
    report_description: faker.lorem.paragraph(),
    epic_description: faker.lorem.paragraph(),
    is_cac_recommended: faker.datatype.boolean(),
    is_active: faker.datatype.boolean(),
    is_complete: faker.datatype.boolean(),
    is_high_priority: faker.datatype.boolean(),
    is_deleted: faker.datatype.boolean(),
    start_date: faker.date.past().toISOString(),
    anticipated_decision_date: faker.date.future().toISOString(),
    decision_date: faker.date.future().toISOString(),
    work_decision_date: faker.date.future().toISOString(),
    first_nation_notes: faker.lorem.paragraph(),
    status_notes: faker.lorem.paragraph(),
    work_state: faker.random.word(),
    project_id: faker.datatype.number(),
    ministry_id: faker.datatype.number(),
    ea_act_id: faker.datatype.number(),
    eao_team_id: faker.datatype.number(),
    federal_involvement_id: faker.datatype.number(),
    responsible_epd_id: faker.datatype.number(),
    work_lead_id: faker.datatype.number(),
    work_type_id: faker.datatype.number(),
    current_work_phase_id: faker.datatype.number(),
    substitution_act_id: faker.datatype.number(),
    eac_decision_by_id: faker.datatype.number(),
    decision_by_id: faker.datatype.number(),
    decision_maker_position_id: faker.datatype.number(),
    start_date_locked: faker.datatype.boolean(),
    created_at: faker.date.past().toISOString(),
    anticipated_referral_date: faker.date.future().toISOString(),
    project: {
      created_at: faker.date.past().toISOString(),
      description: faker.lorem.paragraph(),
      address: faker.address.streetAddress(),
      abbreviation: faker.random.word(),
      type: { id: workCounter, name: faker.random.word() },
      sub_type: { id: workCounter, name: faker.random.word() },
      proponent: { id: workCounter, name: faker.company.buzzPhrase() },
      region_env: { id: workCounter, name: faker.address.state() },
      region_flnro: { id: workCounter, name: faker.address.state() },
      name: faker.random.word(),
      id: workCounter,
    },
    ministry: {
      id: workCounter,
      name: faker.company.buzzPhrase(),
      abbreviation: "",
      combined: "",
      minister: mockStaffs[workCounter - 1] as Staff,
      sort_order: workCounter,
    },
    ea_act: { id: workCounter, name: faker.random.word() },
    eao_team: { id: workCounter, name: faker.random.word() },
    federal_involvement: { id: workCounter, name: faker.random.word() },
    responsible_epd: mockStaffs[workCounter - 1] as Staff,
    work_lead: mockStaffs[workCounter - 1] as Staff,
    work_type: { id: workCounter, name: faker.random.word() },
    current_work_phase: { id: workCounter, name: faker.random.word() },
    substitution_act: { id: workCounter, name: faker.random.word() },
    eac_decision_by: mockStaffs[workCounter - 1] as Staff,
    decision_by: mockStaffs[workCounter - 1] as Staff,
  };
};

const work1 = generateMockWork();
const work2 = generateMockWork();
const works = [work1, work2];
const endpoints = [
  {
    name: "getEaActs",
    method: "GET",
    url: `${AppConfig.apiUrl}ea-acts`,
    response: {
      body: {
        codes: faker.lorem
          .words(10)
          .split(" ")
          .map((word) => ({
            id: faker.number.int(),
            name: word,
          })),
      },
    },
  },
  {
    name: "getMinistries",
    method: "GET",
    url: `${AppConfig.apiUrl}ministries`,
    response: {
      body: {
        codes: faker.lorem
          .words(10)
          .split(" ")
          .map((word) => ({
            id: faker.number.int(),
            name: word,
            minister: null,
            abbreviation: word,
            combined: word,
          })),
      },
    },
  },
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work_types`,
    response: {
      body: {
        codes: [mockWorkType],
      },
    },
  },
  {
    name: "getFederalActs",
    method: "GET",
    url: `${AppConfig.apiUrl}federal-involvements`,
    response: {
      body: {
        codes: faker.lorem
          .words(10)
          .split(" ")
          .map((word) => ({
            id: faker.number.int(),
            name: word,
          })),
      },
    },
  },
  {
    name: "getEaoTeams",
    method: "GET",
    url: `${AppConfig.apiUrl}eao-teams`,
    response: {
      body: {
        codes: faker.lorem
          .words(10)
          .split(" ")
          .map((word) => ({
            id: faker.number.int(),
            name: word,
          })),
      },
    },
  },
  {
    name: "getSubstitutionActs",
    method: "GET",
    url: `${AppConfig.apiUrl}substitution-acts`,
    response: {
      body: {
        codes: faker.lorem
          .words(10)
          .split(" ")
          .map((word) => ({
            id: faker.number.int(),
            name: word,
          })),
      },
    },
  },
  {
    name: "getStaffs4And3",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?positions=4,3`,
    response: {
      body: [generateFakePosition(), generateFakePosition()],
    },
  },
  {
    name: "getStaffs1And2And8",
    method: "GET",
    url: "${AppConfig.apiUrl}staffs?positions=1,2,8",
    response: {
      body: [
        generateFakePosition(),
        generateFakePosition(),
        generateFakePosition(),
      ],
    },
  },
  {
    name: "getProjectsListType",
    method: "GET",
    url: `${AppConfig.apiUrl}projects?return_type=list_type`,
    response: {
      body: [mockProject],
    },
  },
  {
    name: "getStaffsPosition3",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?positions=3`,
    response: {
      body: [generateFakePosition()],
    },
  },
  {
    name: "getProjectsAll",
    method: "GET",
    url: `${AppConfig.apiUrl}projects/*`,
    response: {
      body: {
        description: faker.lorem.paragraph(1),
      },
    },
  },
  {
    name: "checkWorkExists ",
    method: "GET",
    url: "${AppConfig.apiUrl}works/exists*",
    response: {
      body: {
        exists: false,
      },
    },
  },
  {
    name: "getWorks",
    method: "GET",
    url: "${AppConfig.apiUrl}works",
    response: { body: works },
  },
];

describe("WorkList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <WorkList />
      </Router>
    );
  });

  it("should display the work list", () => {
    cy.get(".MuiInputBase-root");
  });
});
