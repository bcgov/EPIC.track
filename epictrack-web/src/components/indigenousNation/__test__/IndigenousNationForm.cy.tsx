import { MasterContext } from "components/shared/MasterContext";
import { defaultFirstNation } from "models/firstNation";
import IndigenousNationForm from "../IndigenousNationForm";
import {
  mockStaffs,
  createMockMasterContext,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";

const endpoints = [
  {
    method: "OPTIONS",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
  },
  {
    method: "OPTIONS",
    url: "http://localhost:3200/api/v1/codes/pip_org_types",
  },
  { method: "OPTIONS", url: "http://localhost:3200/api/v1/first_nations" },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
    body: { data: mockStaffs },
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/pip_org_types",
    body: [],
  },
  {
    method: "GET",
    url: "http://localhost:3200/api/v1/first_nations",
    body: [],
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
