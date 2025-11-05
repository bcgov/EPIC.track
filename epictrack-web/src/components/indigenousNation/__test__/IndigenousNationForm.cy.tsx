import IndigenousNationForm from "../IndigenousNationForm";
import { mockStaffs } from "../../../../cypress/support/common";
import { AppConfig } from "config";
import {
  HttpMethod,
  Endpoint,
  setupIntercepts,
} from "../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getActiveStaffsOptions",
    method: "OPTIONS" as HttpMethod,
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getPIPTypeOptions",
    method: "OPTIONS" as HttpMethod,
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
  },

  {
    name: "getFirstNationsOptions",
    method: "OPTIONS" as HttpMethod,
    url: `${AppConfig.apiUrl}first_nations`,
  },
  {
    name: "getActiveStaffs",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: mockStaffs },
  },
  {
    name: "getPIPType",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}pip-org-types`,
    response: { body: [] },
  },
  {
    name: "getFirstNations",
    method: "GET" as HttpMethod,
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
];

describe("IndigenousNationForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(
      <IndigenousNationForm firstNation={null} saveFirstNation={cy.stub()} />,
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
