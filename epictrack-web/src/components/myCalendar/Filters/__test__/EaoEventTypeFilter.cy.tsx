import React from "react";
import {
  EventCalendarProvider,
  useEventCalendarContext,
} from "components/calendar/EventCalendarContext";
import {
  EAO_EVENT_TYPE_OPTIONS,
  EaoEventTypeFilter,
} from "../EaoEventTypeFilter";

const SearchOptionsProbe = () => {
  const { searchOptions } = useEventCalendarContext();
  return <div data-cy="event-types">{searchOptions.event_types.join("|")}</div>;
};

describe("EaoEventTypeFilter", () => {
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

  it("applies selected EAO event types", () => {
    cy.mount(
      <EventCalendarProvider
        initialSearchOptions={
          { event_types: ["event_category:decision"] } as any
        }
      >
        <EaoEventTypeFilter />
        <SearchOptionsProbe />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");

    cy.contains("Event Type").click({ force: true });
    cy.contains("PCP").click({ force: true });
    cy.contains("button", "Apply").click({ force: true });

    const decisionValue = EAO_EVENT_TYPE_OPTIONS.find(
      (option) => option.label === "Decision",
    )?.value;
    cy.get("[data-cy='event-types']").should(
      "contain.text",
      String(decisionValue),
    );
    cy.get("[data-cy='event-types']").should("not.have.text", "");
  });

  it("falls back to all EAO options when no options remain selected", () => {
    cy.mount(
      <EventCalendarProvider
        initialSearchOptions={
          { event_types: ["event_category:decision"] } as any
        }
      >
        <EaoEventTypeFilter />
        <SearchOptionsProbe />
      </EventCalendarProvider>,
    );

    cy.wait("@getMilestones");

    cy.contains("Event Type").click({ force: true });
    cy.contains("Decision").click({ force: true });
    cy.contains("button", "Apply").click({ force: true });

    cy.get("[data-cy='event-types']").should(
      "contain.text",
      "event_position:START,END",
    );
    cy.get("[data-cy='event-types']").should("not.have.text", "");
  });
});
