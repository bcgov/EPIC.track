import MonthDatesRow from "../MonthDatesRow";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import { generateMockEvent } from "../../../../cypress/support/common";

const baseDate = new Date(2026, 2, 15);

const makeCalendarEvent = (id: number) => ({
  event: {
    ...generateMockEvent({
      id,
      type: EVENT_TYPE.MILESTONE,
      start_date: baseDate.toISOString(),
      end_date: baseDate.toISOString(),
    }),
  },
  phase_name: "Phase A",
  phase_id: 1,
  work_name: "Work A",
  work_id: 100,
});

describe("MonthDatesRow", () => {
  it("renders overflow icon when more than three events exist on a day", () => {
    const days = [baseDate];
    const events = [
      makeCalendarEvent(1),
      makeCalendarEvent(2),
      makeCalendarEvent(3),
      makeCalendarEvent(4),
    ];

    cy.mount(
      <MonthDatesRow days={days} cellSizePx={40} events={events as any} />,
    );

    // Three dots plus overflow icon branch (count > 3)
    cy.get("svg").should("exist");
  });
});
