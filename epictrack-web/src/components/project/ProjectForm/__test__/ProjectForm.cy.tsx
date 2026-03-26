import ProjectForm from "..";
import { AppConfig } from "config";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getRegions",
    method: "GET",
    url: `${AppConfig.apiUrl}regions*`,
    response: {
      body: [{ id: 1, name: "Region A" }],
    },
  },
  {
    name: "getTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}types`,
    response: {
      body: [{ id: 1, name: "Type A" }],
    },
  },
  {
    name: "getProponents",
    method: "GET",
    url: `${AppConfig.apiUrl}proponents`,
    response: {
      body: [{ id: 1, name: "Proponent A" }],
    },
  },
  {
    name: "createProjectAbbreviation",
    method: "POST",
    url: `${AppConfig.apiUrl}projects/abbreviation`,
    response: {
      body: "PRJ-001",
    },
  },
];

describe("ProjectForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders and auto-generates abbreviation from project name", () => {
    cy.mount(
      <ProjectForm
        project={null}
        fetchProject={() => {
          return;
        }}
        saveProject={() => {
          return;
        }}
      />,
    );

    cy.get("#project-form").should("exist");
    cy.get('input[placeholder="Project Name"]').type("Coastal Access Project");
    cy.get('input[placeholder="Project Name"]').blur();

    cy.wait("@createProjectAbbreviation");
    cy.get('input[placeholder="EDRMS retrieval code"]').should(
      "have.value",
      "PRJ-001",
    );
  });
});
