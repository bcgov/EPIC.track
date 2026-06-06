import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import StaffAvatar from "components/myWorkplans/Card/Staff/StaffAvatar";

const makeStore = (email: string) => {
  const state = {
    user: {
      userDetail: {
        email,
      },
    },
    uiState: {},
    loadingState: {},
  };

  return configureStore({
    reducer: () => state,
    preloadedState: state,
  });
};

describe("StaffAvatar", () => {
  it("renders nothing when staff is missing", () => {
    cy.mount(<StaffAvatar staff={null as any} />, {
      reduxStore: makeStore("owner@gov.bc.ca"),
    });

    cy.get(".MuiAvatar-root").should("not.exist");
  });

  it("renders initials from first and last name", () => {
    cy.mount(
      <StaffAvatar
        staff={
          {
            id: 1,
            email: "owner@gov.bc.ca",
            first_name: "Alice",
            last_name: "Baker",
            full_name: "Alice Baker",
            phone: "250-000-0000",
            position: { name: "Analyst" },
          } as any
        }
      />,
      { reduxStore: makeStore("owner@gov.bc.ca") },
    );

    cy.contains("AB").should("exist");
  });

  it("falls back to X initials for empty names", () => {
    cy.mount(
      <StaffAvatar
        staff={
          {
            id: 2,
            email: "other@gov.bc.ca",
            first_name: "",
            last_name: "",
            full_name: "",
            phone: "",
            position: { name: "" },
          } as any
        }
      />,
      { reduxStore: makeStore("owner@gov.bc.ca") },
    );

    cy.contains("XX").should("exist");
  });
});
