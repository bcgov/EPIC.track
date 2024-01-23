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
      />
    );
    cy.get('div[role="dialog"]').contains("Test Content").should("be.visible");
  });
});
