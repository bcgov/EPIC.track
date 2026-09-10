import { MemoryRouter as Router } from "react-router-dom";
import { AppConfig } from "config";
import MyCalendar from "..";
import { Endpoint, setupIntercepts } from "../../../../cypress/support/utils";

const mockWorks = [
  { id: 101, title: "Alpha Work" },
  { id: 102, title: "Beta Work" },
];

const mockListType = [{ id: 1, name: "Type 1", sort_order: 1 }];

const mockCalendarEvents: any[] = [];

const endpoints: Endpoint[] = [
  {
    name: "getWorkOptions",
    method: "GET",
    url: `${AppConfig.apiUrl}works/options*`,
    response: { body: mockWorks },
  },
  {
    name: "getProjectTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}project-types*`,
    response: { body: mockListType },
  },
  {
    name: "getWorkTypes",
    method: "GET",
    url: `${AppConfig.apiUrl}work-types*`,
    response: { body: mockListType },
  },
  {
    name: "getRegions",
    method: "GET",
    url: "**/regions*",
    response: { body: mockListType },
  },
  {
    name: "getMilestones",
    method: "GET",
    url: `${AppConfig.apiUrl}milestones/calendar*`,
    response: {
      body: {
        items: mockCalendarEvents,
        total: mockCalendarEvents.length,
      },
    },
  },
  {
    name: "getTasks",
    method: "GET",
    url: `${AppConfig.apiUrl}tasks/calendar*`,
    response: { body: { items: [], total: 0 } },
  },
  {
    name: "getEaoTeams",
    method: "GET",
    url: "**/eao-teams*",
    response: { body: mockListType },
  },
];

describe("MyCalendar", () => {
  beforeEach(() => {
    setupIntercepts(endpoints);

    cy.mount(
      <Router>
        <MyCalendar />
      </Router>,
    );

    cy.wait([
      "@getWorkOptions",
      "@getProjectTypes",
      "@getWorkTypes",
      "@getRegions",
    ]);
    cy.wait(["@getMilestones", "@getTasks"]);
  });

  it("renders the default my-calendar view", () => {
    const currentYear = new Date().getFullYear();

    cy.contains("'s").should("be.visible");
    cy.contains("Calendar").should("be.visible");
    cy.contains(currentYear).should("be.visible");
    cy.contains(/Jan '\d{2}/).should("be.visible");
  });

  it("switches to EAO calendar mode when toggled", () => {
    cy.get('input[type="checkbox"]').first().should("be.checked");

    cy.get('input[type="checkbox"]').first().click({ force: true });

    cy.get('input[type="checkbox"]').first().should("not.be.checked");
    cy.wait("@getEaoTeams");
    cy.get("@getEaoTeams.all").its("length").should("be.gte", 1);
  });
});
