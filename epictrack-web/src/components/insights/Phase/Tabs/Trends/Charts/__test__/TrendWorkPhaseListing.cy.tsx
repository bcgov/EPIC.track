import React from "react";
import { MemoryRouter } from "react-router-dom";
import TrendWorkPhaseListing from "components/insights/Phase/Tabs/Trends/Charts/TrendWorkPhaseListing";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { PhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";

const workPhases = [
  {
    work_id: 101,
    work_type_id: 1,
    work_phase_id: 10,
    work_title: "Alpha Work",
    work_type_name: "EA",
    phase_name: "Review",
    phase_id: 1,
    work_phase_end_date: "2026-02-15T00:00:00.000Z",
    ea_act_name: "Act A",
    phase_overage_responsibilities: [],
    total_days: 10,
    days_taken: 11,
    days_left: -1,
    legislated_length: 1,
    days_over: 1,
  },
  {
    work_id: 102,
    work_type_id: 2,
    work_phase_id: 20,
    work_title: "Beta Work",
    work_type_name: "EA",
    phase_name: "Decision",
    phase_id: 2,
    work_phase_end_date: "2025-10-20T00:00:00.000Z",
    ea_act_name: "Act B",
    phase_overage_responsibilities: [],
    total_days: 20,
    days_taken: 23,
    days_left: -3,
    legislated_length: 5,
    days_over: 3,
  },
] as any;

const mountWithContext = (viewUnderage = false, phases = workPhases) => {
  cy.mount(
    <MemoryRouter>
      <TableFilterProvider>
        <PhaseInsightsContext.Provider
          value={{
            workPhases: phases,
            loadingWorkPhases: false,
            viewUnderage,
            setViewUnderage: () => {},
          }}
        >
          <TrendWorkPhaseListing />
        </PhaseInsightsContext.Provider>
      </TableFilterProvider>
    </MemoryRouter>,
  );
};

describe("TrendWorkPhaseListing", () => {
  it("renders rows and overage column in default mode", () => {
    mountWithContext(false);

    cy.contains("Alpha Work").should("exist");
    cy.contains("Beta Work").should("exist");
    cy.contains("Overage").should("exist");
    cy.contains("Legislated Length").should("exist");

    cy.contains("1 day").should("exist");
    cy.contains("5 days").should("exist");
    cy.contains("3 days").should("exist");
    cy.contains("2026").should("exist");
    cy.contains("2025").should("exist");
  });

  it("switches days-over header to underage view", () => {
    mountWithContext(true);

    cy.contains("Underage").should("exist");
    cy.contains("Overage").should("not.exist");
  });

  it("shows export action and handles export click", () => {
    mountWithContext(false);

    cy.get("button .icon").first().parent("button").click({ force: true });
    cy.contains("Alpha Work").should("exist");
  });

  it("renders blank year cell when phase end date is missing", () => {
    const phasesWithNoYear = [
      ...workPhases,
      {
        work_id: 103,
        work_type_id: 1,
        work_phase_id: 30,
        work_title: "Gamma Work",
        work_type_name: "EA",
        phase_name: "Planning",
        phase_id: 3,
        work_phase_end_date: null,
        ea_act_name: "Act A",
        phase_overage_responsibilities: [],
        total_days: 15,
        days_taken: 15,
        days_left: 0,
        legislated_length: 2,
        days_over: 0,
      },
    ] as any;

    mountWithContext(false, phasesWithNoYear);

    cy.contains("Gamma Work")
      .parents("tr")
      .first()
      .within(() => {
        cy.contains("2026").should("not.exist");
        cy.contains("2025").should("not.exist");
      });
  });
});
