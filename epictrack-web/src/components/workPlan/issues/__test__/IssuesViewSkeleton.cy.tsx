import React from "react";
import IssuesViewSkeleton from "components/workPlan/issues/IssuesViewSkeleton";

describe("IssuesViewSkeleton", () => {
  it("renders two rectangular loading placeholders", () => {
    cy.mount(<IssuesViewSkeleton />);

    cy.get(".MuiSkeleton-root").should("have.length", 2);
  });
});
