import React from "react";
import { WorkNameFilter } from "../WorkNameFilter";
import { workService } from "services/workService/workService";

const WorkNameFilterHarness = () => {
  const [searchOptions, setSearchOptions] = React.useState({
    work_ids: [] as number[],
  });

  return (
    <>
      <WorkNameFilter
        searchOptions={searchOptions}
        setSearchOptions={setSearchOptions}
      />
      <div data-cy="selected-work-ids">{searchOptions.work_ids.join("|")}</div>
    </>
  );
};

describe("WorkNameFilter", () => {
  it("loads and sorts work options alphabetically", () => {
    cy.stub(workService, "getOptions").resolves({
      data: [
        { id: 2, title: "Zulu Work" },
        { id: 1, title: "Alpha Work" },
      ],
    } as any);

    cy.mount(<WorkNameFilterHarness />);

    cy.get('input[placeholder="Search for Works"]')
      .should("not.be.disabled")
      .click({ force: true })
      .type("Work", { force: true });
    cy.get('li[role="option"]').first().should("contain.text", "Alpha Work");
    cy.get('li[role="option"]').eq(1).should("contain.text", "Zulu Work");
  });

  it("updates selected work ids when a work is selected", () => {
    cy.stub(workService, "getOptions").resolves({
      data: [
        { id: 11, title: "North Work" },
        { id: 12, title: "South Work" },
      ],
    } as any);

    cy.mount(<WorkNameFilterHarness />);

    cy.get('input[placeholder="Search for Works"]')
      .should("not.be.disabled")
      .click({ force: true })
      .type("North", { force: true });
    cy.contains('li[role="option"]', "North Work").click({ force: true });

    cy.get("[data-cy='selected-work-ids']").should("contain.text", "11");
  });

  it("stops loading and remains usable when loading works fails", () => {
    cy.stub(workService, "getOptions").rejects(new Error("load failed"));

    cy.mount(<WorkNameFilterHarness />);

    cy.get('input[placeholder="Search for Works"]').should("not.be.disabled");
    cy.get("[data-cy='selected-work-ids']").should("have.text", "");
  });
});
