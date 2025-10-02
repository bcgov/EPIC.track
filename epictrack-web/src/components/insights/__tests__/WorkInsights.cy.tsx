import Insights from "..";

describe("Main Component inside InsightsContextProvider", () => {
  it("renders work insights", () => {
    cy.mount(<Insights />);

    cy.contains("Work Dashboard").should("be.visible"); // Work Dashboard is open by default
    cy.contains("Project Dashboard").should("not.exist"); // Projects Dashboard is not open
  });

  it("renders the buttons to switch to project insights", () => {
    cy.mount(<Insights />);

    cy.get('[data-cy="project-insights-tab-button"]').click(); // Click on Project tab button

    cy.contains("Project Dashboard").should("exist"); // Project Dashboard is now open
    cy.contains("Work Dashboard").should("not.exist"); // Work Dashboard is not open
  });
});
