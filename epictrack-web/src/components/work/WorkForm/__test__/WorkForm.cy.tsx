import { ROLES } from "constants/application-constant";
import WorkForm from "..";
import { faker } from "@faker-js/faker";
import { Provider } from "react-redux";
import { userDetails } from "services/userService/userSlice";
import { store } from "store";
import { UserDetail } from "services/userService/type";
import { AppConfig } from "config";
import { setupIntercepts } from "../../../../../cypress/support/utils";
import { WORK_STATE } from "components/shared/constants";

const generateFakePosition = () => {
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

const mockWorkType = {
  id: faker.number.int(),
  name: faker.lorem.word(),
  report_title: faker.lorem.lines(1),
  sort_order: faker.number.int(),
};

const mockProject = {
  id: faker.number.int(),
  name: faker.lorem.word(),
};

const endpoints = [
  {
    name: "getEaActs",
    method: "GET",
    url: `${AppConfig.apiUrl}ea-acts`,
    response: {
      body: faker.lorem
        .words(10)
        .split(" ")
        .map((word) => ({
          id: faker.number.int(),
          name: word,
        })),
    },
  },
  {
    name: "getMinistries",
    method: "GET",
    url: `${AppConfig.apiUrl}ministries`,
    response: {
      body: faker.lorem
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
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work-types`,
    response: {
      body: [mockWorkType],
    },
  },
  {
    name: "getFederalActs",
    method: "GET",
    url: `${AppConfig.apiUrl}federal-involvements`,
    response: {
      body: faker.lorem
        .words(10)
        .split(" ")
        .map((word) => ({
          id: faker.number.int(),
          name: word,
        })),
    },
  },
  {
    name: "getEaoTeams",
    method: "GET",
    url: `${AppConfig.apiUrl}eao-teams`,
    response: {
      body: faker.lorem
        .words(10)
        .split(" ")
        .map((word) => ({
          id: faker.number.int(),
          name: word,
        })),
    },
  },
  {
    name: "getSubstitutionActs",
    method: "GET",
    url: `${AppConfig.apiUrl}substitution-acts`,
    response: {
      body: faker.lorem
        .words(10)
        .split(" ")
        .map((word) => ({
          id: faker.number.int(),
          name: word,
        })),
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
      body: {
        description: faker.lorem.paragraph(1),
      },
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
];

const mockWork = {
  id: faker.number.int(),
  title: faker.lorem.words(3),
  simple_title: faker.lorem.word(),
  report_description: faker.lorem.sentence(),
  epic_description: faker.lorem.sentence(),
  is_cac_recommended: false,
  is_active: true,
  is_complete: false,
  is_high_priority: false,
  is_deleted: false,
  start_date: faker.date.past().toISOString(),
  anticipated_decision_date: faker.date.future().toISOString(),
  decision_date: faker.date.future().toISOString(),
  work_decision_date: faker.date.future().toISOString(),
  first_nation_notes: faker.lorem.paragraph(),
  status_notes: faker.lorem.paragraph(),
  issue_notes: faker.lorem.sentence(),
  work_state: WORK_STATE.IN_PROGRESS.value,
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
    id: faker.number.int(),
    name: faker.lorem.words(2),
    created_at: faker.date.past().toISOString(),
    description: faker.lorem.sentence(),
    address: faker.lorem.word(),
    abbreviation: faker.lorem.word(),
    type: { id: faker.number.int(), name: faker.lorem.word() },
    sub_type: { id: faker.number.int(), name: faker.lorem.word() },
    proponent: { id: faker.number.int(), name: faker.lorem.word() },
    region_env: { id: faker.number.int(), name: faker.lorem.word() },
    region_flnro: { id: faker.number.int(), name: faker.lorem.word() },
  },
  ministry: {
    id: faker.number.int(),
    name: faker.lorem.word(),
    abbreviation: faker.lorem.word(),
    combined: faker.lorem.word(),
    minister: {
      id: faker.number.int(),
      idir_user_id: faker.lorem.word(),
      phone: faker.lorem.word(),
      email: faker.internet.email(),
      is_active: true,
      position_id: faker.number.int(),
      first_name: faker.lorem.word(),
      last_name: faker.lorem.word(),
      full_name: faker.lorem.word(),
      position: {
        id: faker.number.int(),
        name: faker.lorem.word(),
        sort_order: faker.number.int(),
      },
    },
    sort_order: 1,
  },
  ea_act: { id: faker.number.int(), name: faker.lorem.word() },
  eao_team: { id: faker.number.int(), name: faker.lorem.word() },
  federal_involvement: {
    id: faker.number.int(),
    name: faker.lorem.word(),
  },
  responsible_epd: {
    id: faker.number.int(),
    idir_user_id: faker.lorem.word(),
    phone: faker.lorem.word(),
    email: faker.internet.email(),
    is_active: true,
    position_id: faker.number.int(),
    first_name: faker.lorem.word(),
    last_name: faker.lorem.word(),
    full_name: faker.lorem.word(),
    position: {
      id: faker.number.int(),
      name: faker.lorem.word(),
      sort_order: faker.number.int(),
    },
  },
  work_lead: {
    id: faker.number.int(),
    idir_user_id: faker.lorem.word(),
    phone: faker.lorem.word(),
    email: faker.internet.email(),
    is_active: true,
    position_id: faker.number.int(),
    first_name: faker.lorem.word(),
    last_name: faker.lorem.word(),
    full_name: faker.lorem.word(),
    position: {
      id: faker.number.int(),
      name: faker.lorem.word(),
      sort_order: faker.number.int(),
    },
  },
  work_type: { id: faker.number.int(), name: faker.lorem.word() },
  current_work_phase: { id: faker.number.int(), name: faker.lorem.word() },
  substitution_act: { id: faker.number.int(), name: faker.lorem.word() },
  eac_decision_by: {
    id: faker.number.int(),
    idir_user_id: faker.lorem.word(),
    phone: faker.lorem.word(),
    email: faker.internet.email(),
    is_active: true,
    position_id: faker.number.int(),
    first_name: faker.lorem.word(),
    last_name: faker.lorem.word(),
    full_name: faker.lorem.word(),
    position: {
      id: faker.number.int(),
      name: faker.lorem.word(),
      sort_order: faker.number.int(),
    },
  },
  decision_by: {
    id: faker.number.int(),
    idir_user_id: faker.lorem.word(),
    phone: faker.lorem.word(),
    email: faker.internet.email(),
    is_active: true,
    position_id: faker.number.int(),
    first_name: faker.lorem.word(),
    last_name: faker.lorem.word(),
    full_name: faker.lorem.word(),
    position: {
      id: faker.number.int(),
      name: faker.lorem.word(),
      sort_order: faker.number.int(),
    },
  },
};

describe("WorkForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    store.dispatch(
      userDetails(
        new UserDetail(
          faker.word.words(1),
          faker.internet.userName(),
          [faker.word.words(1)],
          faker.person.firstName(),
          faker.person.lastName(),
          faker.internet.email(),
          faker.number.int(),
          faker.phone.number(),
          faker.person.jobTitle(),
          [ROLES.EDIT]
        )
      )
    );
  });

  it("renders the form", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>
    );
    cy.get("form").should("be.visible");
  });

  it("The title is created from project name and work type", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>
    );
    cy.wait("@getWorkTypes").its("response.statusCode").should("eq", 200);
    const workTypeSelect = cy
      .get("label")
      .contains("Worktype")
      .parent()
      .find("input")
      .first();
    workTypeSelect.should("be.visible");
    workTypeSelect.click({ force: true });
    const workTypeOption = cy.get("div").contains(mockWorkType.name);
    workTypeOption.should("be.visible");
    workTypeOption.click({ force: true });

    cy.wait("@getProjectsListType")
      .its("response.statusCode")
      .should("eq", 200);

    const projectSelect = cy
      .get("label")
      .contains("Project")
      .parent()
      .find("input")
      .first();
    projectSelect.should("be.visible");
    projectSelect.click({ force: true });
    const projectOption = cy.get("div").contains(mockProject.name);
    projectOption.should("be.visible");
    projectOption.click({ force: true });

    cy.get("p")
      .contains(`${mockProject.name} - ${mockWorkType.name} -`)
      .should("be.visible");
  });

  it("WorkType select should be disabled when a work exists", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={mockWork} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>
    );
    const workTypeSelect = cy
      .get("label")
      .contains("Worktype")
      .parent()
      .find("input")
      .first();
    workTypeSelect.should("have.attr", "disabled");
  });

  it("Project select should be disabled when a work exists", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={mockWork} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>
    );
    const projectSelect = cy
      .get("label")
      .contains("Project")
      .parent()
      .find("input")
      .first();
    projectSelect.should("have.attr", "disabled");
  });
});
