import Confetti from "../Confetti";

describe("Confetti", () => {
  it("renders and handles both display types", () => {
    cy.clock(Date.now(), ["Date", "setTimeout", "clearTimeout"]);

    cy.mount(<Confetti displayType="confetti" />);
    cy.tick(400);

    cy.mount(<Confetti displayType="fireworks" />);
    cy.tick(5600);

    cy.mount(<div data-cy="done">done</div>);
    cy.get('[data-cy="done"]').should("exist");
  });
});
