import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import AppHelpButton from "../index";
import helpPageMap from "../HelpPageMap.json";
import { REPORT_ISSUE_LINKS } from "constants/application-constant";

describe("AppHelpButton", () => {
  const mountWithRoute = (
    initialEntry:
      string | { pathname: string; state?: Record<string, unknown> },
  ) => {
    const initialEntries = [initialEntry];

    cy.mount(
      <Router initialEntries={initialEntries}>
        <Routes>
          <Route path="*" element={<AppHelpButton />} />
        </Routes>
      </Router>,
    );
  };

  beforeEach(() => {
    cy.window().then((win) => {
      cy.stub(win, "open").as("windowOpen");
    });
  });

  it("opens the help menu and shows all menu items", () => {
    mountWithRoute("/work-plan");

    cy.get(".MuiFab-root").click();

    cy.contains("Date Calculator").should("be.visible");
    cy.contains("Support Center").should("be.visible");
    cy.contains("Report an Issue").should("be.visible");
  });

  it("opens support center page for selected helpPage tags", () => {
    mountWithRoute({
      pathname: "/work-plan",
      state: { helpPageTags: ["Status"] },
    });

    cy.get(".MuiFab-root").click();
    cy.contains("Support Center").click();

    cy.get("@windowOpen").should(
      "have.been.calledWith",
      "https://intranet.gov.bc.ca/intranet/content?id=A35C49D2D60144F594F8C1DDB5F0EA10#status",
      "_blank",
    );
  });

  it("falls back to the default help page when route is not mapped", () => {
    mountWithRoute("/missing-page");

    cy.get(".MuiFab-root").click();
    cy.contains("Support Center").click();

    cy.get("@windowOpen").should(
      "have.been.calledWith",
      helpPageMap.help.default.helpPage,
      "_blank",
    );
  });

  it("opens report an issue page", () => {
    mountWithRoute("/work-plan");

    cy.get(".MuiFab-root").click();
    cy.contains("Report an Issue").click();

    cy.get("@windowOpen").should(
      "have.been.calledWith",
      REPORT_ISSUE_LINKS.JSM_PORTAL,
      "_blank",
    );
  });

  it("opens the date calculator dialog", () => {
    mountWithRoute("/work-plan");

    cy.get(".MuiFab-root").click();
    cy.contains("Date Calculator").click();

    cy.contains("Date Calculator").should("exist");
    cy.contains("Enter any two fields to calculate the third").should(
      "be.visible",
    );
  });
});
