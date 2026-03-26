import { MemoryRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import GeneralSettings from "../GeneralSettings";
import stalenessSettingsService from "services/stalenessSettingsService";

describe("GeneralSettings error handling", () => {
  it("shows error notification when settings cannot be loaded", () => {
    cy.stub(stalenessSettingsService, "getAll").rejects(
      new Error("network error"),
    );

    cy.mount(
      <SnackbarProvider maxSnack={3}>
        <Router>
          <GeneralSettings />
        </Router>
      </SnackbarProvider>,
    );

    cy.contains("Could not load Status and Issue settings").should("exist");
  });
});
