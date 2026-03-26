import React from "react";
import { TooltipBody } from "../Body";

const baseTask = {
  id: 1,
  name: "Review",
  rowName: "Work Alpha",
  start: new Date("2026-03-01T00:00:00.000Z"),
  end: new Date("2026-03-04T00:00:00.000Z"),
};

describe("Workplan Gantt tooltip body", () => {
  it("renders completed phase body when task is completed", () => {
    cy.mount(
      <TooltipBody
        task={
          {
            ...baseTask,
            is_completed: true,
            is_current: false,
          } as any
        }
      />,
    );

    cy.contains("Phase End:").should("exist");
    cy.contains("Anticipated Start:").should("not.exist");
  });

  it("renders current phase body when task is current", () => {
    cy.mount(
      <TooltipBody
        task={
          {
            ...baseTask,
            is_completed: false,
            is_current: true,
            progress: "2/5",
            style: { progress: { color: "rgb(0, 0, 0)" } },
            currentMilestone: "Review Open",
            nextMilestone: "EAO Decision",
          } as any
        }
      />,
    );

    cy.contains("Current Milestone:").should("exist");
    cy.contains("Review Open").should("exist");
    cy.contains("Next Milestone:").should("exist");
  });

  it("renders future phase body when task is neither completed nor current", () => {
    cy.mount(
      <TooltipBody
        task={
          {
            ...baseTask,
            is_completed: false,
            is_current: false,
          } as any
        }
      />,
    );

    cy.contains("Anticipated Start:").should("exist");
    cy.contains("Anticipated End:").should("exist");
    cy.contains("Phase End:").should("not.exist");
  });
});
