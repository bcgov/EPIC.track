import { MasterContext } from "../../shared/MasterContext";
import { Staff } from "models/staff";
import StaffForm from "../StaffForm";
import {
  createMockMasterContext,
  mockStaffs,
} from "../../../../cypress/support/common";
import { setupIntercepts } from "../../../../cypress/support/utils";

const endpoints = [
  {
    name: "getStaffs",
    method: "GET",
    url: "http://localhost:3200/api/v1/staffs?is_active=false",
    body: { data: mockStaffs },
  },
  {
    name: "getPipOrgTypes",
    method: "GET",
    url: "http://localhost:3200/api/v1/codes/pip_org_types",
    body: [],
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: "http://localhost:3200/api/v1/first_nations",
    body: [],
  },
];

const staff1 = mockStaffs[0];
const staffs = [staff1];

describe("StaffForm", () => {
  beforeEach(() => {
    const mockContext = createMockMasterContext(staffs, staffs);
    setupIntercepts(endpoints);

    cy.mount(
      <MasterContext.Provider value={mockContext}>
        <StaffForm staffId={staff1.id} />
      </MasterContext.Provider>
    );
  });

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("renders the first name field", () => {
    cy.get('input[name="first_name"]');
  });

  it("renders the last name field", () => {
    cy.get('input[name="last_name"]');
  });

  it("renders the email field", () => {
    cy.get('input[name="email"]');
  });

  it("renders the phone field", () => {
    cy.get('input[name="phone"]');
  });

  it("renders the position field", () => {
    cy.get('input[name="position_id"]');
  });

  it("renders the active switch", () => {
    cy.get('input[name="is_active"]');
  });
});
