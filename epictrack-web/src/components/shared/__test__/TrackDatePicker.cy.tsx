import TrackDatePicker from "../DatePicker/index";

describe("TrackDatePicker", () => {
  it("renders correctly and opens when clicked", () => {
    cy.mount(<TrackDatePicker />);
    // Check if the date picker is rendered
    cy.get("button").should("be.visible");

    // Click the date picker to open it
    cy.get("button").click();

    // Find the 'MuiDayCalendar-monthContainer' div and click the first button inside it
    cy.get(".MuiDayCalendar-monthContainer").find("button").first().click();

    // Check if the input field has any text
    cy.get("input").should("not.have.value", "");
  });
});
