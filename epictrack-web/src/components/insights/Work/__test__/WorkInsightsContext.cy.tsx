import React from "react";
import {
  WorkInsightsContextProvider,
  useWorkInsightsContext,
} from "../WorkInsightsContext";

const WorkHarness = () => {
  const context = useWorkInsightsContext();
  return <div data-cy="work-context">{JSON.stringify(context)}</div>;
};

describe("WorkInsightsContext", () => {
  it("returns default context when used without provider", () => {
    cy.mount(<WorkHarness />);
    cy.get("[data-cy='work-context']").should("contain.text", "{}");
  });

  it("returns provider context value", () => {
    cy.mount(
      <WorkInsightsContextProvider>
        <WorkHarness />
      </WorkInsightsContextProvider>,
    );

    cy.get("[data-cy='work-context']").should("contain.text", "{}");
  });
});
