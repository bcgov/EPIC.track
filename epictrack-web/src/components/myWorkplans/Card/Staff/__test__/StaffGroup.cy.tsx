import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import StaffGroup from "components/myWorkplans/Card/Staff/StaffGroup";

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

describe("StaffGroup", () => {
  it("renders staff avatars and overflow for larger teams", () => {
    const workplan = {
      staff_info: [
        {
          staff: {
            id: 1,
            first_name: "Alice",
            last_name: "Brown",
            full_name: "Alice Brown",
            email: "alice@gov.bc.ca",
            phone: "",
            position: { name: "Analyst" },
          },
        },
        {
          staff: {
            id: 2,
            first_name: "Ben",
            last_name: "Cole",
            full_name: "Ben Cole",
            email: "ben@gov.bc.ca",
            phone: "",
            position: { name: "Advisor" },
          },
        },
        {
          staff: {
            id: 3,
            first_name: "Cara",
            last_name: "Dunn",
            full_name: "Cara Dunn",
            email: "cara@gov.bc.ca",
            phone: "",
            position: { name: "Lead" },
          },
        },
        {
          staff: {
            id: 4,
            first_name: "Drew",
            last_name: "Ellis",
            full_name: "Drew Ellis",
            email: "drew@gov.bc.ca",
            phone: "",
            position: { name: "Manager" },
          },
        },
      ],
    } as any;

    cy.mount(<StaffGroup workplan={workplan} />, {
      reduxStore: makeStore("cara@gov.bc.ca"),
    });

    cy.contains("CD").should("exist");
    cy.get(".MuiAvatar-root").should("have.length.at.least", 3);
    cy.get("[data-testid='MoreHorizIcon']").should("exist");
  });
});
