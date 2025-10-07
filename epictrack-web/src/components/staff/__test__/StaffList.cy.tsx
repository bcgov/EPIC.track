import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import StaffList from "../StaffList";
import {
  mockStaffs,
  testTableFiltering,
} from "../../../../cypress/support/common";
import { AppConfig } from "config";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const staff1 = mockStaffs[0];
const staff2 = mockStaffs[1];

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
    name: "getInactiveStaffs",
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
];

describe("StaffList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <StaffList />
        </Router>
      </SnackbarProvider>,
    );
  });

  it("should display the staff list", () => {
    cy.get("table").should("exist").and("be.visible");
  });

  it("should filter the staff list based on the staff name input", () => {
    testTableFiltering("Name", staff1.full_name);
    cy.get("table").contains("tr", staff1.full_name).should("be.visible");
    cy.get("table").contains("tr", staff2.full_name).should("not.exist");
  });

  it("should filter the staff list based on the staff phone number input", () => {
    testTableFiltering("Phone Number", staff1.phone);
    cy.get("table").contains("tr", staff1.phone).should("be.visible");
    cy.get("table").contains("tr", staff2.phone).should("not.exist");
  });

  it("should filter the staff list based on the staff email input", () => {
    testTableFiltering("Email", staff1.email);
    cy.get("table").contains("tr", staff1.email).should("be.visible");
    cy.get("table").contains("tr", staff2.email).should("not.exist");
  });

  // Add more tests as needed
});
