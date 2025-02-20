import { defaultFirstNation } from "models/firstNation";
import IndigenousNationForm from "../IndigenousNationForm";
import { mockStaffs } from "../../../../cypress/support/common";
import { AppConfig } from "config";
import { setupIntercepts } from "../../../../cypress/support/utils";

const endpoints = [
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getPIPTypeOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
  },

  {
    name: "getFirstNationsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    name: "getActiveStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: mockStaffs },
  },
  {
    name: "getPIPType",
    method: "GET",
    url: `${AppConfig.apiUrl}pip-org-types`,
    response: { body: [] },
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
];

const firstNation = [defaultFirstNation];

describe("IndigenousNationForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(
      <IndigenousNationForm firstNation={null} saveFirstNation={cy.stub()} />
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("renders the name field", () => {
    cy.get('input[name="name"]');
  });

  it("renders the pip url field", () => {
    cy.get('input[name="pip_link"]');
  });

  it("renders the rich text editor", () => {
    cy.get(".DraftEditor-editorContainer");
  });

  it("renders the relationship holder field", () => {
    cy.get('input[name="relationship_holder_id"]');
  });
  it("renders the pip organization type field", () => {
    cy.get('input[name="pip_org_type_id"]');
  });
});
