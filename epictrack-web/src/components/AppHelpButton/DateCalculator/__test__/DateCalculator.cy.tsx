import { dateCalculator, DayCalculatorResult } from "../DateCalculator";
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

  it("renders the form", () => {
    cy.get("form").should("be.visible");
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
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
      resumptionDate
    );

    const expected: DayCalculatorResult = {
      startDate: new Date(2024, 8, 1),
      endDate: endDate,
      numDays: numDays,
    };

    expect(result).to.deep.equal(expected);
  });
});
