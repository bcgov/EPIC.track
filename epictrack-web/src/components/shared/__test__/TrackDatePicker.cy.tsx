import TrackDatePicker from "../DatePicker/index";

describe("TrackDatePicker", () => {
  it("renders correctly and opens when clicked", () => {
    cy.mount(<TrackDatePicker />);
    cy.get('input[type="text"]').first().as("dateInput");
    cy.get("@dateInput").should("be.visible");

    cy.get('[aria-label="Choose date"]').click();
    cy.get('[aria-current="date"]').click();
    cy.get("@dateInput").invoke("val").should("not.equal", "");
  });
});
