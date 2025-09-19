import dayjs from "dayjs";
import {
  getNDaysArray,
  isWeekendByIndex,
  getLegendIconMap,
  resolveEventIconName,
} from "components/calendar/utils";
import { EVENT_TYPE } from "components/workPlan/phase/type";
import { EventCategory, EventType } from "models/event";

describe("calendar utils", () => {
  it("getNDaysArray returns padded month grid", () => {
    const start = dayjs("2025-09-01"); // Mon
    const days = getNDaysArray(start, 42);

    cy.wrap(days).should("have.length", 42);
    cy.wrap(days[0]).should("be.null");
    cy.wrap(dayjs(days[1]!).date()).should("eq", 1);
    cy.wrap(dayjs(days[30]!).date()).should("eq", 30);
  });

  it("isWeekendByIndex identifies weekends correctly", () => {
    cy.wrap(isWeekendByIndex(0)).should("be.true"); // Sun
    cy.wrap(isWeekendByIndex(6)).should("be.true"); // Sat
    cy.wrap(isWeekendByIndex(2)).should("be.false"); // Tues
  });

  it("getLegendIconMap builds icon map", () => {
    const map = getLegendIconMap();
    cy.wrap(map).should("include", {
      Task: "AllIcon",
      Submission: "Submission",
      Decision: "ApplyHere",
      PCP: "AddBubble",
      Milestone: "ApproveCircle",
    });
  });

  it("resolveEventIconName returns correct icons", () => {
    const icons = getLegendIconMap();

    cy.wrap(
      resolveEventIconName(
        { type: EVENT_TYPE.TASK, event_configuration: {} } as any,
        icons
      )
    ).should("eq", "AllIcon");

    cy.wrap(
      resolveEventIconName(
        {
          type: EVENT_TYPE.MILESTONE,
          event_configuration: { event_type_id: EventType.SUBMISSION },
        } as any,
        icons
      )
    ).should("eq", "Submission");

    cy.wrap(
      resolveEventIconName(
        {
          type: EVENT_TYPE.MILESTONE,
          event_configuration: { event_category_id: EventCategory.DECISION },
        } as any,
        icons
      )
    ).should("eq", "ApplyHere");

    cy.wrap(
      resolveEventIconName(
        {
          type: EVENT_TYPE.MILESTONE,
          event_configuration: { event_category_id: EventCategory.PCP },
        } as any,
        icons
      )
    ).should("eq", "AddBubble");

    cy.wrap(
      resolveEventIconName(
        { type: EVENT_TYPE.MILESTONE, event_configuration: {} } as any,
        icons
      )
    ).should("eq", "ApproveCircle");
  });
});
