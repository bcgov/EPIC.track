import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import { AppConfig } from "config";
import {
  mockStaffs,
  testTableFiltering,
} from "../../../../../cypress/support/common";
import {
  Endpoint,
  setupIntercepts,
} from "../../../../../cypress/support/utils";
import UserManagementList from "../UserManagementList";
import { StaffElevatedRole } from "models/staff";
import { ElevatedRole, ElevatedRoleEnum } from "models/elevated_role";

const staff1 = mockStaffs[0];
const staff2 = mockStaffs[1];
const staff3 = mockStaffs[2];

export const mockElevatedRoles: ElevatedRole[] = [
  {
    id: ElevatedRoleEnum.MANAGE_FIRST_NATIONS,
    name: "Manage First Nations",
  },
];

export const mockStaffElevatedRoles: StaffElevatedRole[] = [
  {
    elevated_role_id: mockElevatedRoles[0].id,
    id: 1,
    is_active: true,
    staff_id: staff1.id,
  },
  {
    elevated_role_id: mockElevatedRoles[0].id,
    id: 2,
    is_active: true,
    staff_id: staff2.id,
  },
  {
    elevated_role_id: mockElevatedRoles[0].id,
    id: 3,
    is_active: true,
    staff_id: staff3.id,
  },
];

const endpoints: Endpoint[] = [
  {
    name: "getAllStaffsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
  },
  {
    name: "getElevatedRolesOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}elevated-roles`,
  },
  {
    name: "getStaffElevatedRolesOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}staff-elevated-roles?is_active=true`,
  },
  {
    name: "getAllStaffs",
    method: "GET",
    url: `${AppConfig.apiUrl}staffs?is_active=false`,
    response: { body: mockStaffs },
  },
  {
    name: "getElevatedRoles",
    method: "GET",
    url: `${AppConfig.apiUrl}elevated-roles`,
    response: { body: mockElevatedRoles },
  },
  {
    name: "getStaffElevatedRoles",
    method: "GET",
    url: `${AppConfig.apiUrl}staff-elevated-roles?is_active=true`,
    response: { body: mockStaffElevatedRoles },
  },
];

describe("UserManagementList", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <UserManagementList />
        </Router>
      </SnackbarProvider>,
    );
    cy.wait(["@getAllStaffs", "@getElevatedRoles", "@getStaffElevatedRoles"]);
  });

  it("should display the user management list", () => {
    cy.get("table").should("exist").and("be.visible");
  });

  it("should filter the user management list based on the staff name input", () => {
    testTableFiltering("Name", staff1.first_name);
    cy.get("table").contains("tr", staff1.full_name).should("be.visible");
    cy.get("table").contains("tr", staff2.full_name).should("not.exist");
    cy.get("table").contains("tr", staff3.full_name).should("not.exist");
  });

  it("should filter the user management list by default position input (IPE)", () => {
    cy.get("table").contains("tr", staff1.position.name).should("be.visible");
    cy.get("table").contains("tr", staff3.position.name).should("be.visible");
    cy.get("table").contains("tr", staff2.position.name).should("not.exist");
  });
});
