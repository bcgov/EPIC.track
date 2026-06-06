import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import CardList from "components/myWorkplans/CardList";
import {
  MyWorkplansContext,
  defaultSearchOptions,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

const makeStore = () => {
  const state = {
    user: {
      userDetail: {
        staffId: 99,
        email: "owner@gov.bc.ca",
        roles: [],
      },
    },
    uiState: {},
    loadingState: {},
  };

  return configureStore({
    reducer: () => state,
    preloadedState: state,
  });
};

const baseWorkplan = {
  id: 101,
  project: { name: "Mountain Expansion" },
  work_type: { name: "Environmental Assessment" },
  simple_title: "Package A",
  work_state: "IN_PROGRESS",
  current_work_phase_id: 1,
  phase_info: [
    {
      current_milestone: "Submission",
      next_milestone: "Review Complete",
      next_milestone_date: "2026-06-10",
      decision: "Approved",
      decision_milestone_date: "2026-06-15",
      days_left: 5,
      total_number_of_days: 20,
      work_phase: {
        id: 1,
        name: "Review",
        start_date: "2026-05-20",
        end_date: "2026-06-12",
        is_completed: false,
        phase: { color: "#4F81BD" },
      },
    },
  ],
  status_info: {
    posted_date: "2026-05-15",
    description: "Workplan status description",
  },
  federal_involvement: { name: "Canadian Environmental Agency" },
  eao_team: { name: "North" },
  staff_info: [
    {
      role: { name: "Team Lead" },
      staff: {
        id: 10,
        full_name: "Owner Person",
        first_name: "Owner",
        last_name: "Person",
        email: "owner@gov.bc.ca",
        phone: "250-555-0101",
        position: { name: "Director" },
      },
    },
    {
      role: { name: "Staff" },
      staff: {
        id: 11,
        full_name: "Staff Member",
        first_name: "Staff",
        last_name: "Member",
        email: "staff@gov.bc.ca",
        phone: "250-555-0102",
        position: { name: "Analyst" },
      },
    },
  ],
};

const makeContextValue = (overrides: Partial<any> = {}) => ({
  workplans: [],
  loadingWorkplans: false,
  totalWorkplans: 0,
  loadingMoreWorkplans: false,
  lazyLoadMoreWorkplans: () => {},
  setLoadingMoreWorkplans: () => {},
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {},
  statusStalenessSettings: {
    staleness_length: 14,
    warning_length: 7,
  },
  myWorkPlanView: MY_WORKPLAN_VIEW.CARDS,
  setMyWorkPlanView: () => {},
  sortOrder: "desc",
  setSortOrder: () => {},
  ...overrides,
});

const mountCardList = (contextOverrides: Partial<any> = {}) => {
  cy.mount(
    <MemoryRouter>
      <MyWorkplansContext.Provider
        value={makeContextValue(contextOverrides) as any}
      >
        <CardList />
      </MyWorkplansContext.Provider>
    </MemoryRouter>,
    { reduxStore: makeStore() },
  );
};

describe("CardList", () => {
  it("renders loading skeletons while workplans are loading", () => {
    mountCardList({ loadingWorkplans: true });

    cy.get(".MuiSkeleton-root").should("have.length", 6);
    cy.contains("No results found").should("not.exist");
  });

  it("shows no results message when list is empty", () => {
    mountCardList({
      workplans: [],
      totalWorkplans: 0,
      loadingWorkplans: false,
    });

    cy.contains("No results found").should("exist");
    cy.contains("Adjust your parameters and try again").should("exist");
  });

  it("renders cards and hides pagination skeleton when all workplans are loaded", () => {
    mountCardList({
      workplans: [baseWorkplan],
      totalWorkplans: 1,
      loadingWorkplans: false,
      loadingMoreWorkplans: false,
    });

    cy.contains("Mountain Expansion").should("exist");
    cy.contains("Environmental Assessment - Package A").should("exist");
    cy.contains("View").should("exist");
    cy.get(".MuiSkeleton-root").should("not.exist");
  });

  it("triggers lazy loading when the sentinel is viewed", () => {
    const setLoadingMoreWorkplans = cy.stub().as("setLoading");
    const lazyLoadMoreWorkplans = cy.stub().as("lazyLoad");

    mountCardList({
      workplans: [baseWorkplan],
      totalWorkplans: 3,
      loadingWorkplans: false,
      loadingMoreWorkplans: false,
      setLoadingMoreWorkplans,
      lazyLoadMoreWorkplans,
    });

    cy.get("[style='width: 100%;']").scrollIntoView();
    cy.get("@setLoading").should("have.been.calledWith", true);
    cy.get("@lazyLoad").should("have.been.called");
    cy.get(".MuiSkeleton-root").should("have.length", 6);
  });
});
