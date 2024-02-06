import {
  ActiveChip,
  InactiveChip,
  HighPriorityChip,
  ErrorChip,
} from "../chip/ETChip";

describe("ETChip", () => {
  it("ActiveChip renders", () => {
    cy.mount(<ActiveChip data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("InactiveChip renders", () => {
    cy.mount(<InactiveChip data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("HighPriorityChip renders", () => {
    cy.mount(<HighPriorityChip data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("ErrorChip renders", () => {
    cy.mount(<ErrorChip data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });
});
