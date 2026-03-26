import moment from "moment";
import Month from "components/eventCalendar/components/Month";

describe("event calendar Month", () => {
  it("renders month and project/event acronyms", () => {
    const month = moment("2026-03-01");
    const events = [
      {
        id: 101,
        name: "Draft Submission",
        start_date: "2026-03-03",
        end_date: "2026-03-05",
        project: "Project Aurora",
        project_short_code: "null",
        color: "#abc",
      },
      {
        id: 102,
        name: "Public Engagement",
        start_date: "2026-03-10",
        end_date: "2026-03-11",
        project: null,
        project_short_code: null,
        color: "#def",
      },
    ];

    cy.mount(
      <Month
        month={month}
        events={events as any}
        hoveredEvent={null}
        setHoveredEvent={cy.stub().as("setHoveredEvent")}
        handleEventClick={cy.stub().as("handleEventClick")}
      />,
    );

    cy.contains("March").should("exist");
    cy.contains("PA").should("exist");
    cy.contains("DS").should("exist");
    cy.contains("PE").should("exist");
  });

  it("calls hover and click handlers for an event", () => {
    const month = moment("2026-03-01");
    const events = [
      {
        id: 201,
        name: "Referral Review",
        start_date: "2026-03-07",
        end_date: "2026-03-09",
        project: "North Ridge",
        project_short_code: "NR",
        color: "#cde",
      },
    ];

    cy.mount(
      <Month
        month={month}
        events={events as any}
        hoveredEvent={null}
        setHoveredEvent={cy.stub().as("setHoveredEvent")}
        handleEventClick={cy.stub().as("handleEventClick")}
      />,
    );

    cy.contains("RR")
      .should("exist")
      .parents("[title]")
      .first()
      .trigger("mouseenter")
      .click();

    cy.get("@setHoveredEvent").should("have.been.calledWith", 201);
    cy.get("@handleEventClick").should("have.been.calledWith", 201);
  });
});
