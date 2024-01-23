import React from "react";
import { MemoryRouter as Router } from "react-router-dom";
import { createMockMasterContext } from "../../../../cypress/support/common";
import { MasterContext } from "../MasterContext";

function TestComponent() {
  const context = React.useContext(MasterContext);
  return <div>{context.title}</div>;
}

describe("MasterContext", () => {
  beforeEach(() => {
    cy.mount(
      <Router>
        <MasterContext.Provider value={createMockMasterContext([], [])}>
          <TestComponent />
        </MasterContext.Provider>
      </Router>
    );
  });
  it("should display the project list", () => {
    // Check if the context value is being used correctly
    cy.contains("Data").should("be.visible");
  });
});
