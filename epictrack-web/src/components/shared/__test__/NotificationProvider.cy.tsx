import ETNotificationProvider from "../notificationProvider/ETNotificationProvider";
import { showNotification } from "../notificationProvider";

describe("NotificationProvider", () => {
  it("should show success notification", () => {
    const message = "Notification Provider works!";
    const TestComponent = () => (
      <ETNotificationProvider>
        <button onClick={() => showNotification(message, { type: "success" })}>
          Show notification
        </button>
      </ETNotificationProvider>
    );
    cy.mount(<TestComponent />);
    cy.get("button").click();
    cy.contains(message);
  });

  it("should show error notification", () => {
    const message = "Notification Provider works!";
    const TestComponent = () => (
      <ETNotificationProvider>
        <button onClick={() => showNotification(message, { type: "success" })}>
          Show notification
        </button>
      </ETNotificationProvider>
    );
    cy.mount(<TestComponent />);
    cy.get("button").click();
    cy.contains(message);
  });

  it("should show warning notification", () => {
    const message = "Notification Provider works!";
    const TestComponent = () => (
      <ETNotificationProvider>
        <button onClick={() => showNotification(message, { type: "warning" })}>
          Show notification
        </button>
      </ETNotificationProvider>
    );
    cy.mount(<TestComponent />);
    cy.get("button").click();
    cy.contains(message);
  });

  it("should show info notification", () => {
    const message = "Notification Provider works!";
    const TestComponent = () => (
      <ETNotificationProvider>
        <button onClick={() => showNotification(message, { type: "info" })}>
          Show notification
        </button>
      </ETNotificationProvider>
    );
    cy.mount(<TestComponent />);
    cy.get("button").click();
    cy.contains(message);
  });
});
