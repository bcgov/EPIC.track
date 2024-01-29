import BorderLinearProgress from "../progress/Progress";

describe("BorderLinearProgress", () => {
  it("renders successfully", () => {
    cy.mount(
      <BorderLinearProgress
        variant="determinate"
        value={0}
        sx={{ marginTop: "10px" }}
      />
    );
    cy.get("span").should("have.class", "MuiLinearProgress-root");
  });
  it("increments successfully", () => {
    const increment = 10;

    cy.mount(
      <BorderLinearProgress
        variant="determinate"
        value={increment}
        sx={{ marginTop: "10px" }}
      />
    );

    //check if it increments successfully by looking at the translate value for the bar
    cy.get("span.MuiLinearProgress-bar")
      .invoke("attr", "style")
      .then((style) => {
        if (style) {
          const match = style.match(/translateX\((.*?)%\)/);
          const translateX = match ? parseFloat(match[1]) : 0;
          expect(translateX).to.equal(-100 + increment); // replace 5 with the actual value
        }
      });
  });
});
