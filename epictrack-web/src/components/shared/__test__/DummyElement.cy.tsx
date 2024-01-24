import TriggerOnViewed from "../DummyElement";

describe("TriggerOnViewed component", () => {
  it("calls callback function when visible", () => {
    // Stub the callback function
    const callbackFn = cy.stub().as("callbackFn");

    // Render the component with the stubbed callback function
    cy.mount(<TriggerOnViewed callbackFn={callbackFn} />);

    // Assert that the callback function was called
    cy.get("@callbackFn").should("be.calledOnce");
  });
});
