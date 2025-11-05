import { ROLES } from "constants/application-constant";
import WorkForm from "..";
import { faker } from "@faker-js/faker";
import { Provider } from "react-redux";
import { userDetails } from "services/userService/userSlice";
import { store } from "store";
import { UserDetail } from "services/userService/type";
import { AppConfig } from "config";
import {
  Endpoint,
  HttpMethod,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const generateFakePosition = () => {
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

const mockWorkType = {
  id: faker.number.int(),
  is_active: true,
  name: faker.lorem.word(),
  report_title: faker.lorem.lines(1),
  sort_order: faker.number.int(),
};

const mockProject = {
  id: faker.number.int(),
  name: faker.lorem.word(),
};

const endpoints: Endpoint[] = [
  {
    name: "getEaActs",
    method: "GET" as HttpMethod,
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
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}ministries`,
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
    name: "getWorkTypes",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}work-types`,
    response: {
      body: [mockWorkType],
    },
  },
  {
    name: "getFederalActs",
    method: "GET" as HttpMethod,
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
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}eao-teams`,
    response: {
      body: faker.lorem
        .words(10)
        .split(" ")
        .map((word) => ({
          id: faker.number.int(),
          is_active: true,
          name: word,
        })),
    },
  },
  {
    name: "getSubstitutionActs",
    method: "GET" as HttpMethod,
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
    name: "getStaffsPosition",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}staffs?positions*`,
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
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}projects?return_type=list_type`,
    response: {
      body: [mockProject],
    },
  },
  {
    name: "checkWorkExists",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}works/exists?title=*`,
    response: {
      body: {
        exists: false,
      },
    },
  },
  {
    name: "getProjectsAll",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}projects/*`,
    response: {
      body: {
        description: faker.lorem.paragraph(1),
      },
    },
  },
];

describe("WorkForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    store.dispatch(
      userDetails(
        new UserDetail(
          faker.word.words(1),
          faker.string.uuid(),
          [faker.word.words(1)],
          faker.person.firstName(),
          faker.person.lastName(),
          `${faker.string.alphanumeric(5)}@example.com`,
          faker.number.int(),
          faker.phone.number(),
          faker.person.jobTitle(),
          [ROLES.EDIT],
        ),
      ),
    );
  });

  it("renders the form", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>,
    );
    cy.get("form").should("be.visible");
  });

  it("The title is created from project name and work type", () => {
    cy.mount(
      <Provider store={store}>
        <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>,
    );
    cy.wait("@getWorkTypes").its("response.statusCode").should("eq", 200);
    cy.wait("@getProjectsListType")
      .its("response.statusCode")
      .should("eq", 200);

    // Find the input element for the worktype select and click first item
    cy.get("label")
      .contains("Worktype")
      .parent()
      .find("input")
      .first()
      .should("be.visible")
      .click({ force: true });
    cy.get("div")
      .contains(mockWorkType.name)
      .should("be.visible")
      .click({ force: true });

    // Find the input element for the project select and click first item
    cy.get("label")
      .contains("Project")
      .parent()
      .find("input")
      .first()
      .should("be.visible")
      .click({ force: true });
    cy.get("div")
      .contains(mockProject.name)
      .should("be.visible")
      .click({ force: true });

    // Check if the work title is created correctly
    cy.get("p")
      .contains(`${mockProject.name} - ${mockWorkType.name} -`)
      .should("be.visible");
  });
});
