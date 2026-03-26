import React, { useEffect } from "react";
import MedianPhaseOverageChart from "components/insights/Phase/Tabs/General/Charts/MedianPhaseOverage";
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
          <MedianPhaseOverageChart />
        </TableFilterProvider>
      </PhaseInsightsContext.Provider>
    </InsightsContext.Provider>,
  );
};

describe("MedianPhaseOverageChart", () => {
  it("renders median overage chart", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "median_phase_overage") {
        req.reply([
          { phase: "Review", median_overage: 5, iqr_low: 3, iqr_high: 7 },
          { phase: "Decision", median_overage: 2, iqr_low: 1, iqr_high: 4 },
        ]);
      }
    }).as("getMedianPhaseOverage");

    mountChart(false, [{ id: "phase_name", value: ["Review"] }]);

    cy.wait("@getMedianPhaseOverage");
    cy.contains("MEDIAN PHASE OVERAGE").should("exist");
    cy.contains("Median").should("exist");
    cy.get(".recharts-rectangle").should("have.length.at.least", 2);
  });

  it("renders median underage mode", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "median_phase_overage") {
        req.reply([
          { phase: "Review", median_overage: 4, iqr_low: 2, iqr_high: 6 },
        ]);
      }
    }).as("getMedianPhaseUnderage");

    mountChart(true, [{ id: "phase_name", value: ["Decision"] }]);

    cy.wait("@getMedianPhaseUnderage");
    cy.contains("MEDIAN PHASE UNDERAGE").should("exist");
    cy.get(".recharts-rectangle").should("have.length.at.least", 1);
  });
});
