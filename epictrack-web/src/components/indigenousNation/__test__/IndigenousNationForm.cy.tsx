import { MasterContext } from "components/shared/MasterContext";
import { defaultFirstNation } from "models/firstNation";
import { MasterBase } from "models/type";
import IndigenousNationForm from "../IndigenousNationForm";
import { Staff } from "models/staff";

const staffs: Staff[] = [
  {
    id: 1,
    full_name: "John Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 0 }, // Add the missing property
  },
  {
    id: 2,
    full_name: "John Doe",
    first_name: "", // Add the missing property
    last_name: "", // Add the missing property
    phone: "",
    email: "",
    is_active: false,
    position_id: 2 /* add more missing properties here */,
    position: { name: "test", id: 1, sort_order: 1 }, // Add the missing property
  },
  // Add more mock Staff objects as needed
];

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
    body: { data: staffs },
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

function createMockContext() {
  return {
    item: defaultFirstNation,
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
  endpoints.forEach(({ method, url, body }) => {
    cy.intercept(method, url, { body });
  });
}

describe("IndigenousNationForm", () => {
  beforeEach(() => {
    const mockContext = createMockContext();
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
