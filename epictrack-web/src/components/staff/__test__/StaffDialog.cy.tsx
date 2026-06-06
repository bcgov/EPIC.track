import { AppConfig } from "config";
import { ROLES } from "constants/application-constant";
import { StaffDialog } from "components/staff/Dialog";
import { store } from "store";
import { userDetails } from "services/userService/userSlice";
import staffService from "services/staffService/staffService";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const endpoints: Endpoint[] = [
  {
    name: "getPositionsOptions",
    method: "OPTIONS",
    url: `${AppConfig.apiUrl}positions`,
  },
  {
    name: "getPositions",
    method: "GET",
    url: `${AppConfig.apiUrl}positions`,
    response: {
      body: [
        { id: 1, name: "Analyst" },
        { id: 2, name: "Advisor" },
      ],
    },
  },
];

const dispatchEditRole = () => {
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
      roles: [ROLES.EDIT],
    }),
  );
};

describe("StaffDialog", () => {
  beforeEach(() => {
    dispatchEditRole();
    setupIntercepts(endpoints);
    cy.stub(staffService, "validateEmail").resolves({
      status: 200,
      data: { exists: false },
    } as any);
  });

  it("loads staff by id and submits update", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveStaffCallback = cy.stub().as("saveStaffCallback");

    cy.stub(staffService, "getById")
      .as("getById")
      .resolves({
        status: 200,
        data: {
          id: 7,
          first_name: "Alex",
          last_name: "Johnson",
          full_name: "Alex Johnson",
          email: "alex@example.com",
          phone: "(250) 555-0101",
          position_id: 1,
          is_active: true,
        },
      } as any);
    cy.stub(staffService, "update")
      .as("update")
      .resolves({
        status: 200,
      } as any);

    cy.mount(
      <StaffDialog
        open={true}
        setOpen={setOpen}
        saveStaffCallback={saveStaffCallback}
        staffId={7}
      />,
    );

    cy.get("@getById").should("have.been.calledWith", "7");
    cy.contains(/Edit Staff|Alex Johnson/).should("exist");

    cy.get("#staff-form").submit();

    cy.get("@update").should("have.been.called");
    cy.contains("Staff updated successfully").should("exist");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saveStaffCallback").should("have.been.called");
  });

  it("shows notification when loading staff fails", () => {
    const setOpen = cy.stub().as("setOpen");

    cy.stub(staffService, "getById").rejects(new Error("network error"));

    cy.mount(<StaffDialog open={true} setOpen={setOpen} staffId={99} />);

    cy.contains("Could not load Staff").should("exist");
  });

  it("submits create flow for a new staff", () => {
    const setOpen = cy.stub().as("setOpen");
    const saveStaffCallback = cy.stub().as("saveStaffCallback");

    cy.stub(staffService, "create")
      .as("create")
      .resolves({
        status: 201,
      } as any);

    cy.mount(
      <StaffDialog
        open={true}
        setOpen={setOpen}
        saveStaffCallback={saveStaffCallback}
      />,
    );

    cy.contains("Create Staff").should("exist");

    cy.get('input[name="first_name"]').type("Jamie");
    cy.get('input[name="last_name"]').type("Baker");
    cy.get('input[name="email"]').type("jamie.baker@example.com");
    cy.get('input[name="phone"]').type("2505550102");

    cy.contains("Position")
      .parent()
      .find("input")
      .first()
      .click({ force: true })
      .type("Analyst{enter}", { force: true });

    cy.get("#staff-form").submit();

    cy.get("@create").should("have.been.called");
    cy.contains("Staff created successfully").should("exist");
    cy.get("@setOpen").should("have.been.calledWith", false);
    cy.get("@saveStaffCallback").should("have.been.called");
  });

  it("shows notification when save fails", () => {
    const setOpen = cy.stub().as("setOpen");

    cy.stub(staffService, "create").rejects(new Error("save failed"));

    cy.mount(<StaffDialog open={true} setOpen={setOpen} />);

    cy.get('input[name="first_name"]').type("Taylor");
    cy.get('input[name="last_name"]').type("Rivera");
    cy.get('input[name="email"]').type("taylor.rivera@example.com");
    cy.get('input[name="phone"]').type("2505550103");

    cy.contains("Position")
      .parent()
      .find("input")
      .first()
      .click({ force: true })
      .type("Advisor{enter}", { force: true });

    cy.get("#staff-form").submit();

    cy.contains("Could not save Staff").should("exist");
    cy.get("@setOpen").should("not.have.been.calledWith", false);
  });
});
