import React from "react";
import TaskListSkeleton from "components/gantt/TaskListSkeleton";

describe("TaskListSkeleton", () => {
  it("renders four placeholder task rows", () => {
    cy.mount(<TaskListSkeleton />);

    cy.get(".MuiSkeleton-root").should("have.length", 4);
  });
});
