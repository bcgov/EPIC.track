import React, { useEffect } from "react";
import PercentOfPhasesWithOveragesChart from "components/insights/Phase/Tabs/Trends/Charts/PercentOfPhasesWithOverages";
import {
  TableFilterProvider,
  useTableFilterContext,
} from "components/insights/TableFilterContext";
import { PhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";
import { InsightsContext } from "components/insights/InsightsContext";

const SetFilters = ({ filters }: { filters: any[] }) => {
  const { setColumnFilters } = useTableFilterContext();

  useEffect(() => {
    setColumnFilters(filters);
  }, [filters, setColumnFilters]);

  return null;
};

const mountChart = (viewUnderage: boolean, filters: any[]) => {
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
        <TableFilterProvider>
          <SetFilters filters={filters} />
          <PercentOfPhasesWithOveragesChart />
        </TableFilterProvider>
      </PhaseInsightsContext.Provider>
    </InsightsContext.Provider>,
  );
};

describe("PercentOfPhasesWithOveragesChart", () => {
  it("renders overage chart with data", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "percent_of_phases_with_overages") {
        req.reply([
          {
            phase: "Review",
            percent_overage: 60,
            overage_count: 6,
            total_count: 10,
          },
          {
            phase: "Decision",
            percent_overage: 20,
            overage_count: 2,
            total_count: 10,
          },
        ]);
      }
    }).as("getPercentOverage");

    mountChart(false, [{ id: "phase_name", value: ["Review"] }]);

    cy.wait("@getPercentOverage");
    cy.contains("% OF PHASES WITH OVERAGE").should("exist");
    cy.get(".recharts-rectangle").should("have.length.at.least", 2);
  });

  it("renders underage title when toggled", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "percent_of_phases_with_overages") {
        req.reply([
          {
            phase: "Review",
            percent_overage: 35,
            overage_count: 3,
            total_count: 9,
          },
        ]);
      }
    }).as("getPercentUnderage");

    mountChart(true, [{ id: "phase_name", value: ["Decision"] }]);

    cy.wait("@getPercentUnderage");
    cy.contains("% OF PHASES WITH UNDERAGE").should("exist");
    cy.get(".recharts-rectangle").should("have.length.at.least", 1);
  });

  it("shows skeleton when filters are empty and query is skipped", () => {
    mountChart(false, []);

    cy.get(".MuiSkeleton-root").should("have.length", 3);
  });
});
