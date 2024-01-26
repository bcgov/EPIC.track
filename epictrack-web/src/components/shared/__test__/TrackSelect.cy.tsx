import TrackSelect from "../TrackSelect";
describe("TrackSelect", () => {
  beforeEach(() => {
    cy.mount(<TrackSelect />);
  });

  it("should be searchable", () => {
    cy.get("input").click().type("Option 1");
  });

  it("should be clearable", () => {
    cy.get("input").click().type("Option 1{enter}");
    cy.get("body").click(); // Click off the select
    cy.get("input").click(); // Re-click the input
    cy.get("input").should("have.value", ""); // Check that the input is empty
  });

  it("should show error message when error prop is true", () => {
    cy.mount(<TrackSelect error helperText="Error message" />);
    cy.get(".MuiFormHelperText-root").contains("Error message");
  });
});
