import { sortTeam } from "components/myWorkplans/Card/Staff/utils";

describe("sortTeam", () => {
  it("moves the matching staff member to the front", () => {
    const team = [
      { staff: { email: "alpha@gov.bc.ca", name: "Alpha" } },
      { staff: { email: "beta@gov.bc.ca", name: "Beta" } },
      { staff: { email: "gamma@gov.bc.ca", name: "Gamma" } },
    ];

    const sorted = sortTeam(team, "gamma@gov.bc.ca");

    cy.wrap(sorted[0].staff.email).should("eq", "gamma@gov.bc.ca");
    cy.wrap(sorted[1].staff.email).should("eq", "beta@gov.bc.ca");
    cy.wrap(sorted[2].staff.email).should("eq", "alpha@gov.bc.ca");
  });

  it("leaves the original order when no staff email matches", () => {
    const team = [
      { staff: { email: "alpha@gov.bc.ca" } },
      { staff: { email: "beta@gov.bc.ca" } },
    ];

    const sorted = sortTeam(team, "missing@gov.bc.ca");

    cy.wrap(sorted.map((item) => item.staff.email)).should("deep.equal", [
      "alpha@gov.bc.ca",
      "beta@gov.bc.ca",
    ]);
  });

  it("keeps the same order when the matching staff is already first", () => {
    const team = [
      { staff: { email: "alpha@gov.bc.ca" } },
      { staff: { email: "beta@gov.bc.ca" } },
    ];

    const sorted = sortTeam(team, "alpha@gov.bc.ca");

    cy.wrap(sorted.map((item) => item.staff.email)).should("deep.equal", [
      "alpha@gov.bc.ca",
      "beta@gov.bc.ca",
    ]);
  });
});
