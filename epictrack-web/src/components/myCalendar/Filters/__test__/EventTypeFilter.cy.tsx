import React from "react";
import {
  EventCalendarProvider,
  useEventCalendarContext,
} from "components/calendar/EventCalendarContext";
import { EVENT_TYPE_OPTIONS, EventTypeFilter } from "../EventTypeFilter";

const SearchOptionsProbe = () => {
  const { searchOptions } = useEventCalendarContext();
  return <div data-cy="event-types">{searchOptions.event_types.join("|")}</div>;
};

describe("EventTypeFilter", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/milestones/calendar*", {
      statusCode: 200,
      body: { items: [], total: 0 },
    }).as("getMilestones");
    cy.intercept("GET", "**/tasks/calendar*", {
      statusCode: 200,
      body: { items: [], total: 0 },
    }).as("getTasks");
  });

  it("applies selected event types", () => {
    cy.mount(
      <EventCalendarProvider
        initialSearchOptions={{ event_types: ["include_tasks:true"] } as any}
      >
        <EventTypeFilter />
        <SearchOptionsProbe />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");

    cy.contains("Event Type").click({ force: true });
    cy.contains("Decision").click({ force: true });
    cy.contains("button", "Apply").click({ force: true });

    const decisionValue = EVENT_TYPE_OPTIONS.find(
      (option) => option.label === "Decision",
    )?.value;

    cy.get("[data-cy='event-types']").should(
      "contain.text",
      "include_tasks:true",
    );
    cy.get("[data-cy='event-types']").should(
      "contain.text",
      String(decisionValue),
    );
  });

  it("resets to default options when filters are cleared", () => {
    cy.mount(
      <EventCalendarProvider initialSearchOptions={{ event_types: [] } as any}>
        <EventTypeFilter />
        <SearchOptionsProbe />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");

    cy.contains("Event Type").click({ force: true });
    cy.contains("button", "Clear Filters").click({ force: true });

    EVENT_TYPE_OPTIONS.forEach((option) => {
      cy.get("[data-cy='event-types']").should(
        "contain.text",
        String(option.value),
      );
    });
  });

  it("falls back to all options when apply is clicked with no selected values", () => {
    cy.mount(
      <EventCalendarProvider
        initialSearchOptions={
          { event_types: [String(EVENT_TYPE_OPTIONS[0].value)] } as any
        }
      >
        <EventTypeFilter />
        <SearchOptionsProbe />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");

    cy.contains("Event Type").click({ force: true });
    cy.contains("Milestone").click({ force: true });
    cy.contains("button", "Apply").click({ force: true });

    EVENT_TYPE_OPTIONS.forEach((option) => {
      cy.get("[data-cy='event-types']").should(
        "contain.text",
        String(option.value),
      );
    });
  });
});
