import EventRow from "components/calendar/EventRow";
import { EventCalendarProvider } from "components/calendar/EventCalendarContext";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import { generateMockEvent } from "../../../../cypress/support/common";
import { dateUtils } from "utils";

const generateDaysForMonth = (
  year = new Date().getFullYear(),
  month = new Date().getMonth(),
  daysInRow = 7,
): (Date | null)[] => {
  const start = dateUtils.startOfMonth(new Date(year, month, 1));
  const daysArray: (Date | null)[] = [];

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // add nulls for the first week offset
  for (let i = 0; i < start.getDay(); i++) {
    daysArray.push(null);
  }

  // add each date of the month
  for (let i = 0; i < daysInMonth; i++) {
    const date = new Date(year, month, 1 + i);
    daysArray.push(date);
  }

  // pad trailing nulls to fill row
  while (daysArray.length < daysInRow) {
    daysArray.push(null);
  }

  return daysArray;
};

describe("EventRow Component", () => {
  beforeEach(() => {
    cy.viewport(1920, 1080);
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const days = generateDaysForMonth();

  it("renders a Task and Milestone event", () => {
    const events = [
      {
        event: generateMockEvent({
          id: 2001,
          name: "Task event",
          type: EVENT_TYPE.TASK,
          start_date: new Date(currentYear, currentMonth, 3).toISOString(),
          end_date: new Date(currentYear, currentMonth, 5).toISOString(),
        }),
        phase_name: "Phase A",
        phase_id: 1,
        work_name: "Project A",
        work_id: 1,
      },
      {
        event: generateMockEvent({
          id: 2002,
          name: "Milestone event",
          type: EVENT_TYPE.MILESTONE,
          start_date: new Date(currentYear, currentMonth, 6).toISOString(),
          end_date: new Date(currentYear, currentMonth, 7).toISOString(),
        }),
        phase_name: "Phase B",
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

    cy.wrap(events).each((calendarItem: any) => {
      const title =
        calendarItem.event.type === EVENT_TYPE.MILESTONE
          ? `${calendarItem.phase_name}: ${calendarItem.event.name}`
          : calendarItem.event.name;

      cy.contains(String(calendarItem.event.name), { timeout: 5000 })
        .scrollIntoView()
        .should("be.visible")
        .trigger("mouseover", { force: true });

      cy.get('[role="tooltip"]', { timeout: 5000 })
        .should("be.visible")
        .and("contain.text", title);
    });
  });

  it("renders multi-day events correctly", () => {
    const now = new Date();
    const startOfMonth = dateUtils.startOfMonth(now);
    const endDate = dateUtils
      .add(startOfMonth.toISOString(), 3, "days")
      .toISOString();

    const multiDayEvent = generateMockEvent({
      type: EVENT_TYPE.TASK,
      start_date: startOfMonth.toISOString(),
      end_date: endDate,
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
    const now = new Date();
    const startOfMonth = dateUtils.startOfMonth(now);

    const event1 = generateMockEvent({
      start_date: startOfMonth.toISOString(),
      end_date: dateUtils
        .add(startOfMonth.toISOString(), 2, "days")
        .toISOString(),
    });

    const event2 = generateMockEvent({
      start_date: dateUtils
        .add(startOfMonth.toISOString(), 1, "days")
        .toISOString(),
      end_date: dateUtils
        .add(startOfMonth.toISOString(), 3, "days")
        .toISOString(),
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
    const taskEvent = generateMockEvent({
      id: 7771,
      name: "Legend task",
      type: EVENT_TYPE.TASK,
      start_date: new Date(currentYear, currentMonth, 5).toISOString(),
      end_date: new Date(currentYear, currentMonth, 7).toISOString(),
    });
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
    cy.contains("Legend task").scrollIntoView().should("exist");
    cy.get("svg").should("exist");
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

  it("renders an event that starts before the first visible day", () => {
    const visibleDays = [
      new Date(2026, 2, 1),
      new Date(2026, 2, 2),
      new Date(2026, 2, 3),
    ];

    const spanningEvent = {
      event: generateMockEvent({
        id: 3301,
        name: "Spans into month",
        type: EVENT_TYPE.TASK,
        start_date: new Date(2026, 1, 28).toISOString(),
        end_date: new Date(2026, 2, 1).toISOString(),
      }),
      phase_name: "Phase X",
      phase_id: 1,
      work_name: "Project X",
      work_id: 1,
    };

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={[spanningEvent]}
          days={visibleDays}
          cellSizePx={40}
          showWorkLegend={false}
        />
      </EventCalendarProvider>,
    );

    cy.contains("Spans into month").should("exist");
  });

  it("renders icon-only content for single-day event when work legend is enabled", () => {
    const singleDay = new Date(2026, 2, 10);
    const singleDayTask = {
      event: generateMockEvent({
        id: 3302,
        name: "Single day icon",
        type: EVENT_TYPE.TASK,
        start_date: singleDay.toISOString(),
        end_date: singleDay.toISOString(),
      }),
      phase_name: "Phase Y",
      phase_id: 2,
      work_name: "Project Y",
      work_id: 2,
    };

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={[singleDayTask]}
          days={[singleDay]}
          cellSizePx={40}
          showWorkLegend={true}
        />
      </EventCalendarProvider>,
    );

    cy.get("svg").should("exist");
    cy.contains("Single day icon").should("not.exist");
  });

  it("handles out-of-range events without rendering invalid spans", () => {
    const visibleDays = [
      new Date(2026, 2, 1),
      new Date(2026, 2, 2),
      new Date(2026, 2, 3),
      new Date(2026, 2, 4),
    ];

    const outOfRangeEvent = {
      event: generateMockEvent({
        id: 3303,
        name: "Out of range",
        type: EVENT_TYPE.TASK,
        start_date: new Date(2026, 3, 10).toISOString(),
        end_date: new Date(2026, 3, 12).toISOString(),
      }),
      phase_name: "Phase Z",
      phase_id: 3,
      work_name: "Project Z",
      work_id: 3,
    };

    cy.mount(
      <EventCalendarProvider>
        <EventRow
          events={[outOfRangeEvent]}
          days={visibleDays}
          cellSizePx={40}
          showWorkLegend={false}
        />
      </EventCalendarProvider>,
    );

    cy.contains("Out of range").should("not.exist");
  });
});
