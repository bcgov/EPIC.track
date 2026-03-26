import React from "react";
import { CompletedPhase } from "components/myWorkplans/Gantt/WorkplanGanttTooltip/CompletedPhase";
import { FuturePhase } from "components/myWorkplans/Gantt/WorkplanGanttTooltip/FuturePhase";
import { CurrentPhase } from "components/myWorkplans/Gantt/WorkplanGanttTooltip/CurrentPhase";

const task = {
  id: 1,
  name: "Review",
  rowName: "Work Alpha",
  start: new Date("2026-03-01T00:00:00.000Z"),
  end: new Date("2026-03-04T00:00:00.000Z"),
};

describe("Workplan Gantt tooltip phases", () => {
  it("renders completed phase details", () => {
    cy.mount(<CompletedPhase task={task as any} />);

    cy.contains("Work Alpha").should("exist");
    cy.contains("Review").should("exist");
    cy.contains("Phase Start:").should("exist");
    cy.contains("Phase End:").should("exist");
    cy.contains("Days:").should("exist");
    cy.contains("3").should("exist");
  });

  it("renders future phase details", () => {
    cy.mount(<FuturePhase task={task as any} />);

    cy.contains("Work Alpha").should("exist");
    cy.contains("Review").should("exist");
    cy.contains("Anticipated Start:").should("exist");
    cy.contains("Anticipated End:").should("exist");
    cy.contains("Days:").should("exist");
    cy.contains("3").should("exist");
  });

  it("renders current phase details", () => {
    cy.mount(
      <CurrentPhase
        task={
          {
            ...task,
            progress: "5/10",
            style: { progress: { color: "rgb(0, 0, 0)" } },
            currentMilestone: "Submission",
            nextMilestone: "Decision",
          } as any
        }
      />,
    );

    cy.contains("Work Alpha").should("exist");
    cy.contains("Review").should("exist");
    cy.contains("Phase Start:").should("exist");
    cy.contains("Anticipated End:").should("exist");
    cy.contains("Days:").should("exist");
    cy.contains("5/10").should("exist");
    cy.contains("Current Milestone:").should("exist");
    cy.contains("Submission").should("exist");
    cy.contains("Next Milestone:").should("exist");
    cy.contains("Decision").should("exist");
  });
});
