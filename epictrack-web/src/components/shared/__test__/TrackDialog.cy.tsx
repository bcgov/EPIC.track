import TrackDialog from "../TrackDialog";

describe("TrackDialog", () => {
  it("renders the correct dialog title", () => {
    cy.mount(<TrackDialog open={true} dialogTitle="Test Dialog" />);
    cy.get(".modal-header").contains("Test Dialog").should("be.visible");
  });

  it("renders the correct dialog content", () => {
    cy.mount(
      <TrackDialog
        open={true}
        dialogTitle="Test Dialog"
        dialogContentText="Test Content"
      />,
    );
    cy.get('div[role="dialog"]').contains("Test Content").should("be.visible");
  });

  it("keeps its own props off the dialog's DOM", () => {
    cy.mount(
      <TrackDialog
        open={true}
        dialogTitle="Test Dialog"
        formId="test-form"
        okButtonText="Save"
        isActionsRequired
      />,
    );
    cy.contains("button", "Save").should("be.visible");
    cy.get(".MuiDialog-root").should(($root) => {
      ["dialogtitle", "formid", "okbuttontext"].forEach((name) =>
        expect($root).not.to.have.attr(name),
      );
    });
  });
});
