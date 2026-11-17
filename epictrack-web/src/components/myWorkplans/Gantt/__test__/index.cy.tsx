import React from "react";
import { MemoryRouter } from "react-router-dom";
import { MyWorkplanGantt } from "components/myWorkplans/Gantt";
import {
  MyWorkplansContext,
  defaultSearchOptions,
} from "components/myWorkplans/MyWorkPlanContext";
import { MY_WORKPLAN_VIEW } from "components/myWorkplans/type";

const makeContextValue = (workplans: any[]) => ({
  workplans,
  loadingWorkplans: false,
  lazyLoadMoreWorkplans: () => {},
  totalWorkplans: workplans.length,
  searchOptions: defaultSearchOptions,
  setSearchOptions: () => {},
  statusStalenessSettings: undefined,
  loadingMoreWorkplans: false,
  setLoadingMoreWorkplans: () => {},
  myWorkPlanView: MY_WORKPLAN_VIEW.GANTT,
  setMyWorkPlanView: () => {},
  sortOrder: "desc",
  setSortOrder: () => {},
  sortKey: "start_date",
  setSortKey: () => {},
});

const workAlpha = {
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

// One of five workplans is loaded, so the list ends in a lazy-load trigger.
const PartlyLoaded = ({
  loadMore,
  initiallyLoading,
}: {
  loadMore: () => void;
  initiallyLoading: boolean;
}) => {
  const [loading, setLoading] = React.useState(initiallyLoading);
  return (
    <MemoryRouter>
      <button onClick={() => setLoading(false)}>finish loading</button>
      <MyWorkplansContext.Provider
        value={
          {
            ...makeContextValue([workAlpha]),
            totalWorkplans: 5,
            loadingMoreWorkplans: loading,
            lazyLoadMoreWorkplans: loadMore,
          } as any
        }
      >
        <MyWorkplanGantt />
      </MyWorkplansContext.Provider>
    </MemoryRouter>
  );
};

// Scroll visibility is flaky headless, so every observed element is on screen.
const reportTriggersOnScreen = () =>
  cy.window().then((win) => {
    cy.stub(win, "IntersectionObserver").callsFake((onChange) => ({
      observe: () => onChange([{ isIntersecting: true }]),
      disconnect: () => {},
    }));
  });

describe("MyWorkplanGantt", () => {
  it("renders gantt chart from array phase_info", () => {
    const workplans = [
      {
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
      },
    ];

    cy.mount(
      <MemoryRouter>
        <MyWorkplansContext.Provider value={makeContextValue(workplans) as any}>
          <MyWorkplanGantt />
        </MyWorkplansContext.Provider>
      </MemoryRouter>,
    );

    cy.get("#gantt-chart").should("exist");
    cy.contains("Work Alpha").should("exist");
    cy.contains("Today").should("exist");
  });

  it("normalizes non-array phase_info and still renders row", () => {
    const workplans = [
      {
        id: 20,
        title: "Work Beta",
        current_work_phase_id: 7,
        phase_info: {
          current_milestone: "CM",
          next_milestone: "NM",
          days_left: -1,
          total_number_of_days: 5,
          work_phase: {
            id: 7,
            name: "Decision",
            start_date: "2026-02-01",
            end_date: "2026-02-04",
            is_completed: true,
            phase: { color: "#9BBB59" },
          },
        },
      },
    ];

    cy.mount(
      <MemoryRouter>
        <MyWorkplansContext.Provider value={makeContextValue(workplans) as any}>
          <MyWorkplanGantt />
        </MyWorkplansContext.Provider>
      </MemoryRouter>,
    );

    cy.get("#gantt-chart").should("exist");
    cy.contains("Work Beta").should("exist");
  });

  it("loads more workplans when the end of the list comes into view", () => {
    reportTriggersOnScreen();
    const loadMore = cy.stub().as("loadMore");
    cy.mount(<PartlyLoaded loadMore={loadMore} initiallyLoading={false} />);

    cy.get("@loadMore").should("have.been.called");
  });

  it("waits for a running load before loading more", () => {
    reportTriggersOnScreen();
    const loadMore = cy.stub().as("loadMore");
    cy.mount(<PartlyLoaded loadMore={loadMore} initiallyLoading={true} />);

    cy.contains("Work Alpha").should("exist");
    cy.get("[data-cy=load-more-trigger]").should("not.exist");
    cy.get("@loadMore").should("not.have.been.called");

    cy.contains("button", "finish loading").click();
    cy.get("[data-cy=load-more-trigger]").should("exist");
    cy.get("@loadMore").should("have.been.called");
  });
});
