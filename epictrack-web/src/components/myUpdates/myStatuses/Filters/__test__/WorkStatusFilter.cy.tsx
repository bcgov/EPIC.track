import React from "react";
import { WorkStatusFilter } from "../WorkStatusFilter";
import { MyStatusesContext } from "../../MyStatusContext";

describe("WorkStatusFilter", () => {
  it("updates work status filters on apply", () => {
    const setSearchOptions = cy.stub().as("setSearchOptions");

    cy.mount(
      <MyStatusesContext.Provider
        value={
          {
            searchOptions: {
              project_is_active: ["true"],
              work_is_active: ["true"],
            },
            setSearchOptions,
          } as any
        }
      >
        <WorkStatusFilter />
      </MyStatusesContext.Provider>,
    );

    cy.contains("Work Status").click();
    cy.contains("Inactive").click();
    cy.contains("button", "Apply").click();

    cy.get("@setSearchOptions").then(() => {
      const updater = setSearchOptions.lastCall.args[0];
      const result = updater({
        project_is_active: ["true"],
        work_is_active: ["true"],
      });

      expect(result.work_is_active).to.deep.equal(["true", "false"]);
    });
  });
});
