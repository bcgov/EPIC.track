import React from "react";
import { MemoryRouter } from "react-router-dom";
import GeneralWorkPhaseListing from "components/insights/Phase/Tabs/General/Charts/GeneralWorkPhaseListing";
import { TableFilterProvider } from "components/insights/TableFilterContext";
import { PhaseInsightsContext } from "components/insights/Phase/PhaseInsightsContext";

const workPhases = [
  {
    work_id: 201,
    work_type_id: 1,
    work_phase_id: 101,
    work_title: "Gamma Work",
    work_type_name: "Type A",
    phase_name: "Review",
    phase_id: 1,
    work_phase_end_date: "2026-01-11T00:00:00.000Z",
    ea_act_name: "Act A",
    phase_overage_responsibilities: ["EAO"],
    total_days: 30,
    days_taken: 30,
    days_left: 0,
    legislated_length: 20,
    days_over: 1,
  },
  {
    work_id: 202,
    work_type_id: 2,
    work_phase_id: 102,
    work_title: "Delta Work",
    work_type_name: "Type B",
    phase_name: "Decision",
    phase_id: 2,
    work_phase_end_date: "2025-12-01T00:00:00.000Z",
    ea_act_name: "Act B",
    phase_overage_responsibilities: ["Proponent", "EAO"],
    total_days: 45,
    days_taken: 50,
    days_left: -5,
    legislated_length: 45,
    days_over: 5,
  },
] as any;

const mountWithContext = (viewUnderage = false) => {
  cy.mount(
    <MemoryRouter>
      <TableFilterProvider>
        <PhaseInsightsContext.Provider
          value={{
            workPhases,
            loadingWorkPhases: false,
            viewUnderage,
            setViewUnderage: () => {},
          }}
        >
          <GeneralWorkPhaseListing />
        </PhaseInsightsContext.Provider>
      </TableFilterProvider>
    </MemoryRouter>,
  );
};

describe("GeneralWorkPhaseListing", () => {
  it("renders rows and general columns", () => {
    mountWithContext(false);

    cy.contains("Gamma Work").should("exist");
    cy.contains("Delta Work").should("exist");
    cy.contains("Responsibility").should("exist");
    cy.contains("Legislated Length").should("exist");
    cy.contains("Days Taken").should("exist");
    cy.contains("Overage").should("exist");

    cy.contains("20 days").should("exist");
    cy.contains("45 days").should("exist");
    cy.contains("1 day").should("exist");
    cy.contains("5 days").should("exist");
    cy.contains("Proponent, EAO").should("exist");
  });

  it("renders underage column label when toggled", () => {
    mountWithContext(true);

    cy.contains("Underage").should("exist");
    cy.contains("Overage").should("not.exist");
  });
});
