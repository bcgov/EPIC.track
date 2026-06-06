import React from "react";
import General from "components/insights/Phase/Tabs/General";
import Trends from "components/insights/Phase/Tabs/Trends";
import { InsightsContext } from "components/insights/InsightsContext";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { PhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";

const mountWithContexts = (node: React.ReactNode, viewUnderage = false) => {
  cy.mount(
    <InsightsContext.Provider
      value={{
        activeTab: "Work" as any,
        setActiveTab: () => {},
        isUserInsights: false,
        setIsUserInsights: () => {},
        isUserAssignedToWork: false,
        staffId: undefined,
      }}
    >
      <PhaseInsightsContext.Provider
        value={{
          workPhases: [],
          loadingWorkPhases: false,
          viewUnderage,
          setViewUnderage: () => {},
        }}
      >
        <TableFilterProvider>{node}</TableFilterProvider>
      </PhaseInsightsContext.Provider>
    </InsightsContext.Provider>,
  );
};

describe("Phase insights tab wrappers", () => {
  it("renders General insights accordion wrapper", () => {
    mountWithContexts(<General />);

    cy.contains("General Insights").should("exist");
    cy.contains("VIEW UNDERAGE INSIGHTS").should("exist");
  });

  it("renders Trends insights accordion wrapper", () => {
    mountWithContexts(<Trends />, true);

    cy.contains("Trends Insights").should("exist");
    cy.contains("VIEW UNDERAGE INSIGHTS").should("exist");
  });
});
