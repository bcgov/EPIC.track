import CopyButton from "../CopyButton";
import ETNotificationProvider from "../notificationProvider/ETNotificationProvider";

describe("CopyButton component", () => {
  it("changes icon when hovered", () => {
    cy.mount(<CopyButton copyText="test" />);

    // Initially, the outlined icon should be visible
    cy.get(".profile-menu-icon");

    // Hover over the button
    cy.get("button").trigger("mouseover");
  });

  it("copies text to clipboard when clicked", () => {
    // Stub navigator.clipboard.writeText
    cy.window().then((win) => {
      Object.defineProperty(win.navigator, "clipboard", {
        value: {
          writeText: cy.stub().as("clipboardWriteText"),
        },
      });
    });

    cy.mount(
      <ETNotificationProvider>
        <CopyButton copyText="test" />
      </ETNotificationProvider>
    );

    // Click the button
    cy.get("button").click();

    cy.get("@clipboardWriteText").should("have.been.calledWith", "test");
  });
});
