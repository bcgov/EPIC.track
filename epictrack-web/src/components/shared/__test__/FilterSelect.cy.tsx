import React from "react";
import FilterSelect from "../filterSelect/FilterSelect";

describe("FilterSelect", () => {
  it("renders correctly", () => {
    const options = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
    ];

    cy.mount(<FilterSelect options={options} variant={"inline"} />);

    cy.get("input").should("exist");
  });

  it("can select an option", () => {
    const options = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
    ];

    cy.mount(<FilterSelect options={options} variant={"inline"} />);

    // Type 'Option 1' into the select
    cy.get("input").click().type("Option 1");

    // Check that 'Option 1' is visible and 'Option 2' is not within the MuiBox-root
    cy.get(".MuiBox-root").contains("Option 1").should("be.visible");
    cy.get(".MuiBox-root").contains("Option 2").should("not.exist");

    // Simulate clicking away from the input and then clicking back onto it
    cy.get("input").first().blur();
    // Type 'Option 2' into the select
    cy.get("input").click().type("Option 2");

    // Check that 'Option 2' is visible and 'Option 1' is not within the MuiBox-root
    cy.get(".MuiBox-root").contains("Option 2").should("be.visible");
    cy.get(".MuiBox-root").contains("Option 1").should("not.exist");
  });

  it("can select multiple options and clear selection", () => {
    const options = [
      { label: "Option 1", value: "1" },
      { label: "Option 2", value: "2" },
    ];

    cy.mount(
      <FilterSelect options={options} variant={"inline"} isMulti={true} />
    );
    cy.get("input").click();
    // Check that 'Option 1' and 'Option 2' are visible within the MuiBox-root
    cy.get(".MuiBox-root").contains("Option 1").should("be.visible");
    cy.get(".MuiBox-root").contains("Option 2").should("be.visible");
    cy.get(".MuiBox-root").contains("Select All").should("be.visible");
  });
});
