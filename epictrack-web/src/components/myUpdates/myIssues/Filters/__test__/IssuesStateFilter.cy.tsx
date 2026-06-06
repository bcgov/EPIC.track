import React from "react";
import { IssueStateFilter } from "../IssuesStateFilter";
import { MyIssuesContext } from "../../MyIssuesContext";

describe("IssuesStateFilter", () => {
  it("updates issue state filters on apply", () => {
    const setSearchOptions = cy.stub().as("setSearchOptions");

    cy.mount(
      <MyIssuesContext.Provider
        value={
          {
            searchOptions: {
              issue_state: ["is_active:true"],
            },
            setSearchOptions,
          } as any
        }
      >
        <IssueStateFilter />
      </MyIssuesContext.Provider>,
    );

    cy.contains("Issue State").click();
    cy.contains("Resolved").click();
    cy.contains("button", "Apply").click();

    cy.get("@setSearchOptions").then(() => {
      const updater = setSearchOptions.lastCall.args[0];
      const result = updater({
        issue_state: ["is_active:true"],
      });

      expect(result.issue_state).to.include("is_active:true");
      expect(result.issue_state).to.include("is_resolved:true");
    });
  });
});
