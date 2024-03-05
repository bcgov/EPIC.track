import { MasterContext } from "components/shared/MasterContext";
import { MasterBase } from "models/type";
import ProponentForm from "../ProponentForm";
import { Staff } from "models/staff";
import { Proponent, defaultProponent } from "models/proponent";
import { mockStaffs } from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";
import { ROLES } from "constants/application-constant";

function createProponent(): Proponent {
  return {
    id: 1,
    name: "Test Proponent",
    is_active: true, // or false, depending on your needs
    relationship_holder_id: Math.floor(Math.random() * 100), // or any other method to generate an ID
    relationship_holder: mockStaffs[0],
  };
}

const endpoints = [
  {
    name: "getStaffs",
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
    response: { body: mockStaffs },
  },
  {
    name: "getPipOrgTypes",
    method: "GET",
    url: "http://localhost:3200/api/v1/pip-org-types",
    body: [],
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: "http://localhost:3200/api/v1/first_nations",
    body: [],
  },
];

const proponent = createProponent();

function createMockContext() {
  return {
    item: proponent,
    formId: "proponent-form", // Add the missing property 'formId'
    setFormId: cy.stub(),
    setTitle: cy.stub(),
    setId: cy.stub(),
    onSave: cy.stub(),
    title: proponent.name,
    data: [proponent] as MasterBase[],
    loading: false,
    setItem: cy.stub(),
    showModalForm: true,
    setShowDeleteDialog: cy.stub(),
    setShowModalForm: cy.stub(),
    getData: cy.stub(),
    setService: cy.stub(),
    setForm: cy.stub(),
    form: <ProponentForm proponentId={proponent.id} />,
    onDialogClose: cy.stub(),
    setFormStyle: cy.stub(),
    getById: cy.stub(),
    setDialogProps: cy.stub(),
  };
}

describe("ProponentForm", () => {
  beforeEach(() => {
    cy.setupUser([ROLES.EDIT]);
    const mockContext = createMockContext();
    setupIntercepts(endpoints);
    cy.mount(
      <MasterContext.Provider value={mockContext}>
        <ProponentForm proponentId={proponent.id} />
      </MasterContext.Provider>
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("renders the name field", () => {
    cy.get('input[name="name"]');
  });

  it("Form title is proponent name", () => {
    cy.get("h2").contains("Proponent");
  });

  it("renders the relationship holder field", () => {
    cy.get('input[name="relationship_holder_id"]');
  });
});
