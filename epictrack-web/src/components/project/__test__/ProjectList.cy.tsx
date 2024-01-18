import { MemoryRouter as Router } from "react-router-dom";
import ProjectList from "../ProjectList";
import { Type } from "models/type";
import { SubType } from "models/subtype";
import { Region } from "models/region";
import { Proponent } from "models/proponent";
import { faker } from "@faker-js/faker";
import { Project } from "models/project";
import { ListType } from "models/code";
import { MasterContext } from "components/shared/MasterContext";

const mockProject: Project = {
  id: faker.datatype.number(),
  name: faker.commerce.productName(),
  sub_type: {
    id: faker.datatype.number(),
    name: faker.commerce.productMaterial(),
    type: {} as ListType,
  },
  type: { id: faker.datatype.number(), name: faker.commerce.product() },
  is_active: faker.datatype.boolean(),
  description: faker.lorem.paragraph(),
  region_id_env: faker.datatype.number(),
  region_id_flnro: faker.datatype.number(),
  proponent_id: faker.datatype.number(),
  proponent: {
    id: faker.datatype.number(),
    name: faker.company.name(),
    is_active: false,
  },
  ea_certificate: faker.system.fileName(),
  abbreviation: faker.lorem.word(),
  epic_guid: faker.datatype.uuid(),
  latitude: faker.address.latitude().toString(),
  longitude: faker.address.longitude().toString(),
  capital_investment: faker.datatype.number(),
  address: faker.address.streetAddress(),
  is_project_closed: faker.datatype.boolean(),
  region_env: {
    id: faker.datatype.number(),
    name: faker.address.state(),
    entity: "",
  },
  region_flnro: {
    id: faker.datatype.number(),
    name: faker.address.state(),
    entity: "",
  },
  fte_positions_construction: faker.datatype.number(),
  fte_positions_operation: faker.datatype.number(),
};

function createMockContext() {
  return {
    item: mockProject,
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: "",
    data: [mockProject],
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

export const defaultProject = {
  is_active: true,
  description:
    "[Proponent] proposes to develop the [Project name], a [project type] which would be located approximately [distance]km from [known near population centre/known near landmark] within the boundaries of [the QQQ Region]. The proposed project is anticipated to produce approximately [production yield] per year of [product], and would include [describe major project components].",
};

describe("ProjectList", () => {
  beforeEach(() => {
    // This assumes you have a route set up for your projects in your commands.js
    cy.mount(
      <Router>
        <MasterContext.Provider value={createMockContext()}>
          <ProjectList />
        </MasterContext.Provider>
      </Router>
    );
  });

  it("should display the project list", () => {
    // Select the table container
    cy.get(".MuiTableContainer-root.css-3i8oh7-MuiTableContainer-root").should(
      "be.visible"
    );

    // Select the first cell in the first row of the table within the container
    cy.get(
      ".MuiTableContainer-root.css-3i8oh7-MuiTableContainer-root tbody tr:first-child td:first-child"
    ).should("be.visible");

    // Click on the first cell in the first row of the table within the container
    cy.get(
      ".MuiTableContainer-root.css-3i8oh7-MuiTableContainer-root tbody tr:first-child td:first-child"
    ).click();
  });

  it("should have a horizontal scrollbar if the content overflows", () => {
    // Select the table container
    cy.get(".MuiTableContainer-root.css-3i8oh7-MuiTableContainer-root")
      .should("be.visible")
      .then(($table) => {
        // Check if the scrollWidth is greater than the clientWidth
        expect($table[0].scrollWidth).to.be.greaterThan($table[0].clientWidth);
      });
  });

  it("should display the create project button", () => {
    cy.get('[data-cy="create-project-button"]').should("be.visible");
  });

  // Add more tests as needed
});
