import { MemoryRouter as Router } from "react-router-dom";
import { EventCalendarContainer } from "components/calendar/EventCalendarContainer";
import { mockCalendarEvents } from "../../../../cypress/support/common";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";
import { AppConfig } from "config";
import { EventCalendarProvider } from "../EventCalendarContext";

const endpoints: Endpoint[] = [
  {
    name: "getMilestones",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/calendar*`,
    response: {
      body: { items: mockCalendarEvents, total: mockCalendarEvents.length },
    },
  },
  {
    name: "getTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/calendar*`,
    response: { body: { items: [], total: 0 } },
  },
];

describe("EventCalendarContainer", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);
  });

  it("renders calendar with current year", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <EventCalendarContainer />
        </EventCalendarProvider>
      </Router>
    );

    // Year should render as plain text
    const currentYear = new Date().getFullYear();
    cy.contains(currentYear).should("exist");

    // Calendar should render days header
    cy.contains("M").should("exist");
    cy.contains("S").should("exist");

    // Months should render
    cy.contains(/Jan '\d{2}/).should("exist");
    cy.contains(/Dec '\d{2}/).should("exist");
  });

  it("navigates to previous and next year", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <EventCalendarContainer />
        </EventCalendarProvider>
      </Router>
    );

    const currentYear = new Date().getFullYear();

    cy.contains(currentYear).should("exist");

    // Click previous year button (first IconButton)
    cy.get("button").first().click();
    cy.contains(currentYear - 1).should("exist");

    // Click next button twice to go to future year
    cy.contains(currentYear - 1)
      .parent()
      .find("button")
      .last()
      .click()
      .click();

    cy.contains(currentYear + 1).should("exist");
  });
});
