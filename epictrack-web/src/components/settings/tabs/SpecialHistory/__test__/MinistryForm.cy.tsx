import React from "react";
import MinistryForm from "components/settings/tabs/SpecialHistory/MinistryForm";
import { SpecialHistoryContext } from "components/settings/tabs/SpecialHistory/SpecialHistorySettingsContext";

describe("MinistryForm", () => {
  it("submits prefilled ministry data in edit mode", () => {
    const onSave = cy.stub().as("onSave");
    const getMinistries = cy.stub().as("getMinistries");

    const ministry = {
      id: 11,
      name: "Energy",
      abbreviation: "ENG",
      minister_id: 2,
      minister: { id: 2, full_name: "Jordan Minister" },
      date_created: "2026-01-10",
      date_closed: "2026-02-20",
    };

    cy.mount(
      <SpecialHistoryContext.Provider
        value={{
          createMinistryDialogOpen: true,
          setCreateMinistryDialogOpen: () => {},
          onSave,
          ministry: ministry as any,
          setMinistry: () => {},
          allMinisters: [{ id: 2, full_name: "Jordan Minister" } as any],
          ministries: [ministry as any],
          getMinistries,
        }}
      >
        <MinistryForm
          setDisableDialogSave={cy.stub().as("setDisableDialogSave")}
        />
      </SpecialHistoryContext.Provider>,
    );

    cy.get('input[name="name"]').should("be.disabled");
    cy.get('input[name="abbreviation"]').should("be.disabled");

    cy.get("form").submit();

    cy.get("@onSave").should("have.been.called");
    cy.get("@onSave").its("firstCall.args.0").should("include", {
      name: "Energy",
      abbreviation: "ENG",
    });
    cy.get("@onSave").its("firstCall.args.1").should("be.a", "function");
  });

  it("toggles disable-save state when unlocking a special field", () => {
    const setDisableDialogSave = cy.stub().as("setDisableDialogSave");

    const ministry = {
      id: 15,
      name: "Transportation",
      abbreviation: "TRN",
      minister_id: 3,
      minister: { id: 3, full_name: "Taylor Minister" },
      date_created: "2026-01-01",
      date_closed: null,
    };

    cy.mount(
      <SpecialHistoryContext.Provider
        value={{
          createMinistryDialogOpen: true,
          setCreateMinistryDialogOpen: () => {},
          onSave: cy.stub(),
          ministry: ministry as any,
          setMinistry: () => {},
          allMinisters: [{ id: 3, full_name: "Taylor Minister" } as any],
          ministries: [ministry as any],
          getMinistries: cy.stub(),
        }}
      >
        <MinistryForm setDisableDialogSave={setDisableDialogSave} />
      </SpecialHistoryContext.Provider>,
    );

    cy.get("@setDisableDialogSave").should("have.been.calledWith", false);

    cy.contains("Ministry").parent().find("button").click({ force: true });

    cy.get("@setDisableDialogSave").should("have.been.calledWith", true);
  });
});
