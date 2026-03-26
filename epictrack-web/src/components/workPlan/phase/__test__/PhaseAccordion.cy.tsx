import { configureStore } from "@reduxjs/toolkit";
import PhaseAccordion from "../PhaseAccordion";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import phaseOverageResponsibilityService from "services/phaseOverageResponsibilityService";

const makeStore = () => {
  const state = {
    user: {
      userDetail: {
        roles: ["extended_edit"],
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

const basePhase = {
  current_milestone: "Start",
  days_left: 2,
  days_taken: 8,
  end_milestone: {
    name: "Decision",
    anticipated_date: "2026-03-20T00:00:00.000Z",
    actual_date: null,
  },
  milestone_progress: 0,
  next_milestone: "Decision",
  total_number_of_days: 10,
  work_phase: {
    id: 12,
    name: "Readiness",
    phase: {
      name: "Readiness",
    },
    legislated: true,
    is_completed: true,
    is_suspended: false,
    start_date: "2026-03-01T00:00:00.000Z",
  },
} as any;

describe("PhaseAccordion", () => {
  it("syncs selected phase when accordion is expanded", () => {
    const setSelectedWorkPhase = cy.stub().as("setSelectedWorkPhase");

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: undefined,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase,
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={basePhase}
          expanded={true}
          onExpandHandler={cy.stub().as("onExpandHandler")}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.get("@setSelectedWorkPhase").should("have.been.calledWith", basePhase);
  });

  it("renders completed legislated summary with early-days text", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub().as("setSelectedWorkPhase"),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={basePhase}
          expanded={false}
          onExpandHandler={cy.stub().as("onExpandHandler")}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("Readiness").should("exist");
    cy.contains("8 / 10").should("exist");
    cy.contains("(2 days early)").should("exist");
    cy.contains("Legislated Phase Completed").should("exist");
    cy.contains("select option(s)").should("not.exist");
  });

  it("renders overage responsibility call-to-action for overage phases", () => {
    const overagePhase = {
      ...basePhase,
      days_left: -4,
      days_taken: 14,
      total_number_of_days: 10,
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
      next_milestone: "Decision",
      end_milestone: {
        ...basePhase.end_milestone,
        name: "Decision",
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={overagePhase}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("Overage Responsibility").should("exist");
    cy.contains("select option(s)").should("exist");
    cy.contains("(4 days over)").should("exist");
    cy.contains("Upcoming Legislated Phase").should("exist");
  });

  it("renders existing overage responsibilities when loaded", () => {
    cy.stub(phaseOverageResponsibilityService, "getAllByPhaseId")
      .as("getAllByPhaseId")
      .resolves({
        status: 200,
        data: [
          {
            id: 1,
            work_phase_id: 12,
            responsibility: "EAO",
          },
        ],
      } as any);

    const phaseWithProgress = {
      ...basePhase,
      milestone_progress: 35,
      days_left: -1,
      days_taken: 11,
      total_number_of_days: 10,
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={phaseWithProgress as any}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.get("@getAllByPhaseId").should("have.been.calledWith", "12");
    cy.contains("Overage Responsibility").should("exist");
    cy.contains("EAO").should("exist");
    cy.contains("select option(s)").should("not.exist");
  });

  it("shows notification when overage responsibilities fail to load", () => {
    cy.stub(phaseOverageResponsibilityService, "getAllByPhaseId").rejects(
      new Error("load failed"),
    );

    const phaseWithProgress = {
      ...basePhase,
      milestone_progress: 10,
      days_left: -2,
      days_taken: 12,
      total_number_of_days: 10,
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={phaseWithProgress as any}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("Could not load phase overage responsibilities.").should(
      "exist",
    );
  });

  it("renders current-phase fields with actual end date and progress bar", () => {
    const currentPhase = {
      ...basePhase,
      days_left: 0,
      days_taken: 10,
      total_number_of_days: 10,
      milestone_progress: 45,
      next_milestone: "Decision",
      end_milestone: {
        ...basePhase.end_milestone,
        actual_date: "2026-03-18T00:00:00.000Z",
      },
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={currentPhase as any}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={true}
          isCurrentPhase={true}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("Actual End").should("exist");
    cy.contains("Next milestone").should("exist");
    cy.contains("Decision").should("exist");
    cy.get(".MuiLinearProgress-root").should("exist");
  });

  it("opens overage responsibility dialog from select option action", () => {
    const overagePhase = {
      ...basePhase,
      days_left: -3,
      days_taken: 13,
      total_number_of_days: 10,
      next_milestone: "Decision",
      end_milestone: {
        ...basePhase.end_milestone,
        name: "Decision",
      },
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={overagePhase as any}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("button", "select option(s)").click({ force: true });
    cy.contains('[role="dialog"]', "Overage Responsibility").should("exist");
    cy.contains("button", "Cancel").click({ force: true });
    cy.contains('[role="dialog"]', "Overage Responsibility").should(
      "not.exist",
    );
  });

  it("opens overage responsibility dialog from edit icon when responsibilities exist", () => {
    cy.stub(phaseOverageResponsibilityService, "getAllByPhaseId").resolves({
      status: 200,
      data: [
        {
          id: 1,
          work_phase_id: 12,
          responsibility: "EAO",
        },
      ],
    } as any);

    const phaseWithProgress = {
      ...basePhase,
      milestone_progress: 25,
      days_left: -1,
      days_taken: 11,
      total_number_of_days: 10,
      work_phase: {
        ...basePhase.work_phase,
        is_completed: false,
      },
    };

    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: {
            work_phase: { id: 99 },
          } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={phaseWithProgress as any}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains("EAO").should("exist");
    cy.contains("EAO")
      .parents("div")
      .first()
      .find("button")
      .first()
      .click({ force: true });
    cy.contains('[role="dialog"]', "Overage Responsibility").should("exist");
  });
});
