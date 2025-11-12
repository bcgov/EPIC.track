import { MemoryRouter as Router } from "react-router-dom";
import Month from "../Month";
import { EventCalendarProvider } from "../EventCalendarContext";
import { mockEventsGrid } from "../../../../cypress/support/common";
import { EVENT_TYPE } from "components/workPlan/phase/type";

describe("Month", () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const days = Array.from(
    { length: 30 },
    (_, i) => new Date(year, month, i + 1),
  );

  const labelWidth = 120;
  const cellSizePx = 40;
  const daysInRow = 30;

  const getBaseProps = (overrides = {}) => ({
    monthLabel: "September 2025",
    labelWidth,
    days,
    cellSizePx,
    daysInRow,
    ...overrides,
  });

  it("renders collapsed month with expand icon", () => {
    const toggleCollapsed = cy.stub().as("toggleCollapsed");

    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: true, toggleCollapsed })}
            milestoneEvents={mockEventsGrid}
          />
        </EventCalendarProvider>
      </Router>,
    );

    cy.contains("September 2025").should("exist");
    cy.get("button").should("contain.text", "September 2025");
    cy.get("svg").should("exist");
    cy.get("button").click();
    cy.get("@toggleCollapsed").should("have.been.calledOnce");
  });

  it("renders expanded month with collapse icon", () => {
    const toggleCollapsed = cy.stub();

    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({
              isCollapsed: false,
              toggleCollapsed,
              showWorkLegend: true,
            })}
            milestoneEvents={mockEventsGrid}
          />
        </EventCalendarProvider>
      </Router>,
    );

    cy.contains("September 2025").should("exist");
    cy.get("svg").should("exist"); // Collapse icon rendered
  });

  it("renders MonthDatesRow always", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: true, toggleCollapsed: () => {} })}
            milestoneEvents={[]}
          />
        </EventCalendarProvider>
      </Router>,
    );

    cy.get("div").contains("1").should("exist");
    cy.get("div").contains("30").should("exist");
  });

  it("renders EventRow only when expanded", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: true, toggleCollapsed: () => {} })}
            milestoneEvents={mockEventsGrid}
          />
        </EventCalendarProvider>
      </Router>,
    );
    cy.contains(mockEventsGrid[0].event.name).should("not.exist");

    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: false, toggleCollapsed: () => {} })}
            milestoneEvents={mockEventsGrid}
          />
        </EventCalendarProvider>
      </Router>,
    );
    cy.contains(mockEventsGrid[0].event.name).scrollIntoView().should("exist");
  });

  it("renders multiple event types correctly", () => {
    const mixedEvents = [
      {
        ...mockEventsGrid[0],
        event: { ...mockEventsGrid[0].event, type: EVENT_TYPE.TASK },
      },
      {
        ...mockEventsGrid[1],
        event: { ...mockEventsGrid[1].event, type: EVENT_TYPE.MILESTONE },
      },
    ];

    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: false, toggleCollapsed: () => {} })}
            milestoneEvents={mixedEvents}
          />
        </EventCalendarProvider>
      </Router>,
    );

    mixedEvents.forEach((calendarItem) => {
      cy.contains(new RegExp(calendarItem.event.name))
        .scrollIntoView()
        .should("exist");
    });
  });
});
