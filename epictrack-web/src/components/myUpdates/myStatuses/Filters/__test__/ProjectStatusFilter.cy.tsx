import React from "react";
import { ProjectStatusFilter } from "../ProjectStatusFilter";
import { MyStatusesContext } from "../../MyStatusContext";

describe("ProjectStatusFilter", () => {
  it("updates project status filters on apply", () => {
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
        <ProjectStatusFilter />
      </MyStatusesContext.Provider>,
    );

    cy.contains("Project Status").click();
    cy.contains("Inactive").click();
    cy.contains("button", "Apply").click();

    cy.get("@setSearchOptions").then(() => {
      const updater = setSearchOptions.lastCall.args[0];
      const result = updater({
        project_is_active: ["true"],
        work_is_active: ["true"],
      });

      expect(result.project_is_active).to.deep.equal(["true", "false"]);
    });
  });
});
