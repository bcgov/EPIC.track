import { MemoryRouter as Router } from "react-router-dom";
import ProjectList from "../ProjectList";
import { generateMockProject } from "../../../../cypress/support/common";

const project1 = generateMockProject();
const project2 = generateMockProject();
const projects = [project1, project2];

function testTableFiltering(tableHeaderName: string, propertyToTest: string) {
  cy.contains("div", tableHeaderName)
    .closest(".MuiTableCell-root")
    .then(($tableCell) => {
      // Within the table cell, find the div that includes 'the property to test' in its class name
      cy.wrap($tableCell)
        .find("input:first")
        .click()
        .type(`${propertyToTest}{enter}`); // Type into the input field and press Enter

      cy.contains("button", "Apply").click();
    });
}

const endpoints = [
  {
    name: "getProjectsListType",
    method: "GET",
    url: "http://localhost:3200/api/v1/projects",
    response: {
      body: projects,
    },
  },
];

function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    cy.intercept(method, url, response).as(name);
  });
}

describe("ProjectList", () => {
  beforeEach(() => {
    // This assumes you have a route set up for your projects in your commands.js
    setupIntercepts(endpoints);
    cy.mount(
      <Router>
        <ProjectList />
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

  it("should find the table cell with the 'Type' div, find the div that includes the project type and filter accordingly", () => {
    testTableFiltering("Type", project1.type.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'Sub Type' div, find the div that includes the sub type and filter accordingly", () => {
    testTableFiltering("Sub Type", project1.sub_type.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'Proponents' div, find the div that includes the proponent name and filter accordingly", () => {
    testTableFiltering("Proponents", project1.proponent.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });

  it("should find the table cell with the 'ENV Region' div, find the div that includes the env region and filter accordingly", () => {
    testTableFiltering("ENV Region", project1.region_env.name);
    cy.get("table").contains("tr", project1.name).should("be.visible");
    cy.get("table").contains("tr", project2.name).should("not.exist");
  });
});
