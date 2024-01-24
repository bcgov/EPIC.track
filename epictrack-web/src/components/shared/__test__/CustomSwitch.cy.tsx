import { CustomSwitch } from "../CustomSwitch";

describe("CustomSwitch component", () => {
  it("changes state when clicked", () => {
    cy.mount(<CustomSwitch />);

    // Initially, the switch should not be checked
    cy.get(".MuiSwitch-switchBase").should("not.have.class", "Mui-checked");

    // Click the switch
    cy.get(".MuiSwitch-switchBase").click();

    // Now, the switch should be checked
    cy.get(".MuiSwitch-switchBase").should("have.class", "Mui-checked");
  });

  it("is disabled when the disabled prop is true", () => {
    cy.mount(<CustomSwitch disabled />);

    // The switch should be disabled
    cy.get(".MuiSwitch-switchBase").should("have.class", "Mui-disabled");

    // Click the switch
    cy.get(".MuiSwitch-switchBase").click({ force: true });

    // The switch should still be disabled and not checked
    cy.get(".MuiSwitch-switchBase").should("have.class", "Mui-disabled");
    cy.get(".MuiSwitch-switchBase").should("not.have.class", "Mui-checked");
  });
});
