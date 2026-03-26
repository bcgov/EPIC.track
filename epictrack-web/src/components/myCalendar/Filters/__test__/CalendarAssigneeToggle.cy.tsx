import React from "react";
import CalendarAssigneeToggle from "../CalendarAssigneeToggle";
import { store } from "store";
import { userDetails } from "services/userService/userSlice";

describe("CalendarAssigneeToggle", () => {
  beforeEach(() => {
    const user = store.getState().user.userDetail;
    store.dispatch(
      userDetails({
        ...user,
        firstName: "Taylor",
      }),
    );
  });

  it("renders default label and user name", () => {
    cy.mount(
      <CalendarAssigneeToggle isUsersItems={true} handleToggle={cy.stub()} />,
    );

    cy.contains("Taylor's").should("exist");
    cy.contains("Items").should("exist");
  });

  it("renders custom label and toggles value on switch click", () => {
    const handleToggle = cy.stub().as("handleToggle");

    cy.mount(
      <CalendarAssigneeToggle
        isUsersItems={true}
        label="Calendar"
        handleToggle={handleToggle}
      />,
    );

    cy.contains("Calendar").should("exist");
    cy.get('input[type="checkbox"]').click({ force: true });
    cy.get("@handleToggle").should("have.been.calledWith", false);
  });

  it("does not allow toggle when disabled", () => {
    const handleToggle = cy.stub().as("handleToggle");

    cy.mount(
      <CalendarAssigneeToggle
        isUsersItems={false}
        disabled
        handleToggle={handleToggle}
      />,
    );

    cy.get('input[type="checkbox"]').should("be.disabled");
    cy.get("@handleToggle").should("not.have.been.called");
  });
});
