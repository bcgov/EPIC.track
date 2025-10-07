import dayjs from "dayjs";
import EventRow from "components/calendar/EventRow";
import { EventCalendarProvider } from "components/calendar/EventCalendarContext";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import {
  generateMockEvent,
  mockEventsGrid,
} from "../../../../cypress/support/common";

const generateDaysForMonth = (
  year = dayjs().year(),
  month = dayjs().month(),
  daysInRow = 7,
) => {
  const start = dayjs().year(year).month(month).startOf("month");
  const daysInMonth = start.daysInMonth();
  const daysArray: (Date | null)[] = [];

  // add nulls for the first week offset
  for (let i = 0; i < start.day(); i++) daysArray.push(null);

  for (let i = 0; i < daysInMonth; i++) {
    daysArray.push(start.add(i, "day").toDate());
  }

  while (daysArray.length < daysInRow) daysArray.push(null);

  return daysArray;
};

describe("EventRow Component", () => {
  const days = generateDaysForMonth();

  it("renders a Task and Milestone event", () => {
    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={mockEventsGrid}
          days={days}
          cellSizePx={40}
          showWorkLegend={true}
        />
      </EventCalendarProvider>,
    );
    cy.viewport(1920, 1080);

    cy.wrap(mockEventsGrid).each((calendarItem: any) => {
      const title =
        calendarItem.event.type === EVENT_TYPE.MILESTONE
          ? `${calendarItem.phase_name}: ${calendarItem.event.name}`
          : calendarItem.event.name;

      cy.contains(new RegExp(`.*${calendarItem.event.name}`), { timeout: 5000 })
        .scrollIntoView()
        .should("be.visible")
        .trigger("mouseover", { force: true });

      cy.get('[role="tooltip"]', { timeout: 5000 })
        .should("be.visible")
        .and("contain.text", title);
    });
  });

  it("renders multi-day events correctly", () => {
    const multiDayEvent = generateMockEvent({
      type: EVENT_TYPE.TASK,
      start_date: dayjs().startOf("month").toISOString(),
      end_date: dayjs().startOf("month").add(3, "day").toISOString(),
    });
    const events = [
      {
        event: multiDayEvent,
        phase_name: "TestPhase",
        phase_id: 1,
        work_name: "Project X",
        work_id: 1,
      },
    ];
    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={events}
          days={days}
          cellSizePx={40}
          showWorkLegend={true}
        />
      </EventCalendarProvider>,
    );
    // Event should occupy multiple columns (grid span)
    cy.contains(multiDayEvent.name).should("exist");
  });

  it("renders overlapping events on multiple rows", () => {
    const event1 = generateMockEvent({
      start_date: dayjs().startOf("month").toISOString(),
      end_date: dayjs().startOf("month").add(2, "day").toISOString(),
    });
    const event2 = generateMockEvent({
      start_date: dayjs().startOf("month").add(1, "day").toISOString(),
      end_date: dayjs().startOf("month").add(3, "day").toISOString(),
    });

    const events = [
      {
        event: event1,
        phase_name: "Phase1",
        phase_id: 1,
        work_name: "Project A",
        work_id: 1,
      },
      {
        event: event2,
        phase_name: "Phase2",
        phase_id: 2,
        work_name: "Project B",
        work_id: 2,
      },
    ];

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={events}
          days={days}
          cellSizePx={40}
          showWorkLegend={true}
        />
      </EventCalendarProvider>,
    );

    cy.contains(event1.name)
      .should("exist")
      .then(($el1) => {
        const el1 = $el1?.[0] as unknown as HTMLElement;
        if (!el1) throw new Error("Element for event1 not found");
        const top1 = el1.getBoundingClientRect().top;

        cy.contains(event2.name)
          .should("exist")
          .then(($el2) => {
            const el2 = $el2?.[0] as unknown as HTMLElement;
            if (!el2) throw new Error("Element for event2 not found");
            const top2 = el2.getBoundingClientRect().top;
            expect(top1).not.equal(top2);
          });
      });
  });

  it("renders event with work legend icon", () => {
    const taskEvent = generateMockEvent({ type: EVENT_TYPE.TASK });
    const events = [
      {
        event: taskEvent,
        phase_name: "Phase1",
        phase_id: 1,
        work_name: "Project X",
        work_id: 1,
      },
    ];

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={events}
          days={days}
          cellSizePx={40}
          showWorkLegend={true}
        />
      </EventCalendarProvider>,
    );
    cy.viewport(1920, 1080);
    cy.get("div").contains(taskEvent.name).scrollIntoView().should("exist");
  });

  it("renders event without work legend icon when showWorkLegend is false", () => {
    const taskEvent = generateMockEvent({ type: EVENT_TYPE.TASK });
    const events = [
      {
        event: taskEvent,
        phase_name: "Phase1",
        phase_id: 1,
        work_name: "Project X",
        work_id: 1,
      },
    ];

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={events}
          days={days}
          cellSizePx={40}
          showWorkLegend={false}
        />
      </EventCalendarProvider>,
    );

    cy.contains(taskEvent.name).should("exist");
    // No icons should be present
    cy.get("svg").should("not.exist");
  });
});
