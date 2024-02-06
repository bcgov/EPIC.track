import { MasterContext } from "components/shared/MasterContext";
import { MasterBase } from "models/type";
import WorkForm from "..";
import { defaultWork } from "models/work";
import { faker } from "@faker-js/faker";

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
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/ea_acts",
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
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/ministries",
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
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/work_types",
    response: {
      body: {
        codes: [mockWorkType],
      },
    },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/federal_involvements",
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
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/eao_teams",
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
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/substitution_acts",
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
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?positions=4,3",
    response: {
      body: [generateFakePosition(), generateFakePosition()],
    },
  },
  {
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
    method: "GET",
    url: "http://localhost:3200/api/v1/projects?return_type=list_type",
    response: {
      body: [mockProject],
    },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?positions=3",
    response: {
      body: [generateFakePosition()],
    },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/projects/*",
    response: {
      body: {
        description: faker.lorem.paragraph(1),
      },
    },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/works/exists*",
    response: {
      body: {
        exists: false,
      },
    },
  },
];

function createMockContext() {
  return {
    item: defaultWork,
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: "",
    data: [] as MasterBase[],
    loading: false,
    setItem: cy.stub(),
    setShowDeleteDialog: cy.stub(),
    setShowModalForm: cy.stub(),
    getData: cy.stub(),
    setService: cy.stub(),
    setForm: cy.stub(),
    onDialogClose: cy.stub(),
    setFormStyle: cy.stub(),
    getById: cy.stub(),
    setDialogProps: cy.stub(),
  };
}
function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response }) => {
    cy.intercept(method, url, response);
  });
}

describe("WorkForm", () => {
  beforeEach(() => {
    const mockContext = createMockContext();
    setupIntercepts(endpoints);

    cy.mount(
      <MasterContext.Provider value={mockContext}>
        <WorkForm />
      </MasterContext.Provider>
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("The title is created from project name and work type", () => {
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
