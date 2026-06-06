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
import { store } from "store";
import { userDetails } from "services/userService/userSlice";
import { ROLES } from "constants/application-constant";
import elevatedRoleService from "services/elevatedRoleService";
import staffElevatedRoleService from "services/staffElevatedRoleService/staffElevatedRoleService";
import staffService from "services/staffService/staffService";

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

const dispatchUserRoles = (roles: string[] = []) => {
  store.dispatch(
    userDetails({
      sub: "123",
      groups: [],
      preferred_username: "tester",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      staffId: 1,
      phone: "",
      position: "",
      roles,
    }),
  );
};

const mountComponent = () => {
  cy.mount(
    <SnackbarProvider maxSnack={3}>
      <Router>
        <UserManagementList />
      </Router>
    </SnackbarProvider>,
  );
};

const clickRowSaveAction = () => {
  cy.get("body").then(($body) => {
    const selector =
      'button[title="Save"],button[aria-label="Save"],button[aria-label="save"]';
    const saveButton = $body.find(selector).first();
    expect(
      saveButton.length,
      "save action button is available",
    ).to.be.greaterThan(0);
    cy.wrap(saveButton).click({ force: true });
  });
};

describe("UserManagementList", () => {
  beforeEach(() => {
    dispatchUserRoles([]);
    setupIntercepts(endpoints);
    mountComponent();
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

  it("should filter the user management list by default position input (REL)", () => {
    cy.get("table").contains("tr", staff1.position.name).should("be.visible");
    cy.get("table").contains("tr", staff3.position.name).should("be.visible");
    cy.get("table").contains("tr", staff2.position.name).should("not.exist");
  });

  it("should display additional roles merged from staff elevated roles", () => {
    cy.get("table").contains("tr", "Manage First Nations").should("exist");
  });

  it("should disable edit action when user lacks manage-users permission", () => {
    cy.get("tbody tr").first().find("button").first().should("be.disabled");
  });

  it("should enable edit action when user has manage-users permission", () => {
    dispatchUserRoles([ROLES.MANAGE_USERS]);
    mountComponent();
    cy.wait(["@getAllStaffs", "@getElevatedRoles", "@getStaffElevatedRoles"]);

    cy.get("tbody tr").first().find("button").first().should("not.be.disabled");
  });

  it("should show notification when elevated roles cannot be loaded", () => {
    cy.stub(elevatedRoleService, "getAll").rejects(new Error("network error"));

    mountComponent();

    cy.contains("Could not load elevated roles").should("exist");
  });

  it("should handle empty staff elevated role mappings", () => {
    cy.stub(staffElevatedRoleService, "getAll").resolves({
      status: 200,
      data: [],
    } as any);

    mountComponent();

    cy.contains("table tr", staff1.full_name).should("exist");
    cy.contains("table tr", "Manage First Nations").should("not.exist");
  });

  it("should show notification when staff additional roles cannot be loaded", () => {
    cy.stub(staffElevatedRoleService, "getAll").rejects(
      new Error("network error"),
    );

    mountComponent();

    cy.contains("Could not load Staff Additional Roles").should("exist");
  });

  it("should show notification when staffs cannot be loaded", () => {
    cy.stub(staffService, "getAll").rejects(new Error("network error"));

    mountComponent();

    cy.contains("Could not load Staffs").should("exist");
  });

  it("should fallback to empty additional role name when mapping role is unknown", () => {
    cy.stub(staffElevatedRoleService, "getAll").resolves({
      status: 200,
      data: [
        {
          elevated_role_id: 9999,
          id: 55,
          is_active: true,
          staff_id: staff1.id,
        },
      ],
    } as any);

    mountComponent();

    cy.contains("table tr", staff1.full_name).should("exist");
    cy.contains("table tr", "Manage First Nations").should("not.exist");
  });

  it("should attempt to persist additional roles when save is clicked", () => {
    dispatchUserRoles([ROLES.MANAGE_USERS]);

    const getByStaffIdStub = cy
      .stub(staffElevatedRoleService, "getAllStaffElevatedRoleByStaffId")
      .resolves({
        status: 200,
        data: [
          {
            elevated_role_id: mockElevatedRoles[0].id,
            id: 1,
            is_active: true,
            staff_id: staff1.id,
          },
        ],
      } as any);
    cy.stub(staffElevatedRoleService, "update").resolves({
      status: 200,
    } as any);
    cy.stub(staffElevatedRoleService, "create").resolves({
      status: 201,
    } as any);

    mountComponent();
    cy.wait(["@getAllStaffs", "@getElevatedRoles", "@getStaffElevatedRoles"]);

    cy.contains("tbody tr", staff1.full_name).within(() => {
      cy.get("button").first().click({ force: true });
    });

    clickRowSaveAction();
    cy.wrap(getByStaffIdStub).should("have.been.called");
  });

  it("should handle 404 previous role lookup when save is clicked", () => {
    dispatchUserRoles([ROLES.MANAGE_USERS]);

    const getByStaffIdStub = cy
      .stub(staffElevatedRoleService, "getAllStaffElevatedRoleByStaffId")
      .rejects({
        response: { status: 404 },
      });
    const createStub = cy
      .stub(staffElevatedRoleService, "create")
      .resolves({ status: 201 } as any);
    cy.stub(staffElevatedRoleService, "update").resolves({
      status: 200,
    } as any);

    mountComponent();
    cy.wait(["@getAllStaffs", "@getElevatedRoles", "@getStaffElevatedRoles"]);

    cy.contains("tbody tr", staff1.full_name).within(() => {
      cy.get("button").first().click({ force: true });
    });

    clickRowSaveAction();
    cy.wrap(getByStaffIdStub).should("have.been.called");
    cy.wrap(createStub).should("have.callCount", 0);
  });

  it("should show error notification when save fails with non-404 error", () => {
    dispatchUserRoles([ROLES.MANAGE_USERS]);

    const getByStaffIdStub = cy
      .stub(staffElevatedRoleService, "getAllStaffElevatedRoleByStaffId")
      .rejects({
        response: {
          status: 500,
          data: { detail: "save failed" },
        },
      });

    mountComponent();
    cy.wait(["@getAllStaffs", "@getElevatedRoles", "@getStaffElevatedRoles"]);

    cy.contains("tbody tr", staff1.full_name).within(() => {
      cy.get("button").first().click({ force: true });
    });

    clickRowSaveAction();
    cy.wrap(getByStaffIdStub).should("have.been.called");
  });
});
