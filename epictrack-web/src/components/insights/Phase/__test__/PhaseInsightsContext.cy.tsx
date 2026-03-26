import React from "react";
import {
  PhaseInsightsContextProvider,
  usePhaseInsightsContext,
} from "../PhaseInsightsContext";
import { InsightsContext } from "../../InsightsContext";

const PhaseHarness = () => {
  const { workPhases, viewUnderage, setViewUnderage } =
    usePhaseInsightsContext();

  return (
    <>
      <div data-cy="phase-count">{workPhases.length}</div>
      <div data-cy="view-underage">{String(viewUnderage)}</div>
      <button onClick={() => setViewUnderage(true)}>Enable Underage</button>
    </>
  );
};

const HookOutsideProvider = () => {
  usePhaseInsightsContext();
  return <div>outside</div>;
};

describe("PhaseInsightsContext", () => {
  it("throws when hook is used outside provider", () => {
    cy.on("uncaught:exception", (err) => {
      expect(err.message).to.contain(
        "usePhaseInsightsContext must be used within a PhaseInsightsContextProvider",
      );
      return false;
    });

    cy.mount(<HookOutsideProvider />);
  });

  it("provides work phases and toggles underage state", () => {
    cy.intercept("GET", "**/work-phases*", {
      statusCode: 200,
      body: [{ id: 1, name: "Phase A" }],
    }).as("getWorkPhases");

    cy.mount(
      <InsightsContext.Provider
        value={{
          activeTab: "Work" as any,
          setActiveTab: () => ({}),
          isUserInsights: false,
          setIsUserInsights: () => ({}),
          isUserAssignedToWork: false,
          staffId: 321,
        }}
      >
        <PhaseInsightsContextProvider>
          <PhaseHarness />
        </PhaseInsightsContextProvider>
      </InsightsContext.Provider>,
    );

    cy.wait("@getWorkPhases")
      .its("request.url")
      .should("contain", "view_underage=false");
    cy.get("[data-cy='phase-count']").should("contain.text", "1");
    cy.get("[data-cy='view-underage']").should("contain.text", "false");

    cy.contains("button", "Enable Underage").click({ force: true });
    cy.get("[data-cy='view-underage']").should("contain.text", "true");
    cy.wait("@getWorkPhases")
      .its("request.url")
      .should("contain", "view_underage=true");
  });

  it("includes staff id in query when user insights mode is enabled", () => {
    cy.intercept("GET", "**/work-phases*", {
      statusCode: 200,
      body: [{ id: 2, name: "Phase B" }],
    }).as("getWorkPhases");

    cy.mount(
      <InsightsContext.Provider
        value={{
          activeTab: "Work" as any,
          setActiveTab: () => ({}),
          isUserInsights: true,
          setIsUserInsights: () => ({}),
          isUserAssignedToWork: true,
          staffId: 654,
        }}
      >
        <PhaseInsightsContextProvider>
          <PhaseHarness />
        </PhaseInsightsContextProvider>
      </InsightsContext.Provider>,
    );

    cy.wait("@getWorkPhases")
      .its("request.url")
      .should("contain", "staff_id=654");
  });
});
