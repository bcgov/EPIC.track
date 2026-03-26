import {
  dateCalculator,
  DayCalculatorResult,
  isNonBCBusinessDay,
} from "../DateCalculator";
import { DateCalculatorForm } from "../DateCalculatorForm";

describe("Date calculator form tests", () => {
  let regular = true;
  let suspended = false;
  let numDays: number | null = null;
  let startDate: Date | null = new Date(2024, 8, 1);
  let endDate: Date | null = new Date(2024, 8, 10);
  let suspendedDate: Date | null = null;
  let resumptionDate: Date | null = null;

  beforeEach(() => {
    regular = true;
    suspended = false;
    numDays = null;
    startDate = null;
    endDate = null;
    suspendedDate = null;
    resumptionDate = null;

    cy.mount(<DateCalculatorForm />);
  });

  const selectCalculationType = (label: string) => {
    cy.contains("Calculation Type")
      .parent()
      .within(() => {
        cy.get("input")
          .first()
          .click({ force: true })
          .clear({ force: true })
          .type(`${label}{enter}`, { force: true });
      });
  };

  const typeDateByLabel = (label: string, value: string) => {
    cy.contains(label)
      .parent()
      .within(() => {
        cy.get('input[type="text"]').first().clear({ force: true });
        cy.get('input[type="text"]').first().type(value, { force: true });
        cy.get('input[type="text"]').first().blur({ force: true });
      });
  };

  it("renders the form", () => {
    cy.get("form").should("be.visible");
  });

  it("shows and hides day-zero rules", () => {
    selectCalculationType("Day Zero");

    cy.contains("Show Day Zero rules.").should("exist").click({ force: true });
    cy.contains("Holidays").should("exist");
    cy.contains("Hide Day Zero rules.").click({ force: true });
    cy.contains("Holidays").should("not.be.visible");
  });

  it("keeps entered number of days when calculate is clicked", () => {
    cy.contains("Number of Days")
      .parent()
      .within(() => {
        cy.get('input[type="number"]').clear({ force: true }).type("10", {
          force: true,
        });
      });

    cy.contains("button", "Calculate").click({ force: true });

    cy.contains("Number of Days")
      .parent()
      .within(() => {
        cy.get('input[type="number"]').should("have.value", "10");
      });
  });

  it("reset clears values and returns to default calculation mode", () => {
    selectCalculationType("Suspension");
    cy.contains("Suspension Date").should("exist");

    typeDateByLabel("Start Date", "03/01/2026");
    cy.contains("Number of Days")
      .parent()
      .within(() => {
        cy.get('input[type="number"]').clear({ force: true }).type("7", {
          force: true,
        });
      });

    cy.contains("button", "Reset").click({ force: true });

    cy.contains("Suspension Date").should("not.exist");
    cy.contains("Show Day Zero rules.").should("exist");
    cy.contains("Number of Days")
      .parent()
      .within(() => {
        cy.get('input[type="number"]').should("have.value", "");
      });
  });

  it("shows suspension fields and description when suspension is selected", () => {
    selectCalculationType("Suspension");

    cy.contains("Suspension Date").should("exist");
    cy.contains("Resumption Date").should("exist");
    cy.contains("Suspended dates are excluded from calculation.").should(
      "exist",
    );
  });

  it("shows calendar description and hides day-zero toggle for calendar mode", () => {
    selectCalculationType("Calendar");

    cy.contains("Start date is included in calculation.").should("exist");
    cy.contains("Show Day Zero rules.").should("not.exist");
  });

  it("Given start date and end date calculates num days using calendar calculation type", () => {
    startDate = new Date(2024, 8, 1);
    endDate = new Date(2024, 8, 10);

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: endDate,
      numDays: 10,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given start date and end date calculates num days using day zero calculation", () => {
    startDate = new Date(2024, 8, 1);
    endDate = new Date(2024, 8, 4);
    regular = false;

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: endDate,
      numDays: 3,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given start date and 30 days calculates end date using day zero calculation", () => {
    startDate = new Date(2024, 8, 1);
    numDays = 30;
    regular = false;

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: new Date(2024, 8, 31),
      numDays: 30,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given end date and num days calculate start date using day zero calculation", () => {
    endDate = new Date(2024, 8, 31);
    numDays = 10;
    regular = false;

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: new Date(2024, 8, 21),
      endDate: endDate,
      numDays: 10,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given start date and 30 days calculates end date using calendar calculation", () => {
    startDate = new Date(2024, 8, 1);
    numDays = 30;

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: new Date(2024, 8, 30),
      numDays: 30,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given end date and num days calculate start date using calendar calculation", () => {
    endDate = new Date(2024, 8, 31);
    numDays = 10;

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: new Date(2024, 8, 22),
      endDate: endDate,
      numDays: 10,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given start date and end date calculate num days using suspension period calculation", () => {
    startDate = new Date(2024, 8, 1);
    endDate = new Date(2024, 8, 31);
    regular = false;
    suspended = true;
    suspendedDate = new Date(2024, 8, 10);
    resumptionDate = new Date(2024, 8, 20);

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: endDate,
      numDays: 20,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given start date and num days calculate end date using suspension period calculation", () => {
    startDate = new Date(2024, 8, 1);
    numDays = 20;
    regular = false;
    suspended = true;
    suspendedDate = new Date(2024, 8, 10);
    resumptionDate = new Date(2024, 8, 20);

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: startDate,
      endDate: new Date(2024, 8, 31),
      numDays: numDays,
    };

    expect(result).to.deep.equal(expected);
  });

  it("Given end date and num days calculate start date using suspension period calculatiom", () => {
    endDate = new Date(2024, 8, 31);
    numDays = 20;
    regular = false;
    suspended = true;
    suspendedDate = new Date(2024, 8, 10);
    resumptionDate = new Date(2024, 8, 20);

    const result = dateCalculator(
      regular,
      suspended,
      numDays,
      startDate,
      endDate,
      suspendedDate,
      resumptionDate,
    );

    const expected: DayCalculatorResult = {
      startDate: new Date(2024, 8, 1),
      endDate: endDate,
      numDays: numDays,
    };

    expect(result).to.deep.equal(expected);
  });

  it("returns invalid for null and invalid date values", () => {
    expect(isNonBCBusinessDay(null)).to.equal("Invalid Date");
    expect(isNonBCBusinessDay(new Date("bad-date"))).to.equal("Invalid Date");
  });

  it("identifies weekends and key holidays", () => {
    expect(isNonBCBusinessDay(new Date(2026, 2, 22))).to.equal("Sunday");
    expect(isNonBCBusinessDay(new Date(2026, 2, 21))).to.equal("Saturday");
    expect(isNonBCBusinessDay(new Date(2026, 0, 1))).to.equal("New Year's Day");
    expect(isNonBCBusinessDay(new Date(2026, 1, 9))).to.equal("Family Day");
    expect(isNonBCBusinessDay(new Date(2026, 3, 3))).to.equal("Good Friday");
    expect(isNonBCBusinessDay(new Date(2026, 3, 6))).to.equal("Easter Monday");
  });

  it("returns empty string for a normal weekday", () => {
    expect(isNonBCBusinessDay(new Date("2026-03-24"))).to.equal("");
  });

  it("throws if suspension date is on or after resumption date", () => {
    expect(() =>
      dateCalculator(
        true,
        true,
        5,
        new Date("2026-03-01"),
        null,
        new Date("2026-03-10"),
        new Date("2026-03-10"),
      ),
    ).to.throw("The suspension date must come before the resumption date.");
  });

  it("throws when suspend date is provided without resume date", () => {
    expect(() =>
      dateCalculator(
        true,
        true,
        5,
        new Date("2026-03-01"),
        null,
        new Date("2026-03-10"),
        null,
      ),
    ).to.throw("A resumption date is required.");
  });

  it("throws when resume date is provided without suspend date", () => {
    expect(() =>
      dateCalculator(
        true,
        true,
        5,
        new Date("2026-03-01"),
        null,
        null,
        new Date("2026-03-20"),
      ),
    ).to.throw("A suspension date is required.");
  });

  it("throws when start date is on or after end date", () => {
    expect(() =>
      dateCalculator(
        true,
        false,
        null,
        new Date("2026-03-10"),
        new Date("2026-03-10"),
        null,
        null,
      ),
    ).to.throw("The start date must come before the end date.");
  });
});
