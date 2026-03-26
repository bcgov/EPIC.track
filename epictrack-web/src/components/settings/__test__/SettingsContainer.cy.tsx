import React from "react";
import { AppConfig } from "config";
import SettingsContainer from "components/settings/SettingsContainer";

describe("SettingsContainer", () => {
  beforeEach(() => {
    cy.intercept("GET", `${AppConfig.apiUrl}**`, {
      statusCode: 200,
      body: [],
    });
  });

  it("renders settings page heading and all tabs", () => {
    cy.mount(<SettingsContainer />);

    cy.contains("Settings").should("exist");
    cy.contains("General").should("exist");
    cy.contains("Special History").should("exist");
    cy.contains("User Management").should("exist");
  });

  it("switches selected tab when user selects a different tab", () => {
    cy.mount(<SettingsContainer />);

    cy.contains("button", "General").should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.contains("button", "Special History").click();
    cy.contains("button", "Special History").should(
      "have.attr",
      "aria-selected",
      "true",
    );

    cy.contains("button", "User Management").click();
    cy.contains("button", "User Management").should(
      "have.attr",
      "aria-selected",
      "true",
    );
  });
});
