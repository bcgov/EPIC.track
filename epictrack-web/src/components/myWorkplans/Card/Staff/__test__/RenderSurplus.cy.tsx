import React from "react";
import RenderSurplus from "components/myWorkplans/Card/Staff/RenderSurplus";

const staff = [
  {
    id: 1,
    staff: {
      id: 1,
      first_name: "One",
      last_name: "User",
      full_name: "One User",
      position: { name: "Role 1" },
    },
  },
  {
    id: 2,
    staff: {
      id: 2,
      first_name: "Two",
      last_name: "User",
      full_name: "Two User",
      position: { name: "Role 2" },
    },
  },
  {
    id: 3,
    staff: {
      id: 3,
      first_name: "Three",
      last_name: "User",
      full_name: "Three User",
      position: { name: "Role 3" },
    },
  },
  {
    id: 4,
    staff: {
      id: 4,
      first_name: "Four",
      last_name: "User",
      full_name: "Four User",
      position: { name: "Role 4" },
    },
  },
];

describe("RenderSurplus", () => {
  it("renders the overflow avatar trigger", () => {
    cy.mount(<RenderSurplus renderSurplus={3} staff={staff as any} />);

    cy.get(".MuiAvatar-root").should("exist");
    cy.get("[data-testid='MoreHorizIcon']").should("exist");
  });
});
