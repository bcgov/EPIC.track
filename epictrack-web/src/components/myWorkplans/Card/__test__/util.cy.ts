import { daysLeft } from "components/myWorkplans/Card/util";

describe("myWorkplans card util", () => {
  it("returns completed singular day text when phase is completed", () => {
    const value = daysLeft({
      days_left: 1,
      total_number_of_days: 10,
      work_phase: {
        is_completed: true,
      },
    } as any);

    cy.wrap(value).should("eq", "1 day");
  });

  it("returns completed plural day text when completed and days_left > 1", () => {
    const value = daysLeft({
      days_left: 4,
      total_number_of_days: 10,
      work_phase: {
        is_completed: true,
      },
    } as any);

    cy.wrap(value).should("eq", "4 days");
  });

  it("returns remaining days text for active phase with non-negative days_left", () => {
    const value = daysLeft({
      days_left: 7,
      total_number_of_days: 20,
      work_phase: {
        is_completed: false,
      },
    } as any);

    cy.wrap(value).should("eq", "7/20 days left");
  });

  it("returns singular over text for one day over", () => {
    const value = daysLeft({
      days_left: -1,
      total_number_of_days: 12,
      work_phase: {
        is_completed: false,
      },
    } as any);

    cy.wrap(value).should("eq", "1 day over");
  });

  it("returns plural over text when more than one day over", () => {
    const value = daysLeft({
      days_left: -3,
      total_number_of_days: 12,
      work_phase: {
        is_completed: false,
      },
    } as any);

    cy.wrap(value).should("eq", "3 days over");
  });
});
