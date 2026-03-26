import { MemoryRouter as Router } from "react-router-dom";
import Month from "../Month";
import { EventCalendarProvider } from "../EventCalendarContext";
import { generateMockEvent } from "../../../../cypress/support/common";
import { EVENT_TYPE } from "components/workPlan/phase/type";

describe("Month", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

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

  const stableEvents = [
    {
      event: generateMockEvent({
        id: 2001,
        name: "Stable Milestone",
        type: EVENT_TYPE.MILESTONE,
        start_date: new Date(year, month, 5).toISOString(),
        end_date: new Date(year, month, 6).toISOString(),
      }),
      phase_name: "Phase A",
      phase_id: 1,
      work_name: "Work A",
      work_id: 11,
    },
    {
      event: generateMockEvent({
        id: 2002,
        name: "Stable Task",
        type: EVENT_TYPE.TASK,
        start_date: new Date(year, month, 10).toISOString(),
        end_date: new Date(year, month, 11).toISOString(),
      }),
      phase_name: "Phase B",
      phase_id: 2,
      work_name: "Work B",
      work_id: 12,
    },
  ];

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
            milestoneEvents={stableEvents}
          />
        </EventCalendarProvider>
      </Router>,
    );

    cy.contains("September 2025").scrollIntoView().should("exist");
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
            milestoneEvents={stableEvents}
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

    cy.get("div").contains("1").scrollIntoView().should("exist");
    cy.get("div").contains("28").scrollIntoView().should("exist");
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
            milestoneEvents={stableEvents}
          />
        </EventCalendarProvider>
      </Router>,
    );
    cy.contains(stableEvents[0].event.name).should("not.exist");

    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: false, toggleCollapsed: () => {} })}
            milestoneEvents={stableEvents}
          />
        </EventCalendarProvider>
      </Router>,
    );
    cy.contains(stableEvents[0].event.name).scrollIntoView().should("exist");
  });

  it("renders multiple event types correctly", () => {
    const mixedEvents = [
      {
        ...stableEvents[0],
        event: { ...stableEvents[0].event, type: EVENT_TYPE.TASK },
      },
      {
        ...stableEvents[1],
        event: { ...stableEvents[1].event, type: EVENT_TYPE.MILESTONE },
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
      cy.contains(calendarItem.event.name).scrollIntoView().should("exist");
    });
  });

  it("renders safely when milestone events are undefined", () => {
    cy.mount(
      <Router>
        <EventCalendarProvider>
          <Month
            isCollapsed={false}
            toggleCollapsed={function (): void {
              throw new Error("Function not implemented.");
            }}
            {...getBaseProps({ isCollapsed: false, toggleCollapsed: () => {} })}
          />
        </EventCalendarProvider>
      </Router>,
    );

    cy.contains("September 2025").should("exist");
    cy.get("div").contains("1").should("exist");
  });
});
