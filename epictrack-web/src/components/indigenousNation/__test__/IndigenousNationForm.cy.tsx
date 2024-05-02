import { MasterContext } from "components/shared/MasterContext";
import { defaultFirstNation } from "models/firstNation";
import IndigenousNationForm from "../IndigenousNationForm";
import {
  mockStaffs,
  createMockMasterContext,
} from "../../../../cypress/support/common";
import { AppConfig } from "config";

function setupIntercepts(endpoints: any[]) {
  endpoints.forEach(({ method, url, response, name }) => {
    cy.intercept(method, url, response).as(name);
  });
}

const endpoints = [
  {
    name: "getActiveStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: { data: mockStaffs } },
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
    const mockContext = createMockMasterContext(firstNation, firstNation);
    setupIntercepts(endpoints);

    cy.mount(
      <MasterContext.Provider value={mockContext}>
        <IndigenousNationForm />
      </MasterContext.Provider>
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
