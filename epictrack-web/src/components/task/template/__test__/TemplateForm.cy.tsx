import { AppConfig } from "config";
import TemplateForm from "../TemplateForm";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getEaActs",
    method: "GET",
    url: `${AppConfig.apiUrl}ea-acts*`,
    response: {
      body: [{ id: 1, name: "2018" }],
    },
  },
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work-types*`,
    response: {
      body: [{ id: 2, name: "Assessment" }],
    },
  },
  {
    name: "getPhases",
    method: "GET",
    url: `${AppConfig.apiUrl}phases/ea_acts/*/work_types/*`,
    response: {
      body: [{ id: 3, name: "Readiness" }],
    },
  },
  {
    name: "createTemplate",
    method: "POST",
    url: `${AppConfig.apiUrl}task-templates*`,
    response: {
      statusCode: 201,
      body: { id: 11 },
    },
  },
];

describe("TemplateForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("loads options and submits template payload", () => {
    const onSubmitSuccess = cy.stub().as("onSubmitSuccess");

    cy.mount(<TemplateForm onSubmitSuccess={onSubmitSuccess} />);

    cy.wait(["@getEaActs", "@getWorkTypes"]);

    cy.get("#template-form input").first().type("Template A");

    cy.contains("EA Act")
      .parent()
      .find("input")
      .first()
      .click()
      .type("2018{enter}");
    cy.contains("Work Type")
      .parent()
      .find("input")
      .first()
      .click()
      .type("Assessment{enter}");

    cy.wait("@getPhases");

    cy.contains("Phase")
      .parent()
      .find("input")
      .first()
      .click()
      .type("Readiness{enter}");

    cy.get('input[type="file"]').selectFile(
      {
        contents: Cypress.Buffer.from("dummy xlsx content"),
        fileName: "template.xlsx",
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        lastModified: Date.now(),
      },
      { force: true },
    );

    cy.get("#template-form").submit();

    cy.wait("@createTemplate");
    cy.get("@onSubmitSuccess").should("have.been.called");
  });
});
