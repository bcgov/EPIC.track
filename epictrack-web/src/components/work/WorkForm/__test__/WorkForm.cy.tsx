import { ROLES } from "constants/application-constant";
import WorkForm from "..";
import { faker } from "@faker-js/faker";
import { Provider } from "react-redux";
import { userDetails } from "services/userService/userSlice";
import { store } from "store";
import { UserDetail } from "services/userService/type";
import { AppConfig } from "config";
import { setupIntercepts } from "../../../../cypress/support/utils";

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

    cy.mount(
      <Provider store={store}>
        <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
      </Provider>
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("The title is created from project name and work type", () => {
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
});
