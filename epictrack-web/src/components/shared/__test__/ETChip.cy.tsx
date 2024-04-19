import { ETChip } from "../chip/ETChip";

describe("ETChip", () => {
  it("ActiveChip renders", () => {
    cy.mount(<ETChip active data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("InactiveChip renders", () => {
    cy.mount(<ETChip inactive data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("HighPriorityChip renders", () => {
    cy.mount(<ETChip highPriority data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });

  it("ErrorChip renders", () => {
    cy.mount(<ETChip error data-testid="chip" />);
    cy.get('[data-testid="chip"]').should("exist");
  });
});
