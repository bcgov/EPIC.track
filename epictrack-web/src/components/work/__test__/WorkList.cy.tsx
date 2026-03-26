import { MemoryRouter as Router } from "react-router-dom";
import WorkList from "../WorkList";
import { faker } from "@faker-js/faker";
import { Work } from "models/work";
import { Staff } from "models/staff";
import {
  generateMockProject,
  mockStaffs,
} from "../../../../cypress/support/common";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";

let workCounter = 0;

export const generateFakePosition = () => {
  return {
    email: `${faker.string.alphanumeric(5)}@example.com`,
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
    id: faker.number.int() + workCounter,
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
    issue_notes: faker.lorem.sentence(),
    work_state: faker.lorem.word(),
    project_id: faker.number.int(),
    ministry_id: faker.number.int(),
    ea_act_id: faker.number.int(),
    eao_team_id: faker.number.int(),
    federal_involvement_id: faker.number.int(),
    responsible_epd_id: faker.number.int(),
    work_lead_id: faker.number.int(),
    work_type_id: faker.number.int(),
    current_work_phase_id: faker.number.int(),
    substitution_act_id: faker.number.int(),
    eac_decision_by_id: faker.number.int(),
    decision_by_id: faker.number.int(),
    decision_maker_position_id: faker.number.int(),
    start_date_locked: faker.datatype.boolean(),
    created_at: faker.date.past().toISOString(),
    anticipated_referral_date: faker.date.future().toISOString(),
    project: {
      created_at: faker.date.past().toISOString(),
      description: faker.lorem.paragraph(),
      address: faker.address.streetAddress(),
      abbreviation: faker.lorem.word(),
      type: { id: workCounter, name: faker.lorem.word() },
      sub_type: { id: workCounter, name: faker.lorem.word() },
      proponent: { id: workCounter, name: faker.company.buzzPhrase() },
      region_env: { id: workCounter, name: faker.address.state() },
      region_flnro: { id: workCounter, name: faker.address.state() },
      name: faker.lorem.word(),
      id: workCounter,
    },
    ministry: {
      id: workCounter,
      name: faker.company.buzzPhrase(),
      abbreviation: "",
      combined: "",
      minister: mockStaffs[workCounter - 1] as Staff,
      sort_order: workCounter,
      minister_id: 0,
      date_created: "",
      date_closed: "",
    },
    ea_act: { id: workCounter, name: faker.lorem.word() },
    eao_team: { id: workCounter, name: faker.lorem.word() },
    federal_involvement: { id: workCounter, name: faker.lorem.word() },
    responsible_epd: mockStaffs[workCounter - 1] as Staff,
    work_lead: mockStaffs[workCounter - 1] as Staff,
    work_type: { id: workCounter, name: faker.lorem.word() },
    current_work_phase: {
      id: workCounter,
      name: faker.lorem.word(),
      end_date: "",
      start_date: "",
      phase: { id: workCounter, name: faker.lorem.word() },
      milestone_progress: 0,
      next_milestone: "",
      is_completed: false,
      is_suspended: false,
      legislated: false,
      suspended_date: "",
      number_of_days: "",
    },
    substitution_act: { id: workCounter, name: faker.lorem.word() },
    eac_decision_by: mockStaffs[workCounter - 1] as Staff,
    decision_by: mockStaffs[workCounter - 1] as Staff,
  };
};

const work1 = generateMockWork();
const work2 = generateMockWork();
const works = [work1, work2];
const endpoints: Endpoint[] = [
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
    url: `${AppConfig.apiUrl}staffs?positions=1,2,8`,
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
      body: [generateMockProject()],
    },
  },
  {
    name: "checkWorkExists ",
    method: "GET",
    url: `${AppConfig.apiUrl}works/exists*`,
    response: {
      body: {
        exists: false,
      },
    },
  },
  {
    name: "getWorks",
    method: "GET",
    url: `${AppConfig.apiUrl}works`,
    response: { body: works },
  },
];

describe("WorkList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("should display the work list", () => {
    cy.mount(
      <Router>
        <WorkList />
      </Router>,
    );
    cy.get("table").should("exist").and("be.visible");
  });
});
