import StaffForm from "../StaffForm";
import { mockStaffs } from "../../../../cypress/support/common";
import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
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
    url: `${AppConfig.apiUrl}codes/pip_org_types`,
    response: { body: [] },
  },
  {
    name: "getFirstNations",
    method: "GET",
    url: `${AppConfig.apiUrl}first_nations`,
    response: { body: [] },
  },
  {
    name: "getPositions",
    method: "GET",
    url: `${AppConfig.apiUrl}positions`,
    response: { body: [] },
  },
];

describe("StaffForm", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(<StaffForm fetchStaff={cy.stub()} staff={null} saveStaff={cy.stub()} />);
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
