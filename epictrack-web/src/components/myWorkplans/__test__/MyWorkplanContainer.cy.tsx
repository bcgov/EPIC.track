import React from "react";
import { MemoryRouter } from "react-router-dom";
import WorkPlanContainer from "components/myWorkplans/MyWorkplanContainer";
import {
  MyWorkplansContext,
  defaultSearchOptions,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

const makeContextValue = (overrides: Partial<any> = {}) => ({
  workplans: [],
  loadingWorkplans: false,
  lazyLoadMoreWorkplans: () => {},
  totalWorkplans: 0,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {},
  statusStalenessSettings: undefined,
  loadingMoreWorkplans: false,
  setLoadingMoreWorkplans: () => {},
  myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
  setMyWorkPlanView: () => {},
  sortOrder: "desc",
  setSortOrder: () => {},
  ...overrides,
});

const ganttWorkplan = {
  id: 10,
  title: "Work Alpha",
  current_work_phase_id: 1,
  phase_info: [
    {
      current_milestone: "M1",
      next_milestone: "M2",
      days_left: 2,
      total_number_of_days: 10,
      work_phase: {
        id: 1,
        name: "Review",
        start_date: "2026-01-01",
        end_date: "2026-01-10",
        is_completed: false,
        phase: { color: "#4F81BD" },
      },
    },
  ],
};

const mountContainer = (overrides: Partial<any> = {}) => {
  cy.mount(
    <MemoryRouter>
      <MyWorkplansContext.Provider value={makeContextValue(overrides) as any}>
        <WorkPlanContainer />
      </MyWorkplansContext.Provider>
    </MemoryRouter>,
  );
};

describe("MyWorkplanContainer", () => {
  it("renders cards view branch", () => {
    mountContainer({
      myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
      workplans: [],
      totalWorkplans: 0,
    });

    cy.contains("Workplans").should("exist");
    cy.contains("No results found").should("exist");
    cy.get("#gantt-chart").should("not.exist");
  });

  it("renders gantt view branch", () => {
    mountContainer({
      myWorkPlanView: MY_WORKPLAN_VIEW.GANTT,
      workplans: [ganttWorkplan],
      totalWorkplans: 1,
    });

    cy.get("#gantt-chart").should("exist");
    cy.contains("Work Alpha").should("exist");
    cy.contains("No results found").should("not.exist");
  });
});
