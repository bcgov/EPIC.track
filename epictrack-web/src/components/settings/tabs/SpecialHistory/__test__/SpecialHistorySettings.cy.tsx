import React from "react";
import SpecialHistorySettings from "components/settings/tabs/SpecialHistory/SpecialHistorySettings";
import { SpecialHistoryContext } from "components/settings/tabs/SpecialHistory/SpecialHistorySettingsContext";
import { MemoryRouter } from "react-router-dom";

describe("SpecialHistorySettings", () => {
  it("opens create dialog when button is clicked", () => {
    const setCreateMinistryDialogOpen = cy
      .stub()
      .as("setCreateMinistryDialogOpen");

    cy.mount(
      <MemoryRouter>
        <SpecialHistoryContext.Provider
          value={{
            createMinistryDialogOpen: false,
            setCreateMinistryDialogOpen,
            onSave: () => {},
            ministry: null,
            setMinistry: () => {},
            allMinisters: [],
            ministries: [],
            getMinistries: () => {},
          }}
        >
          <SpecialHistorySettings />
        </SpecialHistoryContext.Provider>
      </MemoryRouter>,
    );

    cy.contains("Special History Settings").should("exist");
    cy.contains("button", "Create New Ministry").should("exist").click();
    cy.get("@setCreateMinistryDialogOpen").should("have.been.calledWith", true);
  });

  it("opens edit dialog from ministry name click", () => {
    const setCreateMinistryDialogOpen = cy
      .stub()
      .as("setCreateMinistryDialogOpen");
    const setMinistry = cy.stub().as("setMinistry");
    const ministry = {
      id: 15,
      name: "Forests",
      minister: { full_name: "Minister Name" },
      date_created: "2026-02-03T00:00:00.000Z",
      date_closed: null,
    };

    cy.mount(
      <MemoryRouter>
        <SpecialHistoryContext.Provider
          value={{
            createMinistryDialogOpen: false,
            setCreateMinistryDialogOpen,
            onSave: () => {},
            ministry: null,
            setMinistry,
            allMinisters: [],
            ministries: [ministry as any],
            getMinistries: () => {},
          }}
        >
          <SpecialHistorySettings />
        </SpecialHistoryContext.Provider>
      </MemoryRouter>,
    );

    cy.contains("Forests").should("exist").click();
    cy.get("@setMinistry").should("have.been.calledWith", ministry);
    cy.get("@setCreateMinistryDialogOpen").should("have.been.calledWith", true);
  });
});
