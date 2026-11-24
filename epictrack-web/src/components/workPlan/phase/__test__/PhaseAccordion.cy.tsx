import { configureStore } from "@reduxjs/toolkit";
import PhaseAccordion from "../PhaseAccordion";
import { WorkplanContext, initialWorkPlanContext } from "../../WorkPlanContext";
import { workPhasesApi } from "api/workPhases";

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
    requires_overage_responsibility: true,
    is_completed: true,
    is_suspended: false,
    start_date: "2026-03-01T00:00:00.000Z",
  },
} as any;

const mountOverPhase = (workPhase: Record<string, unknown>) =>
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
        phase={{
          ...basePhase,
          days_left: -4,
          days_taken: 14,
          total_number_of_days: 10,
          work_phase: {
            ...basePhase.work_phase,
            is_completed: false,
            ...workPhase,
          },
        }}
        expanded={false}
        onExpandHandler={cy.stub()}
        showAnticipated={true}
        showActual={false}
        isCurrentPhase={false}
      />
    </WorkplanContext.Provider>,
    { reduxStore: makeStore() },
  );

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

  it("requires a responsibility in a non-legislated phase when the phase says so", () => {
    mountOverPhase({
      legislated: false,
      requires_overage_responsibility: true,
    });

    cy.contains("(4 days over)").should("exist");
    cy.contains("Overage Responsibility").find("span").should("have.text", "*");
  });

  it("tells a legislated phase over its limit to add an extension before it can complete", () => {
    mountOverPhase({
      legislated: true,
      requires_overage_responsibility: true,
    });

    cy.contains("You've exceeded the legislated timeline in Readiness.").should(
      "exist",
    );
    cy.contains(
      "You must add a Time Limit Extension of at least 4 days before you can complete this phase.",
    ).should("exist");
    cy.contains("You must add an Overage Responsibility").should("not.exist");
  });

  it("asks for a one-day extension in the singular", () => {
    cy.mount(
      <WorkplanContext.Provider
        value={{
          ...initialWorkPlanContext,
          work: { id: 101, work_type_id: 1 } as any,
          selectedWorkPhase: { work_phase: { id: 99 } } as any,
          setSelectedWorkPhase: cy.stub(),
          getWorkPhases: cy.stub(),
        }}
      >
        <PhaseAccordion
          phase={{
            ...basePhase,
            days_taken: 11,
            total_number_of_days: 10,
            work_phase: { ...basePhase.work_phase, is_completed: false },
          }}
          expanded={false}
          onExpandHandler={cy.stub()}
          showAnticipated={true}
          showActual={false}
          isCurrentPhase={false}
        />
      </WorkplanContext.Provider>,
      { reduxStore: makeStore() },
    );

    cy.contains(
      "You must add a Time Limit Extension of at least 1 day before you can complete this phase.",
    ).should("exist");
  });

  it("tells a non-legislated phase that requires one to add a responsibility", () => {
    mountOverPhase({
      legislated: false,
      requires_overage_responsibility: true,
    });

    cy.contains("You've exceeded the timeline in Readiness.").should("exist");
    cy.contains(
      "You must add an Overage Responsibility before you can complete this phase.",
    ).should("exist");
    cy.contains("Time Limit Extension").should("not.exist");
  });

  it("doesn't require a responsibility when the phase says it isn't needed", () => {
    mountOverPhase({
      legislated: false,
      requires_overage_responsibility: false,
    });

    cy.contains("Overage Responsibility").should("exist");
    cy.contains("(4 days over)").should("not.exist");
    cy.contains("Overage Responsibility").find("span").should("not.exist");
  });

  it("renders existing overage responsibilities when loaded", () => {
    cy.stub(workPhasesApi, "listOverageResponsibilities")
      .as("getAllByPhaseId")
      .resolves([
        { id: 1, work_phase_id: 12, responsibility: "EAO", is_active: true },
      ] as any);

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

    cy.get("@getAllByPhaseId").should("have.been.calledWith", 12);
    cy.contains("Overage Responsibility").should("exist");
    cy.contains("EAO").should("exist");
    cy.contains("select option(s)").should("not.exist");
  });

  it("shows notification when overage responsibilities fail to load", () => {
    cy.stub(workPhasesApi, "listOverageResponsibilities").rejects(
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
    cy.stub(workPhasesApi, "listOverageResponsibilities").resolves([
      { id: 1, work_phase_id: 12, responsibility: "EAO", is_active: true },
    ] as any);

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
  it("saves overage responsibilities by enum value, with the work id", () => {
    cy.stub(workPhasesApi, "listOverageResponsibilities").resolves([
      { id: 1, work_phase_id: 12, responsibility: "EAO", is_active: true },
    ] as any);
    cy.stub(workPhasesApi, "saveOverageNotes").as("saveNotes").resolves();
    cy.stub(workPhasesApi, "addOverageResponsibility").as("add").resolves();
    cy.stub(workPhasesApi, "removeOverageResponsibility")
      .as("remove")
      .resolves();

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

    cy.contains("EAO")
      .parents("div")
      .first()
      .find("button")
      .first()
      .click({ force: true });
    cy.get('[role="dialog"] [aria-label="Remove EAO"]').click({ force: true });
    cy.get('[role="dialog"] input[role="combobox"]').click({ force: true });
    cy.findByText("Proponent").click();
    cy.contains('[role="dialog"] button', "Save").click();

    cy.get("@saveNotes").should("have.been.calledWith", 99);
    cy.get("@add").should("have.been.calledOnceWith", {
      work_phase_id: 99,
      responsibility: "Proponent",
      work_id: 101,
    });
    cy.get("@remove").should("have.been.calledOnceWith", 1, 101);
  });
});
