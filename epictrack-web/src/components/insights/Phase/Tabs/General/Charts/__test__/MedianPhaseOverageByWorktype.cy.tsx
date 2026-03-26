import React, { useEffect } from "react";
import MedianPhaseOverageByWorktypeChart from "components/insights/Phase/Tabs/General/Charts/MedianPhaseOverageByWorktype";
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
          <MedianPhaseOverageByWorktypeChart />
        </TableFilterProvider>
      </PhaseInsightsContext.Provider>
    </InsightsContext.Provider>,
  );
};

describe("MedianPhaseOverageByWorktypeChart", () => {
  it("renders stacked bars and desktop phase legend", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "median_overage_by_worktype") {
        req.reply([
          {
            work_type: "Type A",
            phase: "Review",
            median_overage: 3,
            phase_sort_order: 2,
          },
          {
            work_type: "Type A",
            phase: "Decision",
            median_overage: 2,
            phase_sort_order: 1,
          },
          {
            work_type: "Type B",
            phase: "Review",
            median_overage: 1,
            phase_sort_order: 2,
          },
        ]);
      }
    }).as("getMedianByWorktype");

    mountChart(false, [{ id: "work_type_name", value: ["Type A"] }]);

    cy.wait("@getMedianByWorktype");
    cy.contains("MEDIAN PHASE OVERAGE BY WORKTYPE").should("exist");
    cy.contains("Decision").should("exist");
    cy.contains("Review").should("exist");
    cy.get(".recharts-rectangle").should("have.length.at.least", 2);
  });

  it("renders mobile legend chips and underage title", () => {
    cy.viewport(390, 844);

    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "median_overage_by_worktype") {
        req.reply([
          {
            work_type: "Type C",
            phase: "Planning",
            median_overage: 4,
            phase_sort_order: 1,
          },
          {
            work_type: "Type C",
            phase: "Post-Decision",
            median_overage: 2,
            phase_sort_order: 2,
          },
        ]);
      }
    }).as("getMedianByWorktypeMobile");

    mountChart(true, [{ id: "phase_name", value: ["Planning"] }]);

    cy.wait("@getMedianByWorktypeMobile");
    cy.contains("MEDIAN PHASE UNDERAGE BY WORKTYPE").should("exist");
    cy.contains("Planning").should("exist");
    cy.contains("Post-Decision").should("exist");
  });
});
