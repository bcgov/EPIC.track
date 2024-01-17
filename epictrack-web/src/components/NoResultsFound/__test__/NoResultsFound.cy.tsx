import NoResultsFound from "..";
import { MemoryRouter as Router } from "react-router-dom";

describe("NoResultsFound", () => {
  beforeEach(() => {
    cy.mount(
      <Router>
        <NoResultsFound />
      </Router>
    );
  });

  it("displays no results found message", () => {
    cy.contains("No results found").should("be.visible");
  });

  it("displays adjust parameters message", () => {
    cy.contains("Adjust your parameters and try again").should("be.visible");
  });
});
