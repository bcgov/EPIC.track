import { MemoryRouter as Router } from "react-router-dom";
import PhaseContainer from "../PhaseContainer";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";

const buildPhase = (overrides?: any) => ({
  current_milestone: "Start",
  days_left: 0,
  days_taken: 10,
  end_milestone: {
    actual_date: null,
    anticipated_date: "2026-03-10T00:00:00.000Z",
    name: "Decision",
  },
  is_last_phase: false,
  milestone_progress: 0,
  next_milestone: "Decision",
  total_number_of_days: 10,
  work_phase: {
    id: 2,
    name: "Screening",
    phase: {
      id: 1,
      name: "Screening",
    },
    start_date: "2026-03-01T00:00:00.000Z",
    end_date: "2026-03-10T00:00:00.000Z",
    milestone_progress: 0,
    next_milestone: "Decision",
    is_completed: true,
    is_suspended: false,
    legislated: true,
    suspended_date: "",
    number_of_days: "10",
    responsibility_notes: "",
  },
  ...overrides,
});

describe("PhaseContainer", () => {
  it("renders empty-state message when no phases are available", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              current_work_phase_id: 2,
            } as any,
            workPhases: [],
            selectedWorkPhase: undefined,
          }}
        >
          <PhaseContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("This work has no phases to be displayed").should("exist");
  });

  it("shows extension warning when legislated timeline is exceeded", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              title: "Test Work",
              current_work_phase_id: undefined,
              is_completed: false,
            } as any,
            workPhases: [
              buildPhase({
                days_taken: 13,
                total_number_of_days: 10,
                work_phase: {
                  ...buildPhase().work_phase,
                  id: 2,
                  name: "Screening",
                },
              }),
              buildPhase({
                days_taken: 12,
                total_number_of_days: 10,
                work_phase: {
                  ...buildPhase().work_phase,
                  id: 3,
                  name: "Referral",
                },
              }),
            ] as any,
            selectedWorkPhase: {
              work_phase: {
                id: 999,
                name: "Other",
              },
            } as any,
          }}
        >
          <PhaseContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains(
      "You've exceeded the legislated timeline in phases: Screening, Referral.",
    ).should("exist");
    cy.contains("Extension Milestone").should("exist");
    cy.contains("3 days").should("exist");
  });

  it("shows date miscalculation warning when decision is complete and work is completed", () => {
    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              title: "Test Work",
              current_work_phase_id: undefined,
              is_completed: true,
            } as any,
            workPhases: [
              buildPhase({
                days_taken: 11,
                total_number_of_days: 10,
                is_last_phase: true,
                end_milestone: {
                  actual_date: "2026-03-20T00:00:00.000Z",
                  anticipated_date: "2026-03-10T00:00:00.000Z",
                  name: "Decision",
                },
                work_phase: {
                  ...buildPhase().work_phase,
                  id: 2,
                  name: "Screening",
                  is_completed: true,
                },
              }),
            ] as any,
            selectedWorkPhase: {
              work_phase: {
                id: 999,
                name: "Other",
              },
            } as any,
          }}
        >
          <PhaseContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Date Miscalculation").should("exist");
    cy.contains("submit a Data Fix request").should("exist");
  });

  it("toggles completed phases visibility while keeping current and future phases visible", () => {
    const completedPhase = buildPhase({
      work_phase: {
        ...buildPhase().work_phase,
        id: 2,
        name: "Completed Phase",
        is_completed: true,
      },
      end_milestone: {
        ...buildPhase().end_milestone,
        actual_date: "2026-03-10T00:00:00.000Z",
      },
    });

    const currentPhase = buildPhase({
      work_phase: {
        ...buildPhase().work_phase,
        id: 3,
        name: "Current Phase",
        is_completed: false,
      },
      end_milestone: {
        ...buildPhase().end_milestone,
        actual_date: null,
      },
    });

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 101,
              title: "Test Work",
              current_work_phase_id: 3,
              is_completed: false,
            } as any,
            workPhases: [completedPhase, currentPhase] as any,
            selectedWorkPhase: {
              work_phase: {
                id: 999,
                name: "Other",
              },
            } as any,
          }}
        >
          <PhaseContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("COMPLETED PHASES").should("exist");
    cy.contains("CURRENT + FUTURE PHASES").should("exist");
    cy.contains("Completed Phase").should("exist");
    cy.contains("Current Phase").should("exist");

    cy.get('input[type="checkbox"]').first().click({ force: true });
    cy.contains("Completed Phase").should("not.exist");
    cy.contains("Current Phase").should("exist");
  });

  it("switches completed date view to actual plus anticipated", () => {
    const completedPhase = buildPhase({
      work_phase: {
        ...buildPhase().work_phase,
        id: 10,
        name: "Done Phase",
        is_completed: true,
      },
      end_milestone: {
        ...buildPhase().end_milestone,
        actual_date: "2026-03-10T00:00:00.000Z",
      },
    });

    cy.mount(
      <Router>
        <WorkplanContext.Provider
          value={{
            ...initialWorkPlanContext,
            loading: false,
            work: {
              id: 102,
              title: "Test Work",
              current_work_phase_id: undefined,
              is_completed: false,
            } as any,
            workPhases: [completedPhase] as any,
            selectedWorkPhase: {
              work_phase: {
                id: 999,
                name: "Other",
              },
            } as any,
          }}
        >
          <PhaseContainer />
        </WorkplanContext.Provider>
      </Router>,
    );

    cy.contains("Phase Date View: Actual").should("exist");
    cy.contains("Phase Date View: Actual").click({ force: true });
    cy.contains("Actual + Anticipated").click({ force: true });
    cy.contains("Phase Date View: Actual + Anticipated").should("exist");
  });
});
