import {
  COLORS,
  BAR_COLOR,
  getChartColor,
  exportAccordionChartsToPdf,
} from "components/insights/utils";

describe("insights utils", () => {
  it("returns expected constants", () => {
    cy.wrap(COLORS.length).should("eq", 10);
    cy.wrap(BAR_COLOR).should("eq", "#4BACC6");
  });

  it("returns palette color when index is in range", () => {
    cy.wrap(getChartColor(0)).should("eq", COLORS[0]);
    cy.wrap(getChartColor(4)).should("eq", COLORS[4]);
  });

  it("returns generated color when index is out of range", () => {
    cy.stub(Math, "random").returns(0.5);

    cy.wrap(getChartColor(99)).should("match", /^#[0-9a-f]+$/);
  });

  it("returns early when container is not provided", () => {
    cy.wrap(null).then(async () => {
      await exportAccordionChartsToPdf(
        null as unknown as HTMLDivElement,
        "My Export Name",
      );
    });

    cy.get("body .exporting").should("not.exist");
  });
});
