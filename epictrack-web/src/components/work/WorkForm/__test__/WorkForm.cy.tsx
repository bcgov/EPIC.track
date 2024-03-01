import WorkForm from "..";
import { faker } from "@faker-js/faker";

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

const endpoints = [
  {
    name: "getEaActs",
    method: "GET",
    url: "http://localhost:3200/api/v1/ea-acts",
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
    url: "http://localhost:3200/api/v1/ministries",
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
    url: "http://localhost:3200/api/v1/work_types",
    response: {
      body: {
        codes: [mockWorkType],
      },
    },
  },
  {
    name: "getFederalActs",
    method: "GET",
    url: "http://localhost:3200/api/v1/federal-involvements",
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
    url: "http://localhost:3200/api/v1/eao-teams",
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
    url: "http://localhost:3200/api/v1/substitution-acts",
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
    url: "http://localhost:3200/api/v1/staffs?positions=4,3",
    response: {
      body: [generateFakePosition(), generateFakePosition()],
    },
  },
  {
    name: "getStaffs1And2And8",
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?positions=1,2,8",
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
    url: "http://localhost:3200/api/v1/projects?return_type=list_type",
    response: {
      body: [mockProject],
    },
  },
  {
    name: "getStaffsPosition3",
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?positions=3",
    response: {
      body: [generateFakePosition()],
    },
  },
  {
    name: "getProjectsAll",
    method: "GET",
    url: "http://localhost:3200/api/v1/projects/*",
    response: {
      body: {
        description: faker.lorem.paragraph(1),
      },
    },
  },
  {
    name: "checkWorkExists ",
    method: "GET",
    url: "http://localhost:3200/api/v1/works/exists*",
    response: {
      body: {
        exists: false,
      },
    },
  },
];

function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    cy.intercept(method, url, response).as(name);
  });
}

describe("WorkForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(
      <WorkForm work={null} fetchWork={cy.stub()} saveWork={cy.stub()} />
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
