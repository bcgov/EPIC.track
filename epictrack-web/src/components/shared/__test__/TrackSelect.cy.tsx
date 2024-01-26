import TrackSelect from "../TrackSelect";
describe("TrackSelect", () => {
  beforeEach(() => {
    cy.mount(<TrackSelect />);
  });

  it("should be searchable", () => {
    cy.get(".react-select__control").click();
    cy.get(".react-select__input input").type("Option 1");
    cy.get(".react-select__option").contains("Option 1").click();
    cy.get(".react-select__single-value").contains("Option 1");
  });

  it("should be clearable", () => {
    cy.get(".react-select__control").click();
    cy.get(".react-select__input input").type("Option 1");
    cy.get(".react-select__option").contains("Option 1").click();
    cy.get(".react-select__clear-indicator").click();
    cy.get(".react-select__single-value").should("not.exist");
  });

  it("should show error message when error prop is true", () => {
    cy.mount(<TrackSelect error helperText="Error message" />);
    cy.get(".MuiFormHelperText-root").contains("Error message");
  });
});
