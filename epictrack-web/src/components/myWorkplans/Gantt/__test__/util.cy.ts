import moment from "moment";
import { getDaysLeft, getTaskSpan } from "components/myWorkplans/Gantt/util";

describe("myWorkplans gantt util", () => {
  it("returns empty string for a future phase", () => {
    const phase = {
      days_left: 10,
      total_number_of_days: 40,
      work_phase: {
        start_date: moment().add(3, "day").toISOString(),
        end_date: moment().add(12, "day").toISOString(),
      },
    } as any;

    cy.wrap(getDaysLeft(phase)).should("eq", "");
  });

  it("returns remaining/total for an active phase with non-negative days_left", () => {
    const phase = {
      days_left: 5,
      total_number_of_days: 20,
      work_phase: {
        start_date: moment().subtract(2, "day").toISOString(),
        end_date: moment().add(2, "day").toISOString(),
      },
    } as any;

    cy.wrap(getDaysLeft(phase)).should("eq", "5/20");
  });

  it("returns 0/total for a completed phase with non-negative days_left", () => {
    const phase = {
      days_left: 0,
      total_number_of_days: 18,
      work_phase: {
        start_date: moment().subtract(10, "day").toISOString(),
        end_date: moment().subtract(1, "day").toISOString(),
      },
    } as any;

    cy.wrap(getDaysLeft(phase)).should("eq", "0/18");
  });

  it("returns overage text for an active phase with negative days_left", () => {
    const phase = {
      days_left: -3,
      total_number_of_days: 12,
      work_phase: {
        start_date: moment().subtract(5, "day").toISOString(),
        end_date: moment().add(4, "day").toISOString(),
      },
    } as any;

    cy.wrap(getDaysLeft(phase)).should("eq", "0/12 (3 over)");
  });

  it("returns expanded overage count for a completed phase with negative days_left", () => {
    const phase = {
      days_left: -4,
      total_number_of_days: 11,
      work_phase: {
        start_date: moment().subtract(14, "day").toISOString(),
        end_date: moment().subtract(2, "day").toISOString(),
      },
    } as any;

    cy.wrap(getDaysLeft(phase)).should("eq", "15/11");
  });

  it("computes whole-day span after normalizing to midnight", () => {
    const start = new Date(2026, 2, 1, 18, 45, 0, 0);
    const end = new Date(2026, 2, 4, 1, 15, 0, 0);

    cy.wrap(getTaskSpan(start, end)).should("eq", 3);
  });
});
