import React, { useEffect } from "react";
import OverageResponsibilityChart from "components/insights/Phase/Tabs/General/Charts/OverageResponsibility";
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
  }, [setColumnFilters, filters]);

  return null;
};

const mountChart = (filters: any[]) => {
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
          viewUnderage: false,
          setViewUnderage: () => {},
        }}
      >
        <TableFilterProvider>
          <SetFilters filters={filters} />
          <OverageResponsibilityChart />
        </TableFilterProvider>
      </PhaseInsightsContext.Provider>
    </InsightsContext.Provider>,
  );
};

describe("OverageResponsibilityChart", () => {
  it("renders pie chart from insights data", () => {
    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "overage_responsibility") {
        req.reply([
          { responsibility_id: 1, responsibility_name: "EAO", count: 4 },
          { responsibility_id: 2, responsibility_name: "Proponent", count: 2 },
        ]);
      }
    }).as("getOverageResponsibility");

    mountChart([{ id: "phase_name", value: ["Review"] }]);

    cy.wait("@getOverageResponsibility");
    cy.contains("OVERAGE RESPONSIBILITY").should("exist");
    cy.get(".recharts-sector").should("have.length.at.least", 2);
  });

  it("renders mobile legend labels", () => {
    cy.viewport(390, 844);

    cy.intercept("POST", "**/insights/phases", (req) => {
      if (req.body?.group_by === "overage_responsibility") {
        req.reply([
          { responsibility_id: 5, responsibility_name: "Agency", count: 1 },
          { responsibility_id: 6, responsibility_name: "Other", count: 1 },
        ]);
      }
    }).as("getOverageResponsibilityMobile");

    mountChart([{ id: "phase_name", value: ["Decision"] }]);

    cy.wait("@getOverageResponsibilityMobile");
    cy.contains("Agency").should("exist");
    cy.contains("Other").should("exist");
  });
});
