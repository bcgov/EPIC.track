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

//ensure projects are never the same by incrementing the counter
let projectCounter = 0;

const generateMockProject = (): Project => {
  projectCounter += 1;
  return {
    id: faker.datatype.number() + projectCounter,
    name: `${faker.commerce.productName()} ${projectCounter}`,
    sub_type: {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.commerce.productMaterial()} ${projectCounter}`,
      type: {} as ListType,
    },
    type: {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.commerce.product()} ${projectCounter}`,
    },
    is_active: faker.datatype.boolean(),
    description: `${faker.lorem.paragraph()} ${projectCounter}`,
    region_id_env: faker.datatype.number() + projectCounter,
    region_id_flnro: faker.datatype.number() + projectCounter,
    proponent_id: faker.datatype.number() + projectCounter,
    proponent: {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.company.name()} ${projectCounter}`,
      is_active: false,
    },
    ea_certificate: `${faker.system.fileName()} ${projectCounter}`,
    abbreviation: `${faker.lorem.word()} ${projectCounter}`,
    epic_guid: `${faker.datatype.uuid()} ${projectCounter}`,
    latitude: `${faker.address.latitude().toString()} ${projectCounter}`,
    longitude: `${faker.address.longitude().toString()} ${projectCounter}`,
    capital_investment: faker.datatype.number() + projectCounter,
    address: `${faker.address.streetAddress()} ${projectCounter}`,
    is_project_closed: faker.datatype.boolean(),
    region_env: {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.address.state()} ${projectCounter}`,
      entity: "",
    },
    region_flnro: {
      id: faker.datatype.number() + projectCounter,
      name: `${faker.address.state()} ${projectCounter}`,
      entity: "",
    },
    fte_positions_construction: faker.datatype.number() + projectCounter,
    fte_positions_operation: faker.datatype.number() + projectCounter,
  };
};

const project1 = generateMockProject();
const project2 = generateMockProject();

function createMockContext() {
  return {
    item: [project1, project2],
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: "",
    data: [project1, project2],
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

function testTableFiltering(tableHeaderName: string, propertyToTest: string) {
  cy.contains("div", tableHeaderName)
    .closest(".MuiTableCell-root")
    .then(($tableCell) => {
      // Within the table cell, find the div that includes 'indicatorContainer' in its class name
      cy.wrap($tableCell)
        .find("input:first")
        .click()
        .type(`${propertyToTest}{enter}`); // Type into the input field and press Enter

      cy.contains("button", "Apply").click();
    });
}

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
    cy.get(".MuiInputBase-root");
  });

  it("should filter the project list based on the project name input", () => {
    // Type a project name into the project name input field
    cy.get('input[placeholder="Project Name"][type="text"]').type(
      project1.name
    );

    // Check that the table contains a row for Project 1 and does not contain a row for Project 2
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");

    // Clear the project name input field and type a different project name
    cy.get('input[placeholder="Project Name"][type="text"]')
      .clear()
      .type(project2.name);

    // Check that the table contains a row for Project 2 and does not contain a row for Project 1
    cy.get("table").contains("tr", project2.name).should("be.visible");
    cy.get("table").contains("tr", project1.name).should("not.exist");
  });

  it("should find the table cell with the 'Type' div, find the div that includes 'indicatorContainer' in its class name, type into it, and check if the project list is filtering correctly", () => {
    testTableFiltering("Type", project1.type.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'Sub Type' div, find the div that includes 'indicatorContainer' in its class name, type into it, and check if the project list is filtering correctly", () => {
    testTableFiltering("Sub Type", project1.sub_type.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'Proponents' div, find the div that includes 'indicatorContainer' in its class name, type into it, and check if the project list is filtering correctly", () => {
    testTableFiltering("Proponents", project1.proponent.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'ENV Region' div, find the div that includes 'indicatorContainer' in its class name, type into it, and check if the project list is filtering correctly", () => {
    testTableFiltering("ENV Region", project1.region_env.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });
});
