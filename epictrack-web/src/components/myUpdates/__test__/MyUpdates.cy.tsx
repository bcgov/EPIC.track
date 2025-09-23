import { MemoryRouter as Router, Route, Routes } from "react-router-dom";
import MyUpdates from "../../myUpdates";
import { MY_UPDATES_TABS } from "../constants";

describe("MyUpdates", () => {
  const mountWithRouter = (initialEntries: any[] = ["/"]) => {
    cy.mount(
      <Router initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<MyUpdates />} />
        </Routes>
      </Router>
    );
  };

  it("renders Status and Issues tab and select Status by default", () => {
    mountWithRouter();

    cy.contains(MY_UPDATES_TABS.STATUS.label).should("be.visible");
    cy.contains(MY_UPDATES_TABS.ISSUES.label).should("be.visible");

    cy.contains("Date Posted").scrollIntoView().should("be.visible");
  });

  it("switches to Issues tab when clicked", () => {
    mountWithRouter();

    cy.contains(MY_UPDATES_TABS.ISSUES.label).click();

    cy.contains("Date Updated").scrollIntoView().should("be.visible");
  });

  it("switches back to Status tab when clicked", () => {
    mountWithRouter([
      { pathname: "/", state: { tabIndex: MY_UPDATES_TABS.ISSUES.index } },
    ]);

    cy.contains(MY_UPDATES_TABS.STATUS.label).click();

    cy.contains("Date Posted").scrollIntoView().should("be.visible");
  });
});
